var ILL = (function(){
var uid = 0;
function rnd(seed){ var s = seed; return function(){ s = (s*16807) % 2147483647; return (s-1)/2147483646; }; }
function lg(id, x1,y1,x2,y2, st){ return '<linearGradient id="'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">'+st.map(function(s){return '<stop offset="'+s[0]+'" stop-color="'+s[1]+'"'+(s[2]!=null?' stop-opacity="'+s[2]+'"':'')+'/>';}).join('')+'</linearGradient>'; }
function rg(id, cx,cy,r, st){ return '<radialGradient id="'+id+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'">'+st.map(function(s){return '<stop offset="'+s[0]+'" stop-color="'+s[1]+'"'+(s[2]!=null?' stop-opacity="'+s[2]+'"':'')+'/>';}).join('')+'</radialGradient>'; }
function palm(x,y,h,c,lean){
  var tx = x+lean, ty = y-h, o = '<path d="M'+x+' '+y+' Q'+(x+lean*0.2)+' '+(y-h*0.6)+' '+tx+' '+ty+'" stroke="'+c+'" stroke-width="'+(h*0.05)+'" fill="none" stroke-linecap="round"/>';
  [[-1,0.15],[-0.9,-0.35],[-0.4,-0.6],[0.3,-0.65],[0.85,-0.3],[1,0.2],[0.55,0.45],[-0.55,0.45]].forEach(function(d){
    var ex = tx + d[0]*h*0.55, ey = ty + d[1]*h*0.4 + h*0.12;
    var mx = tx + d[0]*h*0.3, my = ty + d[1]*h*0.35 - h*0.06;
    o += '<path d="M'+tx+' '+ty+' Q'+mx+' '+my+' '+ex+' '+ey+'" stroke="'+c+'" stroke-width="'+(h*0.045)+'" fill="none" stroke-linecap="round"/>';
    o += '<path d="M'+tx+' '+ty+' Q'+mx+' '+(my+h*0.05)+' '+ex+' '+ey+'" stroke="'+c+'" stroke-width="'+(h*0.02)+'" fill="none" stroke-dasharray="2 5" stroke-linecap="round"/>';
  });
  return o;
}
function plane(x,y,s,c,rot){ return '<g transform="translate('+x+' '+y+') rotate('+(rot||0)+') scale('+s+')" fill="'+c+'"><path d="M-60 0 Q-58 -5 -40 -6 L50 -5 Q66 -4 70 0 Q66 4 50 5 L-40 6 Q-58 5 -60 0Z"/><path d="M-5 -5 L20 -5 L-10 -48 L-22 -48Z"/><path d="M-5 5 L20 5 L-10 48 L-22 48Z"/><path d="M-48 -3 L-38 -3 L-50 -24 L-58 -24Z"/><path d="M-48 3 L-38 3 L-50 18 L-56 18Z" opacity=".8"/></g>'; }
function runner(x,y,s,c,ph){
  var a = ph ? 1 : -1;
  return '<g transform="translate('+x+' '+y+') scale('+s+')" stroke="'+c+'" stroke-linecap="round" fill="none"><circle cx="0" cy="-92" r="9" fill="'+c+'" stroke="none"/><path d="M0 -80 L-6 -40" stroke-width="13"/><path d="M-6 -40 L'+(10*a)+' -16 L'+(4*a)+' 8" stroke-width="9"/><path d="M-6 -40 L'+(-18*a)+' -18 L'+(-30*a)+' -4" stroke-width="9"/><path d="M-2 -74 L'+(16*a)+' -60 L'+(26*a)+' -72" stroke-width="7"/><path d="M-2 -74 L'+(-16*a)+' -58 L'+(-12*a)+' -44" stroke-width="7"/></g>';
}
function wrap(defs, body){ return '<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>'+defs+'</defs>'+body+'<rect width="800" height="450" filter="url(#vs-grain)" opacity=".16"/><rect width="800" height="450" fill="url(#vs-vig)"/></svg>'; }

var S = {};

S.haiti = function(p){
  var R = rnd(7), d = lg(p+'sky',0,0,0,1,[[0,'#1C2547'],[.45,'#5E3B66'],[.78,'#D9705A'],[1,'#F2B068']])
    + rg(p+'sun','50%','50%','50%',[[0,'#FFE6B8',1],[.25,'#FFC27A',.8],[1,'#FF9A5A',0]])
    + lg(p+'haze',0,0,0,1,[[0,'#E59A7A',0],[1,'#E59A7A',.55]])
    + lg(p+'far',0,0,0,1,[[0,'#7D5672'],[1,'#5B4566']])
    + lg(p+'mid',0,0,0,1,[[0,'#3F3557'],[1,'#2C2944']])
    + lg(p+'near',0,0,0,1,[[0,'#211F35'],[1,'#141325']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><circle cx="560" cy="215" r="210" fill="url(#'+p+'sun)"/><circle cx="560" cy="215" r="34" fill="#FFE9C2"/>'
    + '<path d="M0 230 L90 170 L170 205 L260 140 L360 200 L450 160 L560 215 L660 150 L800 210 V450 H0Z" fill="url(#'+p+'far)"/>'
    + '<rect y="170" width="800" height="90" fill="url(#'+p+'haze)"/>'
    + '<path d="M0 290 Q120 230 230 262 T460 250 T680 236 T800 258 V450 H0Z" fill="url(#'+p+'mid)"/>';
  for (var i=0;i<70;i++){ var x = R()*800, y = 262 + R()*120 + (Math.abs(x-400)/400)*-10, w = 10+R()*14, h = 7+R()*8;
    b += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="#2A2742"/>';
    if (R()>0.35) b += '<rect x="'+(x+w*0.3).toFixed(1)+'" y="'+(y+h*0.3).toFixed(1)+'" width="3" height="3" fill="#FFC86E" opacity="'+(0.6+R()*0.4).toFixed(2)+'"/>';
  }
  b += '<path d="M0 360 Q200 320 400 350 T800 335 V450 H0Z" fill="url(#'+p+'near)"/>' + palm(90,450,190,'#0E0D1C',-30) + palm(720,450,160,'#0E0D1C',25) + palm(650,450,120,'#121124',10);
  return wrap(d,b);
};

S.grenada = function(p){
  var R = rnd(11), d = lg(p+'sky',0,0,0,1,[[0,'#7DB8DE'],[1,'#DDEFF5']])
    + lg(p+'sea',0,0,0,1,[[0,'#2C9AA6'],[1,'#0D4E62']])
    + lg(p+'hill',0,0,0,1,[[0,'#5E8F63'],[1,'#3E6A47']])
    + lg(p+'far',0,0,0,1,[[0,'#8FB2A4'],[1,'#7FA696']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><ellipse cx="200" cy="80" rx="140" ry="22" fill="#fff" opacity=".55" filter="url(#vs-b10)"/><ellipse cx="620" cy="60" rx="110" ry="18" fill="#fff" opacity=".5" filter="url(#vs-b10)"/>'
    + '<path d="M0 170 Q150 110 300 150 T560 120 T800 160 V300 H0Z" fill="url(#'+p+'far)"/>'
    + '<path d="M0 220 Q140 150 330 190 Q480 215 560 300 H0Z" fill="url(#'+p+'hill)"/>';
  var cols = ['#F4EDE0','#F2D8A8','#E9B9A0','#CFE1D8','#F6F1E6','#E7C9C2'];
  for (var i=0;i<90;i++){ var x = R()*520, top = 200 - 50*Math.sin(Math.PI*x/600) + 12, y = top + R()*(300-top-14), w = 14+R()*12, h = 10+R()*8;
    b += '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+cols[i%6]+'"/><polygon points="'+(x-2).toFixed(1)+','+y.toFixed(1)+' '+(x+w/2).toFixed(1)+','+(y-6).toFixed(1)+' '+(x+w+2).toFixed(1)+','+y.toFixed(1)+'" fill="'+(R()>.25?'#B2442E':'#8B3A2A')+'"/>';
    if (R()>.5) b += '<rect x="'+(x+3).toFixed(1)+'" y="'+(y+4).toFixed(1)+'" width="3" height="4" fill="#5A4A40" opacity=".6"/>';
  }
  b += '<rect y="290" width="800" height="160" fill="url(#'+p+'sea)"/>';
  for (var j=0;j<40;j++){ var yy = 300+R()*140, xx = R()*800; b += '<path d="M'+xx.toFixed(0)+' '+yy.toFixed(0)+' h'+(20+R()*60).toFixed(0)+'" stroke="#BFEFF0" stroke-width="1.5" opacity="'+(.2+R()*.4).toFixed(2)+'"/>'; }
  b += '<rect y="292" width="560" height="22" fill="#3E6A47" opacity=".35" filter="url(#vs-b4)"/>';
  [[600,350,1],[680,395,1.3],[470,410,1.1]].forEach(function(t){ b += '<g transform="translate('+t[0]+' '+t[1]+') scale('+t[2]+')"><path d="M-40 0 H40 L30 12 H-30Z" fill="#F7F4EE"/><path d="M-30 12 H30" stroke="#0D4E62" stroke-width="3" opacity=".4"/><path d="M0 0 V-60" stroke="#E8E2D6" stroke-width="2"/><path d="M2 -58 L30 -6 H2Z" fill="#fff" opacity=".9"/><path d="M-40 16 H40" stroke="#fff" stroke-width="2" opacity=".35"/></g>'; });
  return wrap(d,b);
};

S.football = function(p){
  var R = rnd(5), d = lg(p+'sky',0,0,0,1,[[0,'#04070F'],[1,'#141C33']])
    + rg(p+'flood','50%','50%','50%',[[0,'#FFFFFF',1],[.15,'#F4F7FF',.8],[1,'#B9C8FF',0]])
    + lg(p+'stand',0,0,0,1,[[0,'#1A2236'],[1,'#33405E']])
    + lg(p+'pitch',0,0,0,1,[[0,'#24683A'],[1,'#3E9A52']])
    + rg(p+'ball','38%','32%','70%',[[0,'#FFFFFF'],[.6,'#E4E6EA'],[1,'#8D939C']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/>';
  [[120,40],[680,40]].forEach(function(f){ b += '<circle cx="'+f[0]+'" cy="'+f[1]+'" r="170" fill="url(#'+p+'flood)" opacity=".55"/><rect x="'+(f[0]-26)+'" y="'+(f[1]-10)+'" width="52" height="20" fill="#E9EEFF"/><path d="M'+f[0]+' '+(f[1]+10)+' V200" stroke="#0B1020" stroke-width="5"/>'; });
  b += '<path d="M0 120 L800 120 L800 250 L0 250Z" fill="url(#'+p+'stand)"/>';
  var cc = ['#C8283C','#1F4FA0','#F2F2F2','#E8C547','#C8283C','#1F4FA0'];
  for (var i=0;i<900;i++){ var x = R()*800, y = 128+R()*118; b += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(1.2+R()*1.6).toFixed(1)+'" fill="'+cc[i%6]+'" opacity="'+(.35+R()*.5).toFixed(2)+'"/>'; }
  b += '<rect x="0" y="244" width="800" height="10" fill="#0B1020"/><path d="M0 450 L0 260 L800 260 L800 450Z" fill="url(#'+p+'pitch)"/>';
  for (var k=0;k<8;k++){ var x1 = k*100; b += '<path d="M'+x1+' 260 L'+(x1+50)+' 260 L'+((x1+50-400)*1.9+400)+' 450 L'+((x1-400)*1.9+400)+' 450Z" fill="#000" opacity=".07"/>'; }
  b += '<ellipse cx="400" cy="330" rx="150" ry="32" fill="none" stroke="#fff" stroke-width="3" opacity=".75"/><path d="M400 260 V450" stroke="#fff" stroke-width="3" opacity=".75"/><path d="M0 262 H800" stroke="#fff" stroke-width="3" opacity=".6"/>';
  b += '<ellipse cx="585" cy="428" rx="50" ry="10" fill="#000" opacity=".45" filter="url(#vs-b4)"/><circle cx="580" cy="390" r="38" fill="url(#'+p+'ball)"/>'
    + '<path d="M580 372 L594 382 L589 398 L571 398 L566 382Z" fill="#1E2430"/><path d="M548 380 L557 372 L566 382 M594 382 L606 372 L614 386 M571 398 L566 414 M589 398 L596 414" stroke="#1E2430" stroke-width="3" fill="none"/><path d="M552 400 Q560 418 578 424" stroke="#1E2430" stroke-width="3" fill="none" opacity=".5"/>';
  return wrap(d,b);
};

S.bahamas = function(p){
  var d = lg(p+'deep',0,0,1,1,[[0,'#8BE3D8'],[.4,'#2BB3BE'],[.75,'#127F99'],[1,'#0A4F72']])
    + lg(p+'sand',0,0,1,1,[[0,'#FFF5DC'],[1,'#EBD7A6']])
    + lg(p+'hull',0,0,0,1,[[0,'#FFFFFF'],[1,'#C9D2D8']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'deep)"/>'
    + '<path d="M-20 60 Q200 20 380 120 T820 160 V-20 H-20Z" fill="#C8F4EA" opacity=".8" filter="url(#vs-b10)"/>'
    + '<path d="M-20 40 Q190 10 360 90 T820 120 V-20 H-20Z" fill="url(#'+p+'sand)"/>'
    + '<path d="M-20 40 Q190 10 360 90 T820 120" stroke="#fff" stroke-width="5" fill="none" opacity=".7" filter="url(#vs-b2)"/>'
    + '<ellipse cx="170" cy="280" rx="90" ry="40" fill="#0D5E6E" opacity=".45" filter="url(#vs-b10)"/><ellipse cx="660" cy="360" rx="120" ry="45" fill="#0A4F62" opacity=".45" filter="url(#vs-b10)"/><ellipse cx="300" cy="400" rx="60" ry="25" fill="#0D5E6E" opacity=".4" filter="url(#vs-b10)"/>';
  for (var i=0;i<14;i++){ b += '<path d="M'+(i*70-40)+' '+(200+i*8)+' q35 -8 70 0" stroke="#E6FFFB" stroke-width="2" fill="none" opacity=".18"/>'; }
  b += '<g transform="translate(470 250) rotate(-28)"><path d="M-190 0 L-20 -22 M-190 0 L-20 22" stroke="#fff" stroke-width="10" opacity=".35" filter="url(#vs-b4)"/><path d="M-260 0 L-20 -30 M-260 0 L-20 30" stroke="#fff" stroke-width="4" opacity=".25" filter="url(#vs-b2)"/>'
    + '<ellipse cx="6" cy="8" rx="58" ry="20" fill="#053A4A" opacity=".35" filter="url(#vs-b4)"/><path d="M-50 -16 L40 -16 Q70 0 40 16 L-50 16Z" fill="url(#'+p+'hull)"/><rect x="-20" y="-10" width="28" height="20" rx="3" fill="#24394A"/><rect x="-14" y="-7" width="12" height="14" fill="#7FB9CF" opacity=".8"/><path d="M-50 -16 L40 -16" stroke="#B3203A" stroke-width="3"/></g>';
  return wrap(d,b);
};

S.tourism = function(p){
  var d = lg(p+'sky',0,0,0,1,[[0,'#3C5C9A'],[.5,'#E98A6B'],[1,'#F9D18B']])
    + rg(p+'sun','50%','50%','50%',[[0,'#FFF1C9',1],[.3,'#FFC981',.7],[1,'#FF9D6A',0]])
    + lg(p+'sea',0,0,0,1,[[0,'#C7798A'],[.3,'#4C6F9A'],[1,'#1B3B5F']])
    + lg(p+'sand',0,0,0,1,[[0,'#C8916A'],[1,'#7A4E36']])
    + lg(p+'mtn',0,0,0,1,[[0,'#6E6491'],[1,'#8C7799']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><circle cx="430" cy="250" r="220" fill="url(#'+p+'sun)"/><circle cx="430" cy="250" r="44" fill="#FFF0CC"/>'
    + '<path d="M0 255 Q120 200 240 225 T470 215 T700 200 L800 220 V262 H0Z" fill="url(#'+p+'mtn)" opacity=".8"/>'
    + '<rect y="258" width="800" height="120" fill="url(#'+p+'sea)"/>'
    + '<path d="M360 262 L500 262 L470 375 L390 375Z" fill="#FFD9A0" opacity=".35" filter="url(#vs-b10)"/>';
  for (var i=0;i<18;i++){ b += '<path d="M'+(380+((i*37)%80))+' '+(268+i*6)+' h'+(30+(i%5)*12)+'" stroke="#FFE7B8" stroke-width="2" opacity=".6"/>'; }
  b += '<path d="M0 360 Q300 330 800 372 V450 H0Z" fill="url(#'+p+'sand)"/><path d="M0 360 Q300 330 800 372" stroke="#FFE3C2" stroke-width="3" fill="none" opacity=".5" filter="url(#vs-b2)"/>'
    + palm(110,450,300,'#1A1424',40) + palm(200,450,230,'#1F1829',-20) + palm(720,450,260,'#1A1424',-35)
    + '<path d="M560 420 L580 340" stroke="#2A1E2C" stroke-width="4"/><path d="M520 345 Q580 300 640 345Z" fill="#2A1E2C"/><rect x="590" y="410" width="80" height="8" fill="#2A1E2C"/>';
  return wrap(d,b);
};

S.drum = function(p){
  var d = rg(p+'bg','50%','40%','75%',[[0,'#4A2A15'],[.6,'#1E100A'],[1,'#090404']])
    + lg(p+'cone',0,0,0,1,[[0,'#FFE3B0',.35],[1,'#FFE3B0',0]])
    + lg(p+'wood',0,0,1,0,[[0,'#3A1F0E'],[.25,'#8A5427'],[.45,'#C0803F'],[.6,'#93592A'],[1,'#2E180B']])
    + lg(p+'skin',0,0,1,1,[[0,'#F6E5C0'],[.6,'#D9B983'],[1,'#B38C55']])
    + rg(p+'floor','50%','50%','50%',[[0,'#B5652A',.55],[1,'#B5652A',0]]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'bg)"/><path d="M330 -10 L470 -10 L640 450 L160 450Z" fill="url(#'+p+'cone)" filter="url(#vs-b10)"/>'
    + '<ellipse cx="400" cy="400" rx="260" ry="50" fill="url(#'+p+'floor)"/><ellipse cx="410" cy="402" rx="120" ry="18" fill="#000" opacity=".55" filter="url(#vs-b4)"/>'
    + '<path d="M300 130 L500 130 L476 395 L324 395Z" fill="url(#'+p+'wood)"/>';
  for (var i=1;i<8;i++){ var xt = 300+i*25, xb = 324+i*19; b += '<path d="M'+xt+' 130 L'+xb+' 395" stroke="#1E0F06" stroke-width="2" opacity=".55"/>'; }
  [175,255,345].forEach(function(y){ var k=(y-130)/265, l = 300+24*k, r = 500-24*k; b += '<path d="M'+l.toFixed(1)+' '+y+' L'+r.toFixed(1)+' '+y+'" stroke="#2A2A2A" stroke-width="9"/><path d="M'+l.toFixed(1)+' '+(y-3)+' L'+r.toFixed(1)+' '+(y-3)+'" stroke="#9AA0A6" stroke-width="2" opacity=".6"/>'; });
  var z = 'M304 140'; for (var j=0;j<10;j++){ z += ' L'+(310+j*20)+' '+(j%2?140:185); } b += '<path d="'+z+'" stroke="#E7D3A6" stroke-width="3" fill="none" opacity=".85"/>';
  b += '<ellipse cx="400" cy="130" rx="102" ry="24" fill="url(#'+p+'skin)"/><ellipse cx="400" cy="130" rx="102" ry="24" fill="none" stroke="#3A1F0E" stroke-width="5"/><ellipse cx="380" cy="124" rx="40" ry="8" fill="#fff" opacity=".25" filter="url(#vs-b4)"/>'
    + '<rect x="370" y="372" width="60" height="10" rx="5" fill="#5FD4FF"/><rect x="360" y="366" width="80" height="22" rx="11" fill="#5FD4FF" opacity=".55" filter="url(#vs-b10)"/>';
  [60,100,140].forEach(function(r,i){ b += '<path d="M'+(520+i*6)+' '+(240-r*0.6)+' Q'+(520+r)+' 240 '+(520+i*6)+' '+(240+r*0.6)+'" stroke="#FFCF8A" stroke-width="3" fill="none" opacity="'+(0.6-i*0.15)+'" stroke-linecap="round"/><path d="M'+(280-i*6)+' '+(240-r*0.6)+' Q'+(280-r)+' 240 '+(280-i*6)+' '+(240+r*0.6)+'" stroke="#FFCF8A" stroke-width="3" fill="none" opacity="'+(0.6-i*0.15)+'" stroke-linecap="round"/>'; });
  return wrap(d,b);
};

S.drought = function(p){
  var R = rnd(3), d = lg(p+'sky',0,0,0,1,[[0,'#E9C27F'],[.6,'#F6DFAE'],[1,'#F9E9C6']])
    + rg(p+'sun','50%','50%','50%',[[0,'#FFFDF2',1],[.2,'#FFF2C4',.9],[1,'#FFD27A',0]])
    + lg(p+'ground',0,0,0,1,[[0,'#C9A06A'],[.4,'#B4854E'],[1,'#7D5530']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><circle cx="600" cy="90" r="230" fill="url(#'+p+'sun)"/>'
    + '<path d="M0 205 Q200 190 400 200 T800 195 V230 H0Z" fill="#A99377" opacity=".6" filter="url(#vs-b4)"/>'
    + '<rect y="210" width="800" height="240" fill="url(#'+p+'ground)"/>';
  for (var r=0;r<9;r++){ var y = 215 + Math.pow(r/9,1.8)*235, step = 30 + r*14;
    for (var x=-20; x<820; x+= step){ var jx = x + (R()-0.5)*step*0.5, h = 6 + r*4;
      b += '<path d="M'+jx.toFixed(0)+' '+y.toFixed(0)+' l'+((R()-.5)*step*0.4).toFixed(0)+' '+h.toFixed(0)+' l'+((R()-.5)*step*0.3).toFixed(0)+' '+(h*0.9).toFixed(0)+'" stroke="#5C3A1C" stroke-width="'+(0.6+r*0.35).toFixed(1)+'" fill="none" opacity=".75"/>';
      b += '<path d="M'+jx.toFixed(0)+' '+y.toFixed(0)+' h'+step.toFixed(0)+'" stroke="#5C3A1C" stroke-width="'+(0.5+r*0.3).toFixed(1)+'" opacity=".6"/>';
    }
  }
  b += '<path d="M120 300 Q100 230 150 200 M150 200 Q120 215 105 250 M150 200 Q175 230 168 262" stroke="#7C6A3C" stroke-width="4" fill="none" opacity=".8"/>'
    + '<ellipse cx="420" cy="398" rx="40" ry="8" fill="#3A2412" opacity=".45" filter="url(#vs-b2)"/><path d="M420 398 Q418 360 424 340" stroke="#3E7A34" stroke-width="5" fill="none"/>'
    + '<path d="M423 352 Q396 330 380 338 Q398 360 423 352Z" fill="#5BA548"/><path d="M424 344 Q450 316 470 324 Q452 350 424 344Z" fill="#6DBA56"/><path d="M425 345 Q446 330 462 328" stroke="#A8E08C" stroke-width="1.5" fill="none"/>';
  return wrap(d,b);
};

S.plantain = function(p){
  var d = lg(p+'bg',0,0,0,1,[[0,'#2C1E14'],[1,'#5A3D25']])
    + lg(p+'table',0,0,0,1,[[0,'#9C6A3A'],[1,'#5E3A1C']])
    + lg(p+'pg',0,0,1,0,[[0,'#4F6B1E'],[.35,'#8EA83A'],[.7,'#C9B640'],[1,'#7B6A20']])
    + lg(p+'py',0,0,1,0,[[0,'#8A6A16'],[.4,'#E2BE45'],[.75,'#F2D36A'],[1,'#A07E22']])
    + lg(p+'light',0,0,1,1,[[0,'#FFE6B0',.4],[1,'#FFE6B0',0]]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'bg)"/>';
  for (var s=0;s<10;s++){ b += '<path d="M'+(s*80)+' 0 h80 v54 q-40 18 -80 0Z" fill="'+(s%2?'#F1E7D6':'#B3203A')+'"/>'; }
  b += '<rect y="54" width="800" height="14" fill="#000" opacity=".35" filter="url(#vs-b4)"/><path d="M0 70 L520 70 L800 300 L800 70Z" fill="url(#'+p+'light)"/>'
    + '<path d="M0 330 L800 300 V450 H0Z" fill="url(#'+p+'table)"/>';
  for (var g=0; g<12; g++){ b += '<path d="M0 '+(340+g*10)+' L800 '+(310+g*12)+'" stroke="#3E2510" stroke-width="1" opacity=".35"/>'; }
  function bunch(cx, cy, n, grad, rot){
    var o = '<g transform="translate('+cx+' '+cy+') rotate('+rot+')"><path d="M-10 -150 Q0 -170 14 -150 L10 -95 H-6Z" fill="#5B4520"/>';
    for (var i=0;i<n;i++){ var a = (i-(n-1)/2)*11; o += '<g transform="rotate('+a+' 0 -100)"><path d="M-12 -100 Q-46 -10 -6 70 Q4 80 12 72 Q-14 -6 12 -100Z" fill="url(#'+grad+')" stroke="#3A2C10" stroke-width="1.5"/><path d="M-4 66 l6 8" stroke="#2B1E0A" stroke-width="4" stroke-linecap="round"/></g>'; }
    return o + '</g>';
  }
  b += '<ellipse cx="260" cy="400" rx="170" ry="22" fill="#000" opacity=".4" filter="url(#vs-b10)"/>' + bunch(200,300,7,p+'pg',-8) + bunch(340,312,6,p+'py',10);
  b += '<g transform="translate(560 200) rotate(-4)"><rect x="-6" y="-6" width="182" height="122" rx="6" fill="#7A4E26"/><rect width="170" height="110" fill="#1F2422"/><text x="85" y="52" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#F4F1E8">2,10 €</text><text x="85" y="84" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="20" fill="#E8E2C8" opacity=".85">le kilo</text><path d="M30 95 h110" stroke="#F4F1E8" stroke-width="1.5" opacity=".4"/></g>';
  return wrap(d,b);
};

S.vote = function(p){
  var d = lg(p+'wall',0,0,1,0,[[0,'#E7DAC2'],[1,'#BFA986']])
    + lg(p+'win',0,0,0,1,[[0,'#3D5486'],[.6,'#D88B6E'],[1,'#F2C08A']])
    + lg(p+'shaft',0,0,1,1,[[0,'#FFE9C4',.45],[1,'#FFE9C4',0]])
    + lg(p+'table',0,0,0,1,[[0,'#7B5536'],[1,'#4B3220']])
    + lg(p+'box',0,0,1,0,[[0,'#FFFFFF',.35],[.5,'#FFFFFF',.12],[1,'#FFFFFF',.3]]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'wall)"/><rect x="470" y="40" width="250" height="210" fill="url(#'+p+'win)"/>'
    + plane(600,120,0.9,'#1C2240',-8)
    + '<path d="M470 145 H720 M595 40 V250" stroke="#E7DAC2" stroke-width="10"/><rect x="462" y="32" width="266" height="226" fill="none" stroke="#8C7556" stroke-width="10"/>'
    + '<path d="M470 250 L720 250 L560 450 L200 450Z" fill="url(#'+p+'shaft)" filter="url(#vs-b10)"/>'
    + '<path d="M0 330 L800 300 V450 H0Z" fill="url(#'+p+'table)"/>'
    + '<ellipse cx="280" cy="380" rx="150" ry="18" fill="#000" opacity=".35" filter="url(#vs-b10)"/>'
    + '<g transform="rotate(-6 250 210)"><rect x="210" y="150" width="70" height="52" fill="#F5F0E6" stroke="#9E9580"/><path d="M210 150 L245 178 L280 150" stroke="#9E9580" fill="none"/></g>'
    + '<rect x="150" y="215" width="250" height="160" fill="#DCE8F0" opacity=".35"/><rect x="150" y="215" width="250" height="160" fill="url(#'+p+'box)" stroke="#F0F6FA" stroke-width="3"/>'
    + '<rect x="150" y="205" width="250" height="14" fill="#1D5C8C"/><rect x="235" y="209" width="80" height="5" fill="#0B2438"/>'
    + '<g opacity=".8"><rect x="180" y="320" width="64" height="44" fill="#F5F0E6" transform="rotate(12 212 342)"/><rect x="250" y="330" width="64" height="40" fill="#EFE6D2" transform="rotate(-8 282 350)"/><rect x="300" y="315" width="60" height="44" fill="#F5F0E6" transform="rotate(20 330 337)"/></g>'
    + '<path d="M158 222 L170 360" stroke="#fff" stroke-width="4" opacity=".45"/>';
  return wrap(d,b);
};

S.rally = function(p){
  var R = rnd(13), d = lg(p+'sky',0,0,0,1,[[0,'#1A2A4E'],[.55,'#7A4E6A'],[1,'#E0855A']])
    + rg(p+'spot','50%','50%','50%',[[0,'#FFF5D6',.9],[1,'#FFF5D6',0]])
    + lg(p+'beam',0,0,0,1,[[0,'#FFF0C8',.3],[1,'#FFF0C8',0]]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/>'
    + '<path d="M0 260 Q200 200 400 230 T800 220 V300 H0Z" fill="#2A2440" opacity=".8"/>' + palm(60,290,140,'#1A1630',20) + palm(760,290,120,'#1A1630',-15)
    + '<rect x="230" y="150" width="340" height="150" fill="#14111F"/><rect x="230" y="140" width="340" height="12" fill="#22203A"/>';
  [[260,140,'#FFD27A'],[400,140,'#FFFFFF'],[540,140,'#7FD1FF']].forEach(function(s){ b += '<path d="M'+s[0]+' '+s[1]+' L'+(s[0]-120)+' 450 L'+(s[0]+120)+' 450Z" fill="'+s[2]+'" opacity=".12" filter="url(#vs-b10)"/><circle cx="'+s[0]+'" cy="'+s[1]+'" r="30" fill="url(#'+p+'spot)"/>'; });
  b += '<rect x="370" y="210" width="60" height="90" fill="#0E0C18"/><path d="M400 210 V185" stroke="#0E0C18" stroke-width="4"/><circle cx="400" cy="182" r="6" fill="#0E0C18"/><circle cx="400" cy="160" r="14" fill="#0E0C18"/><path d="M382 210 Q400 172 418 210Z" fill="#0E0C18"/>';
  for (var row=0; row<4; row++){ var y = 330 + row*36, s = 0.8 + row*0.35;
    for (var x=-20; x<840; x += 34*s){ var xx = x + (R()-0.5)*14, hh = y + (R()-.5)*10;
      b += '<circle cx="'+xx.toFixed(1)+'" cy="'+hh.toFixed(1)+'" r="'+(11*s).toFixed(1)+'" fill="#0B0914"/><path d="M'+(xx-20*s).toFixed(1)+' 470 Q'+xx.toFixed(1)+' '+(hh+4*s).toFixed(1)+' '+(xx+20*s).toFixed(1)+' 470Z" fill="#0B0914"/>';
      if (row<2 && R()>.55) b += '<circle cx="'+xx.toFixed(1)+'" cy="'+(hh-1).toFixed(1)+'" r="'+(11*s).toFixed(1)+'" fill="none" stroke="#F2A86A" stroke-width="1.2" opacity=".5"/>';
      if (R()>.85) b += '<path d="M'+(xx+8*s).toFixed(1)+' '+(hh+6).toFixed(1)+' L'+(xx+16*s).toFixed(1)+' '+(hh-34*s).toFixed(1)+'" stroke="#0B0914" stroke-width="'+(6*s).toFixed(1)+'" stroke-linecap="round"/>';
    }
  }
  return wrap(d,b);
};

S.airport = function(p){
  var d = lg(p+'sky',0,0,0,1,[[0,'#1E2F57'],[.55,'#B0697A'],[.85,'#F2A46B'],[1,'#FCD49A']])
    + rg(p+'sun','50%','50%','50%',[[0,'#FFF4D6',1],[.3,'#FFD08A',.6],[1,'#FFA060',0]])
    + lg(p+'run',0,0,0,1,[[0,'#4B4A55'],[1,'#26252C']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><circle cx="250" cy="300" r="200" fill="url(#'+p+'sun)"/>'
    + '<path d="M0 290 L800 290 V450 H0Z" fill="#1A1820"/><path d="M330 290 L470 290 L800 450 L0 450Z" fill="url(#'+p+'run)"/>';
  for (var i=0;i<8;i++){ var t = i/8, y = 292 + Math.pow(t,1.7)*158; b += '<path d="M'+(400-2-t*6)+' '+y.toFixed(0)+' h'+(4+t*12)+'" stroke="#EDEDED" stroke-width="'+(1+t*5).toFixed(1)+'"/>'; }
  for (var j=0;j<10;j++){ var t2 = j/10, yy = 292 + Math.pow(t2,1.7)*158, dx = 70 + t2*330;
    b += '<circle cx="'+(400-dx).toFixed(0)+'" cy="'+yy.toFixed(0)+'" r="'+(1.5+t2*4).toFixed(1)+'" fill="#FFD27A"/><circle cx="'+(400+dx).toFixed(0)+'" cy="'+yy.toFixed(0)+'" r="'+(1.5+t2*4).toFixed(1)+'" fill="#FFD27A"/><circle cx="'+(400+dx).toFixed(0)+'" cy="'+yy.toFixed(0)+'" r="'+(6+t2*10).toFixed(1)+'" fill="#FFD27A" opacity=".25" filter="url(#vs-b4)"/>'; }
  b += '<rect x="640" y="170" width="22" height="120" fill="#141219"/><path d="M618 170 L684 170 L676 140 L626 140Z" fill="#141219"/><rect x="630" y="146" width="42" height="14" fill="#7FC6D9" opacity=".75"/><rect x="649" y="120" width="4" height="20" fill="#141219"/><circle cx="651" cy="118" r="3" fill="#FF4A4A"/>'
    + plane(420,150,1.5,'#161422',-12) + '<circle cx="512" cy="133" r="4" fill="#FF5A5A"/><circle cx="512" cy="133" r="12" fill="#FF5A5A" opacity=".35" filter="url(#vs-b4)"/>';
  return wrap(d,b);
};

S.tap = function(p){
  var d = lg(p+'bg',0,0,1,1,[[0,'#26353D'],[1,'#0C1418']])
    + lg(p+'chrome',0,0,0,1,[[0,'#F4F8FA'],[.25,'#9AA6AC'],[.5,'#E6EDF0'],[.75,'#5E6A70'],[1,'#B9C3C8']])
    + lg(p+'chromev',0,0,1,0,[[0,'#5E6A70'],[.35,'#F4F8FA'],[.6,'#9AA6AC'],[1,'#3F4A50']])
    + rg(p+'drop','35%','30%','70%',[[0,'#FFFFFF'],[.4,'#A8DDF0'],[1,'#3D8AA8']])
    + lg(p+'glass',0,0,1,0,[[0,'#FFFFFF',.25],[.2,'#FFFFFF',.05],[.8,'#FFFFFF',.05],[1,'#FFFFFF',.2]]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'bg)"/><circle cx="420" cy="160" r="220" fill="#3E5560" opacity=".35" filter="url(#vs-b10)"/>'
    + '<rect x="0" y="92" width="300" height="38" fill="url(#'+p+'chrome)"/><rect x="290" y="80" width="62" height="62" rx="10" fill="url(#'+p+'chromev)"/>'
    + '<rect x="312" y="48" width="18" height="34" fill="url(#'+p+'chromev)"/><rect x="282" y="34" width="78" height="16" rx="8" fill="url(#'+p+'chrome)"/>'
    + '<path d="M352 98 H430 Q470 98 470 138 V178 H440 V142 Q440 128 426 128 H352Z" fill="url(#'+p+'chrome)"/><rect x="436" y="176" width="38" height="12" rx="3" fill="url(#'+p+'chromev)"/>'
    + '<path d="M455 210 Q444 228 446 238 Q448 250 455 250 Q462 250 464 238 Q466 228 455 210Z" fill="url(#'+p+'drop)"/><ellipse cx="451" cy="232" rx="2.5" ry="5" fill="#fff" opacity=".9"/>'
    + '<ellipse cx="455" cy="420" rx="110" ry="14" fill="#000" opacity=".5" filter="url(#vs-b4)"/>'
    + '<path d="M380 290 L530 290 L515 420 L395 420Z" fill="url(#'+p+'glass)" stroke="#DDE9EE" stroke-width="2.5" stroke-opacity=".7"/><ellipse cx="455" cy="290" rx="75" ry="8" fill="none" stroke="#DDE9EE" stroke-width="2" opacity=".6"/>'
    + '<path d="M395 300 L408 410" stroke="#fff" stroke-width="5" opacity=".35"/><ellipse cx="455" cy="418" rx="58" ry="5" fill="#9FD3E6" opacity=".25"/>'
    + '<rect y="420" width="800" height="30" fill="#0A1013"/>';
  return wrap(d,b);
};

S.cepal = function(p){
  var d = lg(p+'sky',0,0,0,1,[[0,'#6FA4C8'],[.6,'#F1C08C'],[1,'#F8D9A6']])
    + rg(p+'sun','50%','50%','50%',[[0,'#FFF6DA',1],[.3,'#FFE0A0',.6],[1,'#FFC070',0]])
    + lg(p+'sea',0,0,0,1,[[0,'#7A8FA6'],[.2,'#2E6C8A'],[1,'#0E3046']])
    + lg(p+'f1',0,0,0,1,[[0,'#3E6B4A'],[1,'#22432F']])
    + lg(p+'f2',0,0,0,1,[[0,'#6E8E6A'],[1,'#56775A']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><circle cx="520" cy="230" r="200" fill="url(#'+p+'sun)"/><circle cx="520" cy="232" r="30" fill="#FFF3D0"/>'
    + '<rect y="240" width="800" height="210" fill="url(#'+p+'sea)"/><path d="M490 244 L550 244 L590 450 L450 450Z" fill="#FFE2A8" opacity=".3" filter="url(#vs-b10)"/>';
  for (var i=0;i<16;i++){ b += '<path d="M'+(480+((i*29)%70))+' '+(250+i*12)+' h'+(20+(i%4)*14)+'" stroke="#FFE6B6" stroke-width="2" opacity=".55"/>'; }
  b += '<g fill="#2A3340" opacity=".85"><rect x="640" y="200" width="70" height="10"/><rect x="646" y="210" width="5" height="34"/><rect x="700" y="210" width="5" height="34"/><rect x="672" y="210" width="5" height="34"/><path d="M660 200 L668 150 L676 200Z"/><rect x="690" y="186" width="16" height="14"/></g><path d="M668 150 q-30 -20 -60 -6" stroke="#5A6470" stroke-width="5" fill="none" opacity=".35" filter="url(#vs-b4)"/>'
    + '<path d="M0 200 Q80 170 160 190 T320 205 L360 250 H0Z" fill="url(#'+p+'f2)"/>'
    + '<path d="M0 450 V250 Q60 220 120 240 Q180 210 240 250 Q300 270 340 330 Q300 400 260 450Z" fill="url(#'+p+'f1)"/>';
  var R = rnd(17); for (var k=0;k<40;k++){ var x = R()*300, y = 260 + R()*180; b += '<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+(8+R()*14).toFixed(0)+'" fill="'+(R()>.5?'#2B5238':'#4F7F57')+'" opacity=".7"/>'; }
  b += '<path d="M120 450 Q160 380 140 330 Q130 300 170 270" stroke="#7FB6C9" stroke-width="7" fill="none" opacity=".8"/>';
  return wrap(d,b);
};

S.flight = function(p){
  var R = rnd(23), d = lg(p+'sky',0,0,0,1,[[0,'#2F4278'],[.5,'#C97E86'],[.8,'#F4AE6A'],[1,'#FBD9A0']])
    + rg(p+'sun','50%','50%','50%',[[0,'#FFF4D8',1],[.25,'#FFD49A',.6],[1,'#FFA86A',0]]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/><circle cx="170" cy="300" r="230" fill="url(#'+p+'sun)"/>'
    + '<path d="M80 340 Q260 300 420 330" stroke="#fff" stroke-width="3" opacity=".25"/>';
  for (var i=0;i<60;i++){ var x = R()*900-50, y = 320 + R()*140, r = 40 + R()*70; b += '<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="'+r.toFixed(0)+'" ry="'+(r*0.45).toFixed(0)+'" fill="'+(R()>.5?'#F7D7C4':'#E8B5A8')+'" opacity=".9" filter="url(#vs-b10)"/>'; }
  for (var j=0;j<30;j++){ var x2 = R()*900-50, y2 = 345 + R()*110, r2 = 30 + R()*50; b += '<ellipse cx="'+x2.toFixed(0)+'" cy="'+y2.toFixed(0)+'" rx="'+r2.toFixed(0)+'" ry="'+(r2*0.4).toFixed(0)+'" fill="#FFF0E2" opacity=".85" filter="url(#vs-b4)"/>'; }
  b += '<path d="M-20 238 Q250 205 470 175" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".55" filter="url(#vs-b2)"/>' + plane(540,165,1.6,'#22233A',-9) + '<circle cx="640" cy="148" r="3" fill="#FF6060"/>';
  return wrap(d,b);
};

S.pinkrun = function(p){
  var d = lg(p+'sky',0,0,0,1,[[0,'#F4B98F'],[1,'#FBE4CB']])
    + lg(p+'road',0,0,0,1,[[0,'#9A8A86'],[1,'#5B4E4C']])
    + lg(p+'b1',0,0,0,1,[[0,'#E9C9A6'],[1,'#C9A584']])
    + lg(p+'b2',0,0,0,1,[[0,'#D9A9A0'],[1,'#B98B83']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/>';
  [[0,90,170,'b1'],[170,120,140,'b2'],[310,100,120,'b1'],[490,110,130,'b2'],[620,80,180,'b1']].forEach(function(t,i){
    b += '<rect x="'+t[0]+'" y="'+t[1]+'" width="'+t[2]+'" height="'+(300-t[1])+'" fill="url(#'+p+t[3]+')"/>';
    for (var k=0;k<Math.floor(t[2]/40);k++){ var wx = t[0]+12+k*40; b += '<rect x="'+wx+'" y="'+(t[1]+24)+'" width="20" height="40" fill="#5E4A44" opacity=".55"/><rect x="'+wx+'" y="'+(t[1]+96)+'" width="20" height="40" fill="#5E4A44" opacity=".55"/><path d="M'+(wx-6)+' '+(t[1]+70)+' h32" stroke="#3E302C" stroke-width="3"/>'; }
    b += '<path d="M'+t[0]+' '+(t[1]+70)+' h'+t[2]+'" stroke="#3E302C" stroke-width="2" opacity=".6"/><path d="M'+t[0]+' '+(t[1]+78)+' h'+t[2]+'" stroke="#3E302C" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>';
  });
  b += '<path d="M0 290 H800 V450 H0Z" fill="url(#'+p+'road)"/><path d="M0 300 H800" stroke="#E9DCCF" stroke-width="4" opacity=".6"/>'
    + '<path d="M0 290 H800 V330 H0Z" fill="#FFD7B0" opacity=".25" filter="url(#vs-b10)"/>';
  var cols = ['#E24C83','#F07AA6','#D63A72','#F59CBC','#E86393'];
  var pos = [[140,330,.9],[230,338,1],[330,326,.85],[470,345,1.1],[600,332,.95],[700,340,1.05],[400,380,1.4],[560,395,1.5],[250,400,1.45]];
  pos.forEach(function(q,i){ b += '<ellipse cx="'+(q[0]+4)+'" cy="'+(q[1]+8)+'" rx="'+(22*q[2])+'" ry="4" fill="#000" opacity=".25" filter="url(#vs-b2)"/><g filter="url(#vs-b1)">'+runner(q[0],q[1],q[2],cols[i%5],i%2)+'</g>'; });
  b += '<g opacity=".9"><circle cx="90" cy="150" r="20" fill="#F07AA6"/><path d="M90 170 Q96 220 88 290" stroke="#fff" stroke-width="1" fill="none"/><circle cx="740" cy="130" r="18" fill="#E24C83"/><path d="M740 148 Q735 210 742 290" stroke="#fff" stroke-width="1" fill="none"/></g>';
  return wrap(d,b);
};

S.fires = function(p){
  var d = lg(p+'sky',0,0,0,1,[[0,'#070B16'],[1,'#1A1E2E']])
    + rg(p+'glow','50%','50%','50%',[[0,'#FFB35A',.75],[.5,'#FF6A2A',.25],[1,'#FF6A2A',0]])
    + rg(p+'fl','50%','80%','70%',[[0,'#FFF6C8'],[.35,'#FFC24A'],[.7,'#FF6A1E'],[1,'#B0281A']])
    + lg(p+'street',0,0,0,1,[[0,'#2A2730'],[1,'#121118']]);
  var b = '<rect width="800" height="450" fill="url(#'+p+'sky)"/>';
  [[0,120,160],[160,90,120],[280,140,140],[560,100,130],[690,70,110]].forEach(function(t){ b += '<rect x="'+t[0]+'" y="'+t[1]+'" width="'+t[2]+'" height="'+(320-t[1])+'" fill="#0D0F18"/>'; for (var k=0;k<4;k++){ if((t[0]+k)%3) b += '<rect x="'+(t[0]+14+k*28)+'" y="'+(t[1]+30)+'" width="12" height="18" fill="#E8B76A" opacity=".55"/>'; } });
  b += '<path d="M0 320 H800 V450 H0Z" fill="url(#'+p+'street)"/><circle cx="420" cy="270" r="260" fill="url(#'+p+'glow)"/>';
  for (var i=0;i<8;i++){ b += '<circle cx="'+(400+Math.sin(i)*40+i*12)+'" cy="'+(160-i*22)+'" r="'+(30+i*8)+'" fill="#3C3A44" opacity="'+(0.45-i*0.04).toFixed(2)+'" filter="url(#vs-b10)"/>'; }
  b += '<path d="M330 240 Q340 150 390 120 Q380 170 410 180 Q420 110 460 80 Q450 150 480 170 Q500 140 495 120 Q540 180 510 250Z" fill="url(#'+p+'fl)" filter="url(#vs-b2)"/>'
    + '<path d="M370 245 Q380 190 410 175 Q412 205 430 210 Q440 170 460 155 Q470 200 465 245Z" fill="#FFF0B0" opacity=".85" filter="url(#vs-b2)"/>'
    + '<path d="M320 240 L520 240 L505 345 L335 345Z" fill="#244534"/><path d="M314 232 H526 V246 H314Z" fill="#1A3326"/><path d="M370 255 V335 M420 255 V335 M470 255 V335" stroke="#16291F" stroke-width="6"/>'
    + '<path d="M320 240 L520 240 L505 345 L335 345Z" fill="#FF8A3A" opacity=".18"/><circle cx="350" cy="350" r="10" fill="#0A0A0E"/><circle cx="490" cy="350" r="10" fill="#0A0A0E"/>'
    + '<ellipse cx="420" cy="380" rx="200" ry="22" fill="#FF8A3A" opacity=".3" filter="url(#vs-b10)"/>';
  [[300,120],[520,90],[560,160],[260,190]].forEach(function(s){ b += '<circle cx="'+s[0]+'" cy="'+s[1]+'" r="2" fill="#FFD27A"/>'; });
  return wrap(d,b);
};

return function(key){ uid++; return S[key] ? S[key]('s'+uid+key) : ''; };
})();
