/* ---------- mousse espagnole : quelques touffes soumises à la gravité ---------- */
document.querySelectorAll('canvas.mousse').forEach(function mousse(cv){
  if(!cv.getContext) return;
  const ctx=cv.getContext('2d'), calme=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,brins=[],souris={x:-999,y:-999}; const vent=+(cv.dataset.vent||0); let ventEff=vent;
  // [x d'ancrage, nombre de segments] : peu de touffes, longueurs variées, la plus longue tombe sur le logo
  const modele=cv.dataset.modele?JSON.parse(cv.dataset.modele):[[8,8],[34,10],[70,3],[110,2],[150,3]];
  const alea=(i,j,k)=>{ const v=Math.sin(i*12.9898+j*78.233+k*37.719)*43758.5453; return v-Math.floor(v); };
  function creer(){
    const r=cv.getBoundingClientRect(); W=r.width; H=r.height; const dpr=Math.min(devicePixelRatio||1,2);
    cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    // data-relatif : x en fraction de la largeur ; data-pash : longueur d'un segment en fraction de la hauteur
    const rel=!!cv.dataset.relatif, k=cv.dataset.pash?(H*+cv.dataset.pash)/12:W/300;
    // sur petit écran, une touffe sur deux (les trois premières, les plus longues, sont toujours gardées)
    const liste=(rel&&W<640)?modele.filter((_,i)=>i<3||i%2===0):modele;
    ventEff=vent*(rel?Math.max(.4,Math.min(1,W/1280)):1);
    // data-branche (sur un parent) : la touffe pend de la branche, à la hauteur de la courbe en x
    const hb=cv.closest('[data-branche]'), B=hb?hb.dataset.branche.split(',').map(Number):null;
    const bz=(t,i)=>{ const u=1-t; return u*u*u*B[i]+3*u*u*t*B[i+2]+3*u*t*t*B[i+4]+t*t*t*B[i+6]; };
    const yBranche=x=>{ if(!B) return 0; let m=1e9,tb=0; for(let s=0;s<=200;s++){ const e=Math.abs(bz(s/200,0)-x); if(e<m){m=e;tb=s/200;} } return Math.max(0,bz(tb,1))*H; };
    brins=liste.map(([x,n],i)=>{ const pas=12*k, x0=rel?x*W:x*k, y0=rel?yBranche(x):0, pts=[];
      for(let j=0;j<n;j++){ pts.push({x:x0,y:y0+j*pas,ox:x0,oy:y0+j*pas}); }
      // vrilles : beaucoup de petits filaments frisés, comme la vraie mousse espagnole
      const vrilles=[]; for(let j=1;j<n;j++) for(let m=0;m<5;m++) vrilles.push({j,t:alea(i,j,m),cote:alea(i,j,m+9)>.5?1:-1,l:(5+alea(i,j,m+3)*9)*k,c:(alea(i,j,m+5)-.5)*8*k});
      return {pts,pas,vrilles}; });
  }
  function pas(t){
    for(const b of brins){ const p=b.pts;
      for(let j=1;j<p.length;j++){ const q=p[j], vx=(q.x-q.ox)*.965, vy=(q.y-q.oy)*.965; q.ox=q.x; q.oy=q.y;
        q.x+=vx+Math.sin(t/1900+j*.6+b.pas)*.018; q.y+=vy+.3;
        if(ventEff){ const f=j/p.length; q.x-=ventEff*f*(.3+.7*Math.sin(t/900+j*.3+b.pts[0].x*.04)); }   // vent de droite à gauche, par rafales
        const dx=q.x-souris.x, dy=q.y-souris.y, d=Math.hypot(dx,dy);
        if(d<44&&d>0){ const f=(44-d)/44*.8; q.x+=dx/d*f; q.y+=dy/d*f*.35; } }
      for(let it=0;it<5;it++) for(let j=1;j<p.length;j++){ const a=p[j-1], q=p[j], dx=q.x-a.x, dy=q.y-a.y, d=Math.hypot(dx,dy)||1, e=(d-b.pas)/d;
        if(j===1){ q.x-=dx*e; q.y-=dy*e; } else { a.x+=dx*e*.5; a.y+=dy*e*.5; q.x-=dx*e*.5; q.y-=dy*e*.5; } }
    }
  }
  function dessiner(){
    ctx.clearRect(0,0,W,H); ctx.lineCap='round';
    for(const b of brins){ const p=b.pts;
      // tige principale, légèrement ondulée
      ctx.strokeStyle='rgba(176,184,164,.95)'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y);
      for(let j=1;j<p.length;j++){ const a=p[j-1], q=p[j], w=(j%2?1:-1)*2.2; ctx.quadraticCurveTo((a.x+q.x)/2+w,(a.y+q.y)/2,q.x,q.y); }
      ctx.stroke();
      // vrilles grises qui retombent
      ctx.lineWidth=.9;
      for(const v of b.vrilles){ const a=p[v.j-1], q=p[v.j], x=a.x+(q.x-a.x)*v.t, y=a.y+(q.y-a.y)*v.t;
        ctx.strokeStyle=v.cote>0?'rgba(196,203,186,.8)':'rgba(150,160,140,.85)';
        ctx.beginPath(); ctx.moveTo(x,y); ctx.bezierCurveTo(x+v.cote*v.l*.5,y+v.l*.2,x+v.cote*v.l*.6+v.c,y+v.l*.7,x+v.cote*v.l*.35,y+v.l); ctx.stroke(); }
      const f=p[p.length-1]; ctx.strokeStyle='rgba(176,184,164,.9)'; ctx.lineWidth=1.1;
      for(const s of [-1,0,1]){ ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.quadraticCurveTo(f.x+s*3,f.y+4,f.x+s*2,f.y+9); ctx.stroke(); }
    }
  }
  const init=()=>{ creer(); for(let i=0;i<140;i++) pas(0); dessiner(); };
  init(); addEventListener('resize',init);
  if(calme) return;
  let dernierY=scrollY;
  addEventListener('scroll',()=>{ const dy=scrollY-dernierY; dernierY=scrollY; const k=Math.max(-14,Math.min(14,dy));
    for(const b of brins) b.pts.forEach((q,j)=>{ if(!j) return; const f=j/b.pts.length; q.oy+=k*.35*f; q.ox+=k*.12*f*(j%2?1:-1); }); },{passive:true});
  // souris et doigt : la mousse s'écarte, et le geste lui donne de l'élan
  let prec=null;
  const pousser=(cx,cy)=>{ const r=cv.getBoundingClientRect(), x=cx-r.left, y=cy-r.top;
    if(prec){ const vx=Math.max(-30,Math.min(30,x-prec.x)), vy=Math.max(-30,Math.min(30,y-prec.y));
      for(const b of brins) b.pts.forEach((q,j)=>{ if(!j) return; const d=Math.hypot(q.x-x,q.y-y); if(d<58){ const f=(58-d)/58*.55; q.ox-=vx*f; q.oy-=vy*f*.4; } }); }
    prec={x,y}; souris.x=x; souris.y=y; };
  const lacher=()=>{ prec=null; souris.x=souris.y=-999; };
  addEventListener('pointermove',e=>{ if(e.pointerType!=='touch') pousser(e.clientX,e.clientY); },{passive:true});
  addEventListener('touchstart',e=>{ prec=null; const t=e.touches[0]; pousser(t.clientX,t.clientY); },{passive:true});
  addEventListener('touchmove',e=>{ const t=e.touches[0]; pousser(t.clientX,t.clientY); },{passive:true});
  addEventListener('touchend',lacher,{passive:true}); addEventListener('touchcancel',lacher,{passive:true});
  document.addEventListener('mouseleave',lacher);
  let visible=true; new IntersectionObserver(es=>{ visible=es[0].isIntersecting; if(visible) requestAnimationFrame(boucle); }).observe(cv);
  function boucle(t){ if(!visible) return; pas(t); dessiner(); requestAnimationFrame(boucle); }
  requestAnimationFrame(boucle);
});
