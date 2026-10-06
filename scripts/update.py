#!/usr/bin/env python3
"""
Vwè Sa — mise à jour quotidienne.

1. Lit les flux RSS déclarés dans config.yaml (en respectant robots.txt).
2. Demande à Claude de choisir les sujets du jour et de rédiger, pour chacun,
   un résumé ORIGINAL à partir des seuls éléments fournis par les flux.
3. Régénère le site dans le dossier docs/ (publié par GitHub Pages).

Usage :
  python scripts/update.py            # mise à jour normale (nécessite ANTHROPIC_API_KEY)
  python scripts/update.py --rebuild  # régénère seulement le site à partir de data/articles.json
"""
import datetime as dt
import hashlib
import html
import json
import os
import re
import sys
import time
import unicodedata
import urllib.robotparser
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "articles.json"
SEEN = ROOT / "data" / "deja_vus.json"
OUT = ROOT / "docs"
TPL = ROOT / "templates"
TZ = dt.timezone(dt.timedelta(hours=-4))  # heure des Antilles
USER_AGENT = "VweSaBot/1.0 (revue de presse; contact via le site)"

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]
JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

PAYS = {  # clé de filtre -> libellé
    "gp": "Guadeloupe", "mq": "Martinique", "gf": "Guyane", "ht": "Haïti",
    "do": "République dominicaine", "jm": "Jamaïque", "cu": "Cuba",
    "tt": "Trinité-et-Tobago", "bb": "Barbade", "lc": "Sainte-Lucie",
    "dm": "Dominique", "bs": "Bahamas", "gd": "Grenade", "sx": "Saint-Martin",
    "bl": "Saint-Barthélemy", "pr": "Porto Rico", "vg": "Îles Vierges",
    "rg": "Région",
}
ILLUSTRATIONS = {
    "haiti": "collines habitées au crépuscule (sujets graves, Haïti, société)",
    "grenada": "baie avec ville à flanc de colline et voiliers (politique d'une île, vie locale)",
    "football": "stade de football de nuit (sport)",
    "bahamas": "vedette sur des hauts-fonds turquoise (mer, garde-côtes, trafic maritime, diplomatie)",
    "tourism": "plage au coucher du soleil avec palmiers (tourisme, loisirs)",
    "drum": "tambour traditionnel sous un projecteur (culture, musique, patrimoine)",
    "drought": "terre craquelée et jeune pousse (sécheresse, climat, agriculture)",
    "plantain": "étal de marché avec bananes plantain (prix, consommation, commerce)",
    "vote": "urne électorale près d'une fenêtre (élections, institutions)",
    "rally": "foule devant une tribune (politique, manifestation, syndicats)",
    "airport": "piste d'aéroport à l'aube (aéroport, défense, sécurité)",
    "tap": "robinet à sec (eau, réseaux, services publics)",
    "cepal": "forêt, rivière et plateforme en mer (économie, ressources, énergie)",
    "flight": "avion au-dessus des nuages (transport aérien, voyages)",
    "pinkrun": "coureurs en rose dans une rue (santé, sport amateur, solidarité)",
    "fires": "poubelle en feu la nuit (incendies, faits divers matériels)",
}


# ───────────────────────── utilitaires ─────────────────────────
def log(*a):
    print("[vwesa]", *a, flush=True)


def load_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def save_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")


def strip_html(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def slugify(s, maxlen=60):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:maxlen].strip("-") or "article"


def date_fr(d):
    return f"{d.day if d.day > 1 else '1er'} {MOIS[d.month - 1]} {d.year}"


def strip_fences(t):
    t = t.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    return t.strip()


# ───────────────────────── 1. lecture des flux ─────────────────────────
_robots = {}


def allowed_by_robots(url):
    """Respecte le fichier robots.txt du site (bonne pratique et preuve de bonne foi)."""
    p = urlparse(url)
    base = f"{p.scheme}://{p.netloc}"
    if base not in _robots:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(base + "/robots.txt")
        try:
            rp.read()
        except Exception:
            rp = None  # robots.txt injoignable : on considère l'accès autorisé
        _robots[base] = rp
    rp = _robots[base]
    return True if rp is None else rp.can_fetch(USER_AGENT, url)


def fetch_feeds(cfg, seen):
    import feedparser
    import requests

    window = dt.timedelta(hours=cfg["edition"]["fenetre_heures"])
    now = dt.datetime.now(dt.timezone.utc)
    items = []
    for f in cfg["flux"]:
        if not allowed_by_robots(f["url"]):
            log("ignoré (robots.txt interdit) :", f["nom"])
            continue
        try:
            r = requests.get(f["url"], timeout=20, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            feed = feedparser.parse(r.content)
        except Exception as e:
            log("flux indisponible :", f["nom"], "→", e)
            continue
        n = 0
        for e in feed.entries:
            link = e.get("link", "")
            if not link:
                continue
            key = hashlib.sha1(link.encode()).hexdigest()[:16]
            if key in seen:
                continue
            t = e.get("published_parsed") or e.get("updated_parsed")
            when = dt.datetime(*t[:6], tzinfo=dt.timezone.utc) if t else now
            if now - when > window:
                continue
            items.append({
                "key": key,
                "source": f["nom"],
                "url": link,
                "titre": strip_html(e.get("title", ""))[:300],
                # Le résumé du flux sert UNIQUEMENT de matière à Claude ; il n'est jamais republié.
                "extrait": strip_html(e.get("summary", ""))[:900],
                "date": when.isoformat(),
            })
            n += 1
        log(f"{f['nom']} : {n} nouvelle(s) info(s)")
        time.sleep(1)  # politesse envers les serveurs
    return items


# ───────────────────────── 2. rédaction avec Claude ─────────────────────────
CHARTE = """Tu es secrétaire de rédaction pour « Vwè Sa », un site d'information sur la Caraïbe.
RÈGLES ABSOLUES (respect du droit français et de la déontologie journalistique) :
1. Tu n'utilises QUE les faits présents dans les éléments fournis. Tu n'inventes jamais un fait, un chiffre, un nom, une date, un lieu ou une déclaration. Si l'information est insuffisante, tu le signales.
2. Tu écris un texte ORIGINAL, avec tes propres mots et ta propre structure. Tu ne recopies jamais de phrases des sources. Aucune citation entre guillemets, sauf au maximum une très courte (moins de 10 mots) d'une déclaration publique officielle, clairement attribuée.
3. Présomption d'innocence : toute personne mise en cause est « suspectée », « mise en examen » ou « soupçonnée », jamais présentée comme coupable avant une condamnation définitive. Utilise le conditionnel pour les faits non établis.
4. Faits divers et justice : ne nomme JAMAIS une victime, un témoin, un suspect ou un mis en cause qui est un simple particulier ; ne donne aucun détail permettant de l'identifier (adresse exacte, plaque, employeur...). Aucun mineur identifiable. Pas de détails macabres ou sensationnalistes.
5. Pas d'opinion, pas de jugement, pas d'insulte, pas de propos discriminatoire. Ton neutre, factuel, sobre.
6. Ne traite pas les sujets touchant à la vie privée, aux rumeurs non confirmées, ni aux sujets dont la source elle-même dit qu'ils ne sont pas vérifiés.
"""


def ask_claude(client, model, system, prompt, max_tokens=2000):
    for attempt in range(3):
        try:
            msg = client.messages.create(
                model=model, max_tokens=max_tokens, system=system,
                messages=[{"role": "user", "content": prompt}],
            )
            text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
            return json.loads(strip_fences(text))
        except json.JSONDecodeError:
            log("réponse non JSON, nouvel essai")
        except Exception as e:
            log("erreur API :", e)
            time.sleep(5 * (attempt + 1))
    return None


def choose_topics(client, model, items, n):
    listing = "\n".join(
        f"[{i}] ({it['source']}) {it['titre']} — {it['extrait'][:250]}" for i, it in enumerate(items)
    )
    prompt = f"""Voici les informations publiées récemment par plusieurs médias.

{listing}

Choisis jusqu'à {n} SUJETS pour l'édition du jour d'un site d'actualité caribéenne :
- privilégie l'intérêt public (politique, économie, société, environnement, santé, culture, sport) et la diversité des îles ;
- regroupe dans un même sujet les informations qui parlent du même événement ;
- écarte : les faits divers centrés sur des particuliers, les rumeurs, les contenus promotionnels, la vie privée, les sujets dont l'extrait est trop vague.

Réponds UNIQUEMENT en JSON, sans texte autour :
{{"sujets": [{{"items": [indices], "importance": 1-10}}]}}"""
    res = ask_claude(client, model, CHARTE, prompt, 1500)
    return (res or {}).get("sujets", [])


def write_article(client, model, group):
    sources = "\n\n".join(
        f"SOURCE : {it['source']}\nTITRE : {it['titre']}\nRÉSUMÉ DU FLUX : {it['extrait']}" for it in group
    )
    ill = "\n".join(f"- {k} : {v}" for k, v in ILLUSTRATIONS.items())
    pays = ", ".join(f"{k} = {v}" for k, v in PAYS.items())
    prompt = f"""Rédige une brève d'actualité en français à partir de ces éléments, et d'eux seuls.

{sources}

Contraintes :
- 90 à 180 mots au total dans "body", en 2 ou 3 paragraphes courts ; si les éléments ne permettent pas d'écrire au moins 60 mots sans rien inventer, réponds {{"skip": true}}.
- titre informatif de moins de 110 caractères, sans point d'exclamation ni effet racoleur ;
- "chapo" : une phrase qui résume l'essentiel ;
- n'invente rien : pas de contexte que tu « connaîtrais » par ailleurs, seulement ce qui est écrit ci-dessus.

Codes pays possibles : {pays}
Illustrations possibles :
{ill}

Réponds UNIQUEMENT en JSON, sans texte autour :
{{"title": "...", "chapo": "...", "body": ["paragraphe 1", "paragraphe 2"],
  "r": ["code pays principal", "autre code éventuel"], "pays": "libellé lisible du lieu",
  "rub": "rubrique (Politique, Économie, Société, Santé, Environnement, Culture, Sport, Justice, Transports...)",
  "ill": "clé d'illustration", "cap": "Illustration : courte description de l'image choisie.",
  "photo_ok": true, "photo_q": ["requête précise en anglais", "requête plus générale en anglais"]}}

Pour la photo d'illustration (recherchée dans des banques d'images libres) :
- "photo_q" : 2 requêtes courtes EN ANGLAIS décrivant un LIEU, un PAYSAGE ou un OBJET lié au sujet
  (ex. "Fort-de-France bay", "plantain bunch market", "ballot box"). JAMAIS une personne, un visage, une foule ou un événement précis.
- "photo_ok" : false si le sujet concerne un fait divers, la justice, un accident, des victimes, la santé d'une personne,
  ou tout sujet où une photo pourrait laisser croire qu'elle montre les personnes ou les faits réels."""
    return ask_claude(client, model, CHARTE, prompt, 1500)


def validate(a):
    """Contrôles automatiques avant publication."""
    if not a or a.get("skip"):
        return False
    need = ["title", "chapo", "body", "r", "pays", "rub", "ill"]
    if any(not a.get(k) for k in need) or not isinstance(a["body"], list):
        return False
    a["r"] = [r for r in a["r"] if r in PAYS] or ["rg"]
    if a["ill"] not in ILLUSTRATIONS:
        a["ill"] = "haiti" if "ht" in a["r"] else "grenada"
    a["cap"] = a.get("cap") or "Illustration originale de Vwè Sa."
    q = a.get("photo_q")
    a["photo_q"] = [x for x in q if isinstance(x, str) and x.strip()][:3] if isinstance(q, list) else []
    sensibles = ("fait", "justice", "accident", "police", "sécurité", "securite", "drame", "crime")
    a["photo_ok"] = bool(a.get("photo_ok", True)) and not any(m in a["rub"].lower() for m in sensibles)
    # Pas de longues citations : on refuse tout passage entre guillemets de plus de 15 mots.
    for q in re.findall(r"«([^»]+)»|\"([^\"]+)\"", " ".join(a["body"])):
        txt = q[0] or q[1]
        if len(txt.split()) > 15:
            return False
    a["body"] = [p.strip() for p in a["body"] if p.strip()][:4]
    return True


def run_update(cfg):
    import anthropic

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY manquante (à ajouter dans les secrets GitHub).")
    client = anthropic.Anthropic()
    model = cfg["edition"]["modele"]

    seen = set(load_json(SEEN, []))
    items = fetch_feeds(cfg, seen)
    log(len(items), "information(s) candidates")
    if not items:
        return []
    items = items[:80]

    topics = choose_topics(client, model, items, cfg["edition"]["articles_par_jour"])
    now = dt.datetime.now(TZ)
    new = []
    for t in sorted(topics, key=lambda x: -x.get("importance", 0)):
        group = [items[i] for i in t.get("items", []) if isinstance(i, int) and 0 <= i < len(items)]
        if not group:
            continue
        a = write_article(client, model, group)
        if not validate(a):
            log("sujet écarté (contrôles non passés) :", group[0]["titre"][:70])
            continue
        words = sum(len(p.split()) for p in a["body"])
        a.update({
            "id": f"{now:%Y%m%d}-{slugify(a['title'])}",
            "date": date_fr(now),
            "iso": now.date().isoformat(),
            "min": max(1, round(words / 200)),
            "score": t.get("importance", 5),
            "sources": [{"name": it["source"], "url": it["url"]} for it in group],
            "ai": True,
        })
        new.append(a)
        log("✓", a["title"])
        seen.update(it["key"] for it in group)

    # mémorise aussi les infos lues mais non retenues, pour ne pas les re-proposer
    seen.update(it["key"] for it in items)
    save_json(SEEN, sorted(seen)[-5000:])
    return new


# ───────────────────────── 2 bis. photos libres de droits ─────────────────────────
# Les photos viennent de Wikimedia Commons (licences libres, sans clé) et, si vous avez
# ajouté une clé PEXELS_API_KEY, de Pexels. Elles sont TÉLÉCHARGÉES dans docs/img/ :
# aucun lecteur n'est donc connecté à un site tiers (respect du RGPD), et chaque photo
# est créditée (auteur, licence, lien) comme l'exigent les licences Creative Commons.
IMG_DIR = OUT / "img"
LICENCES_OK = ("cc0", "public domain", "domaine public", "pd", "cc by", "cc-by")
MOTS_PERSONNES = ("portrait", "people", "person", "woman", "women", " man ", " men ", "girl", "boy",
                  "child", "children", "crowd", "face", "selfie", "femme", "homme", "enfant", "foule")


def _clean(s):
    return strip_html(s or "")[:120]


def commons_search(query, ua):
    import requests
    r = requests.get("https://commons.wikimedia.org/w/api.php", timeout=20, headers={"User-Agent": ua}, params={
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": f"{query} filetype:bitmap", "gsrlimit": 15,
        "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1280,
    })
    pages = sorted(r.json().get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    for pg in pages:
        info = (pg.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        lic = _clean(meta.get("LicenseShortName", {}).get("value", "")).lower()
        if info.get("mime") not in ("image/jpeg", "image/png") or info.get("width", 0) < 900:
            continue
        if info.get("width", 1) < info.get("height", 1):  # on garde les formats paysage
            continue
        if not any(l in lic for l in LICENCES_OK) or "nc" in lic.split("-") or "nd" in lic.split("-"):
            continue
        blob = " " + (pg.get("title", "") + " " + _clean(meta.get("Categories", {}).get("value", "")) + " "
                      + _clean(meta.get("ImageDescription", {}).get("value", ""))).lower() + " "
        if any(w in blob for w in MOTS_PERSONNES):
            continue
        return {
            "url": info.get("thumburl") or info["url"],
            "credit": _clean(meta.get("Artist", {}).get("value", "")) or "Auteur inconnu",
            "license": _clean(meta.get("LicenseShortName", {}).get("value", "")),
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
            "page": info.get("descriptionurl", ""),
            "source": "Wikimedia Commons",
        }
    return None


def pexels_search(query, key):
    import requests
    r = requests.get("https://api.pexels.com/v1/search", timeout=20, headers={"Authorization": key},
                     params={"query": query, "per_page": 10, "orientation": "landscape"})
    for ph in r.json().get("photos", []):
        alt = " " + (ph.get("alt") or "").lower() + " "
        if any(w in alt for w in MOTS_PERSONNES):
            continue
        return {"url": ph["src"]["large"], "credit": ph.get("photographer", "Pexels"),
                "license": "Licence Pexels", "license_url": "https://www.pexels.com/fr-fr/license/",
                "page": ph.get("url", ""), "source": "Pexels"}
    return None


def ensure_images(cfg, articles):
    """Ajoute une photo libre aux articles qui n'en ont pas encore."""
    try:
        import requests
    except ImportError:
        log("module requests absent : photos ignorées")
        return
    ua = f"VweSaBot/1.0 ({cfg['site'].get('url', '')}; {cfg['site'].get('email_contact', '')})"
    pexels = os.environ.get("PEXELS_API_KEY")
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    for a in articles:
        if a.get("img") or a.get("img_tried") or not a.get("photo_ok", True) or not a.get("photo_q"):
            continue
        found, error = None, False
        for q in a["photo_q"][:3]:
            try:
                found = commons_search(q, ua) or (pexels and pexels_search(q, pexels))
            except Exception as e:
                log("recherche photo impossible :", e)
                error = True
            if found:
                break
            time.sleep(1)
        if not error:
            a["img_tried"] = True  # on ne réessaie pas indéfiniment un sujet sans photo
        if not found:
            log("pas de photo libre trouvée :", a["title"][:60], "→ illustration dessinée")
            continue
        try:
            r = requests.get(found["url"], timeout=30, headers={"User-Agent": ua})
            r.raise_for_status()
            ext = ".png" if "png" in r.headers.get("content-type", "") else ".jpg"
            name = f"{a['id'][:70]}{ext}"
            (IMG_DIR / name).write_bytes(r.content)
            found["src"] = f"img/{name}"
            del found["url"]
            a["img"] = found
            log("📷", found["source"], "→", a["title"][:60])
        except Exception as e:
            log("téléchargement photo impossible :", e)
        time.sleep(1)


# ───────────────────────── 3. génération du site ─────────────────────────
def build_site(cfg, articles):
    keep = dt.date.today() - dt.timedelta(days=cfg["edition"]["jours_archives"])
    articles = [a for a in articles if dt.date.fromisoformat(a.get("iso", "2000-01-01")) >= keep] or articles[:20]
    articles.sort(key=lambda a: (a.get("iso", ""), a.get("score", 0)), reverse=True)

    # mise en page : 1 article à la une, 3 en second plan, la culture à part, le reste en liste
    for a in articles:
        a["place"] = "news"
    if articles:
        articles[0]["place"] = "lead"
    side = [a for a in articles[1:] if a["place"] == "news"][:3]
    for a in side:
        a["place"] = "side"
    for a in articles:
        if a["place"] == "news" and a["rub"].lower() in ("culture", "musique", "patrimoine", "arts"):
            a["place"] = "culture"

    now = dt.datetime.now(TZ)
    s = cfg["site"]
    page = (TPL / "index.html").read_text(encoding="utf-8")
    repl = {
        "%%NOM%%": html.escape(s["nom"]),
        "%%SLOGAN%%": html.escape(s["slogan"]),
        "%%DATE%%": f"{JOURS[now.weekday()].capitalize()} {date_fr(now)}",
        "%%EMAIL%%": html.escape(s["email_contact"]),
        "%%MAJ%%": now.strftime("%d/%m/%Y à %Hh%M") + " (heure des Antilles)",
        "%%SCENES%%": (TPL / "scenes.js").read_text(encoding="utf-8"),
        "%%DATA%%": "var ARTICLES=" + json.dumps(articles, ensure_ascii=False).replace("</", "<\\/") + ";",
        "%%PAYS%%": json.dumps(PAYS, ensure_ascii=False),
    }
    for k, v in repl.items():
        page = page.replace(k, v)
    OUT.mkdir(exist_ok=True)
    (OUT / "index.html").write_text(page, encoding="utf-8")
    used = {a["img"]["src"].split("/")[-1] for a in articles if a.get("img")}
    if IMG_DIR.exists():
        for f in IMG_DIR.iterdir():
            if f.name not in used:
                f.unlink()

    m = cfg["mentions_legales"]
    legal = (TPL / "mentions-legales.html").read_text(encoding="utf-8")
    for k, v in {**{f"%%{k.upper()}%%": html.escape(str(v)) for k, v in m.items()},
                 "%%NOM%%": html.escape(s["nom"]), "%%EMAIL%%": html.escape(s["email_contact"]),
                 "%%URL%%": html.escape(s["url"])}.items():
        legal = legal.replace(k, v)
    (OUT / "mentions-legales.html").write_text(legal, encoding="utf-8")
    (OUT / ".nojekyll").write_text("")
    log("site généré :", len(articles), "articles")


def main():
    cfg = yaml.safe_load((ROOT / "config.yaml").read_text(encoding="utf-8"))
    articles = load_json(DATA, [])
    if "--rebuild" not in sys.argv:
        new = run_update(cfg)
        ids = {a["id"] for a in articles}
        articles = [a for a in new if a["id"] not in ids] + articles
    ensure_images(cfg, articles[:60])
    save_json(DATA, articles[:300])
    build_site(cfg, articles)


if __name__ == "__main__":
    main()
