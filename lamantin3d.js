/* Lamantin en 3D (three.js) : posé sur la case de la Courbe, il suit la souris
   et fait une bulle avec un drapeau (US, UK ou Australie) quand on touche un code. */
import * as THREE from './vendor/three.module.min.js';   // three.js r160, hébergé avec le site

const hote = document.getElementById('lamantin');

/* chaque visite tire un lamantin différent ; ?lamantin=nom pour en forcer un */
const TIRAGE = [['classique',12],['helice',3.5],['florida',3.5],['usa',3.5],['courbe',3.5],['tshirt',3.5],['uk',3.5],['australie',3.5],['canada',3.5],['france',3.5],['parasol',3.5],['golf',3.5],['vice',3.5],['bob',3.5],['paille',3.5],['bonnet',3.5],['lei',3.5],['tuba',3.5],['canard',3.5],['monaco',3.5],['casque',3.5],['rose',1],['gator',0.67]];   // rose : le très rare
function tirer(){
  try { const v = new URLSearchParams(location.search).get('lamantin'); if (v && TIRAGE.some(t => t[0] === v)) return v; } catch (e) {}
  let r = Math.random() * TIRAGE.reduce((s, t) => s + t[1], 0);
  for (const [nom, poids] of TIRAGE) { if ((r -= poids) < 0) return nom; } return 'classique';
}
const VARIANTE = (document.getElementById('lamantin') && document.getElementById('lamantin').dataset.variante) || tirer();
if (hote) try { lancer(); } catch (e) { hote.remove(); }

function lancer(){
  const L = 200, H = 140, H2 = 140;
  const rendu = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  rendu.setSize(L, H2);
  rendu.outputColorSpace = THREE.SRGBColorSpace;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.05;
  hote.appendChild(rendu.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, L / H, 0.1, 50);
  camera.setViewOffset(L, H, 0, 0, L, H2);
  camera.position.set(-0.1, 1.15, 5.2);
  camera.lookAt(0.4, 0.32, 0);

  scene.add(new THREE.HemisphereLight(0xEEF3FF, 0x0E2766, .95));
  const cle = new THREE.DirectionalLight(0xFFF6EA, 2.8); cle.position.set(-2.5, 3.5, 3); scene.add(cle);
  const contre = new THREE.DirectionalLight(0xB9CCFF, 2.2); contre.position.set(2, 2.5, -3); scene.add(contre);

  /* peau : gris-brun mat, légèrement tachetée */
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = VARIANTE === 'rose' ? '#9C5A55' : '#545955'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const v = 60 + Math.random() * 50 | 0, rose = VARIANTE === 'rose';
    g.fillStyle = rose ? `rgba(${v + 90},${v + 25},${v + 20},${Math.random() * .4})` : `rgba(${v},${v + 4},${v + 2},${Math.random() * .4})`;
    g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 2.2, 0, 7); g.fill();
  }
  // voile d'algues vertes, par taches, comme sur les lamantins sauvages
  for (let i = 0; i < 16; i++) { const x = Math.random() * 256, y = Math.random() * 120, r = 10 + Math.random() * 24;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, VARIANTE === 'rose' ? 'rgba(84,118,48,.5)' : 'rgba(88,124,52,.24)'); gr.addColorStop(1, 'rgba(88,124,52,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  // quelques cicatrices claires, très discrètes (les lamantins en portent presque tous)
  g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(190,192,184,.35)'; g.lineWidth = 1 + Math.random();
    const x = Math.random() * 256, y = Math.random() * 256; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y + 6 - Math.random() * 12, x + 26 + Math.random() * 14, y + Math.random() * 8 - 4); g.stroke(); }
  // relief : grain fin + rides
  const rc = document.createElement('canvas'); rc.width = rc.height = 256; const rg = rc.getContext('2d');
  rg.fillStyle = '#808080'; rg.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) { const v = Math.random() * 255 | 0; rg.fillStyle = `rgba(${v},${v},${v},.12)`; rg.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5); }
  for (let y = 0; y < 256; y += 9 + Math.random() * 6) { rg.strokeStyle = 'rgba(40,40,40,.18)'; rg.lineWidth = 1; rg.beginPath(); rg.moveTo(0, y); for (let x = 0; x <= 256; x += 16) rg.lineTo(x, y + Math.sin(x * .05 + y) * 2); rg.stroke(); }
  const relief = new THREE.CanvasTexture(rc); relief.wrapS = relief.wrapT = THREE.RepeatWrapping; relief.repeat.set(3, 2);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
  const peau = new THREE.MeshStandardMaterial({ map:tex, bumpMap:relief, bumpScale:.6, roughness:.84, metalness:0 });
  const peauClaire = new THREE.MeshStandardMaterial({ color:VARIANTE === 'rose' ? 0xB06C66 : 0x676C67, roughness:.95 });
  const noir = new THREE.MeshStandardMaterial({ color:0x07080A, roughness:.15 });
  const ongle = new THREE.MeshStandardMaterial({ color:0xD9D3C4, roughness:.5 });

  const ajoute = (parent, objet) => { parent.add(objet); return objet; };   // add() renvoie le parent : on veut l'objet ajouté
  const boule = (r, mat, s = [1, 1, 1], p = [0, 0, 0], seg = 40) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * .75)), mat);
    m.scale.set(...s); m.position.set(...p); return m;
  };

  /* corps : un fuseau balayé le long d'une colonne, de la queue au cou */
  /* profil du corps : une courbe lisse (Catmull-Rom) échantillonnée finement, pour un fuseau sans méplats */
  function lisser(pts, n = 80){
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; let k = 1; while (k < pts.length - 1 && t > pts[k][0]) k++;
      const p0 = pts[Math.max(0, k - 2)], p1 = pts[k - 1], p2 = pts[k], p3 = pts[Math.min(pts.length - 1, k + 1)];
      const u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
      const r = .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);
      out.push([t, r]);
    }
    return out;
  }
  const PROFIL = lisser([[0, .09], [.13, .18], [.3, .36], [.5, .45], [.7, .44], [.87, .36], [1, .28]]);   // bien en chair
  // bosses irrégulières : quelques ondulations lentes, tirées au hasard à chaque visite
  const ph = Array.from({ length: 6 }, () => Math.random() * 6.3);
  const bosses = (t, a) => .04 * Math.sin(7 * t + ph[0]) * Math.sin(3 * a + ph[1]) + .028 * Math.sin(13 * t + ph[2]) * Math.cos(5 * a + ph[3]) + .014 * Math.sin(29 * t + ph[4] + 7 * a);
  function fuseau(points, rayons, radial = 48, n = 90){
    const courbe = new THREE.CatmullRomCurve3(points);
    const pos = [], idx = [], uv = [];
    const rayon = t => { for (let k = 1; k < rayons.length; k++) if (t <= rayons[k][0]) {
      const [t0, r0] = rayons[k - 1], [t1, r1] = rayons[k], u = (t - t0) / (t1 - t0);
      return r0 + (r1 - r0) * u; } return rayons.at(-1)[1]; };
    for (let i = 0; i <= n; i++) {
      const t = i / n, P = courbe.getPointAt(t), T = courbe.getTangentAt(t);
      const N = new THREE.Vector3(0, 0, 1), B = new THREE.Vector3().crossVectors(T, N).normalize();
      const r = rayon(t);
      for (let j = 0; j <= radial; j++) {
        const a = j / radial * Math.PI * 2;
        const rr = r * (1 + (rayons === PROFIL ? bosses(t, a) * Math.min(1, t * 6) : 0)) + (t > .78 && t < .97 ? Math.sin(t * 150) * .003 * Math.max(0, Math.sin(a)) : 0); // bosses + plis du cou
        const haut = Math.cos(a), aplati = haut < 0 ? .86 : 1;      // ventre un peu aplati, dos bien rond
        const v = P.clone().addScaledVector(B, haut * rr * aplati).addScaledVector(N, Math.sin(a) * rr * 1.13);
        pos.push(v.x, v.y, v.z); uv.push(j / radial, t);
      }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  }

  const lamantin = new THREE.Group(); scene.add(lamantin);
  const corps = new THREE.Group(); lamantin.add(corps);
  const ORIENT = 0; corps.rotation.y = ORIENT;   // trois quarts : la tête et ses accessoires tournés vers le visiteur
  const colonne = [[1.16, .3], [.9, .33], [.56, .42], [.22, .47], [-.08, .52], [-.32, .6]].map(([x, y]) => new THREE.Vector3(x, y, 0));
  corps.add(new THREE.Mesh(fuseau(colonne, PROFIL, 56, 120), peau));
  // queue en pagaie, arrondie, posée à plat
  { const q = boule(.33, peau, [1.15, .11, 1], [1.4, .29, 0]); q.rotation.set(.75, 0, .08); corps.add(q); }
  // nageoires, avec leurs trois ongles
  const nageoires = {};
  for (const z of [-1, 1]) {
    const n = new THREE.Group(); nageoires[z] = n; n.position.set(-.1, .42, z * .43); n.rotation.set(z * -.45, z * .2, -.55);
    n.add(boule(.085, peau, [.7, 2.5, 1.4], [0, -.17, 0], 28));
    for (const k of [-1, 0, 1]) n.add(boule(.013, ongle, [1, .7, 1], [-.05, -.35, k * .04], 10));
    corps.add(n);
  }

  /* tête : pivote au niveau du cou */
  const cou = new THREE.Group(); cou.position.set(-.31, .6, 0); corps.add(cou);
  // jonction tête-corps : un volume de raccord pour une transition continue, sans creux de nuque ni de menton

  const tete = new THREE.Group(); cou.add(tete);
  // volumes de raccord rattachés à la tête : ils tournent avec elle, donc pas de « double tête »
  tete.add(boule(.25, peau, [1.15, .97, 1.08], [.11, .0, 0], 40));
  tete.add(boule(.19, peau, [1.15, .8, 1.08], [-.05, -.1, 0], 32));
  const face = new THREE.Vector3(-.75, -.12, .65).normalize();          // regarde vers l'avant-gauche
  const cote = new THREE.Vector3(.65, 0, .75).normalize();
  const centre = new THREE.Vector3(-.04, .08, 0);
  tete.add(boule(.25, peau, [1.05, .9, 1.04], centre.toArray()));
  // gros museau carré, lèvre supérieure fendue en deux lobes
  const museau = centre.clone().addScaledVector(face, .2).add(new THREE.Vector3(0, -.06, 0));
  for (const s of [-1, 1]) {
    const lobe = boule(.125, peauClaire, [.9, .88, 1], museau.clone().addScaledVector(cote, s * .06).addScaledVector(face, .02).toArray(), 32);
    tete.add(lobe);
    for (let i = 0; i < 16; i++) {           // soies
      const u = Math.random() * 1.2 - .6, w = Math.random() * .9 - .5;
      const d = face.clone().addScaledVector(cote, s * .35 + u * .5).add(new THREE.Vector3(0, w * .6, 0)).normalize();
      tete.add(boule(.0055, noir, [1, 1, 1], lobe.position.clone().addScaledVector(d, .1).toArray(), 6));
    }
  }
  tete.add(boule(.085, peau, [1, .7, 1], museau.clone().add(new THREE.Vector3(0, -.075, 0)).addScaledVector(face, -.01).toArray(), 28)); // menton
  for (const s of [-1, 1]) tete.add(boule(.018, noir, [1.4, .55, 1], museau.clone().addScaledVector(cote, s * .045).add(new THREE.Vector3(0, .085, 0)).addScaledVector(face, .04).toArray(), 12)); // narines
  // petits yeux enfoncés
  const yeux = [];
  for (const a of [1.12, -1.12]) {
    const d = face.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
    yeux.push(centre.clone().addScaledVector(d, .245).add(new THREE.Vector3(0, .06, 0)));
    const oeil = centre.clone().addScaledVector(d, .245).add(new THREE.Vector3(0, .06, 0));
    tete.add(boule(.05, new THREE.MeshStandardMaterial({ color:VARIANTE === 'rose' ? 0xC98880 : 0x868A85, roughness:.9 }), [1, 1, .45], centre.clone().addScaledVector(d, .236).add(new THREE.Vector3(0, .06, 0)).toArray(), 20)); // paupière claire
    tete.add(boule(.04, noir, [1, 1.1, .8], oeil.toArray(), 20));                       // œil noir bien visible
    const reflet = oeil.clone().addScaledVector(d, .029).add(new THREE.Vector3(-.01, .016, .007));
    tete.add(boule(.01, new THREE.MeshBasicMaterial({ color:0xffffff }), [1, 1, 1], reflet.toArray(), 10));
  }


  /* ---------- les variantes ---------- */
  function etiquette(l, h, dessin){
    const cv = document.createElement('canvas'); cv.width = l; cv.height = h; dessin(cv.getContext('2d'), l, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  const RAYONS = PROFIL;
  const rayonCorps = t => { for (let k = 1; k < RAYONS.length; k++) if (t <= RAYONS[k][0]) {
    const [t0, r0] = RAYONS[k - 1], [t1, r1] = RAYONS[k], u = (t - t0) / (t1 - t0); return r0 + (r1 - r0) * u; } return .235; };
  const dos = new THREE.CatmullRomCurve3(colonne);

  function casquette(fond, visiere, texte){
    const cap = new THREE.Group();
    const front = etiquette(512, 256, (x, l, h) => { x.fillStyle = fond; x.fillRect(0, 0, l, h); x.save(); x.translate(l * .14, 0); texte(x, l, h); x.restore(); });
    const calotte = new THREE.Mesh(new THREE.SphereGeometry(.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ map:front, roughness:.85 }));
    calotte.scale.set(1.02, .78, 1.02); cap.add(calotte);
    cap.add(boule(.018, new THREE.MeshStandardMaterial({ color:visiere, roughness:.8 }), [1, .6, 1], [0, .155, 0], 12)); // bouton
    const v = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .014, 40, 1, false, -Math.PI / 2, Math.PI),
      new THREE.MeshStandardMaterial({ color:visiere, roughness:.8 }));
    v.scale.set(1, 1, .95); v.position.set(0, .004, .1); v.rotation.x = .12; cap.add(v);
    // la face avant de la calotte (u = 0,25 → +z) regarde dans la direction du museau
    const vers = face.clone().setY(0).normalize().add(new THREE.Vector3(.15, 0, 1)).normalize();   // logo tourné vers le visiteur
    cap.rotation.y = Math.atan2(vers.x, vers.z); cap.scale.setScalar(1.25);
    cap.position.copy(centre).add(new THREE.Vector3(0, .115, 0)).addScaledVector(face, -.02);
    cap.rotateX(-.12); tete.add(cap);
  }
  const ecrire = (x, txt, couleur, taille, cx, cy, police = '800') => {
    x.save(); x.translate(cx, cy); x.scale(.75, 1); x.fillStyle = couleur; x.font = `${police} ${taille}px Geist, Helvetica, Arial, sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 0, 0); x.restore(); };

  function habiller(v){
    if (v === 'helice') {             // cicatrices d'hélice, cicatrisées, en biais sur le flanc visible
      const cic = new THREE.MeshStandardMaterial({ color:0xD8CFC4, roughness:.9 });
      for (const t0 of [.4, .47, .54]) {
        const pts = [];
        for (let k = 0; k <= 12; k++) {
          const a = .15 + k / 12 * 1.35, t = t0 + k / 12 * .05, P = dos.getPointAt(t), T = dos.getTangentAt(t);
          const B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize(), r = rayonCorps(t) + .003;
          pts.push(P.clone().addScaledVector(B, Math.cos(a) * r).add(new THREE.Vector3(0, 0, Math.sin(a) * r * 1.1)));
        }
        corps.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .011, 6, false), cic));
      }
    }
    if (v === 'florida') casquette('#F4F1EA', '#E0662B', (x, l, h) => {
      ecrire(x, 'FLORIDA', '#0F7C8C', 58, l * .29, h * .62); x.fillStyle = '#E0662B'; x.fillRect(l * .1, h * .78, l * .3, 10); });
    if (v === 'usa') casquette('#1F2A55', '#B22234', (x, l, h) => {
      ecrire(x, 'USA', '#fff', 92, l * .25, h * .62);
      x.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(l * .25 - 60 + i * 30, h * .3, 4, 0, 7); x.fill(); } });
    if (v === 'courbe') casquette('#1C49A5', '#F0766F', (x, l, h) => {   // la Courbe des Temps brodée
      x.strokeStyle = '#fff'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath();
      x.moveTo(l * .25 - 90, h * .6); x.bezierCurveTo(l * .25 - 40, h * .55, l * .25 + 20, h * .66, l * .25 + 85, h * .6); x.stroke();
      x.beginPath(); x.moveTo(l * .25 + 72, h * .5); x.lineTo(l * .25 + 88, h * .6); x.lineTo(l * .25 + 72, h * .7); x.stroke();
      x.strokeStyle = '#F0766F'; x.beginPath(); x.moveTo(l * .25 - 22, h * .5); x.lineTo(l * .25 - 22, h * .7); x.stroke();
      x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(l * .25 + 28, h * .52); x.lineTo(l * .25 + 28, h * .7); x.stroke(); });
    if (v === 'tshirt') {             // t-shirt orange et bleu, « GO MANATEES »
      const pts = [], n = 10; for (let i = 0; i <= n; i++) pts.push(dos.getPointAt(.6 + .3 * i / n));
      const tissu = etiquette(512, 256, (x, l, h) => {
        x.fillStyle = '#F07A28'; x.fillRect(0, 0, l, h); x.fillStyle = '#1B3F8F'; x.fillRect(0, 0, l, 16); x.fillRect(0, h - 16, l, 16);
        x.save(); x.translate(l * .25, h / 2); x.rotate(Math.PI / 2); x.scale(1, -1); ecrire(x, 'GO MANATEES', '#fff', 44, 0, 0); x.restore(); });
      const geo = fuseau(pts, [[0, rayonCorps(.6) * 1.1 + .01], [.5, rayonCorps(.75) * 1.1 + .01], [1, rayonCorps(.9) * 1.1 + .008]], 48, 30);
      corps.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map:tissu, roughness:.9, side:THREE.DoubleSide })));
    }
    /* ---------- accessoires communs ---------- */
    const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness:.7, ...o });
    const solLocal = new THREE.Box3().setFromObject(corps).min.y;          // le sol, dans le repère du corps
    const cou = t => { const P = dos.getPointAt(t), T = dos.getTangentAt(t), B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize(); return { P, B, r:rayonCorps(t) }; };
    const surCorps = (t, a, dehors = 0) => { const { P, B, r } = cou(t); return P.clone().addScaledVector(B, Math.cos(a) * (r + dehors)).add(new THREE.Vector3(0, 0, Math.sin(a) * (r + dehors) * 1.1)); };
    const collier = (t, n, fabrique, dehors = .01) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, m = fabrique(i); m.position.copy(surCorps(t, a, dehors)); corps.add(m); } };
    function lunettes(verre, monture, rayon = .045){
      for (const p of yeux) {
        const sortie = p.clone().sub(centre).normalize(), pos = p.clone().addScaledVector(sortie, .042);
        const o = new THREE.Mesh(new THREE.TorusGeometry(rayon, .011, 8, 28), monture); o.position.copy(pos); o.lookAt(pos.clone().add(sortie)); tete.add(o);
        if (verre) { const g = new THREE.Mesh(new THREE.CircleGeometry(rayon, 28), verre); g.position.copy(pos).addScaledVector(sortie, .002); g.lookAt(g.position.clone().add(sortie)); tete.add(g); }
      }
      const pont = new THREE.Mesh(new THREE.TorusGeometry(.05, .005, 6, 16, Math.PI * .7), monture);
      pont.position.copy(centre).addScaledVector(face, .2).add(new THREE.Vector3(0, .07, 0)); pont.lookAt(pont.position.clone().add(face)); pont.rotateZ(Math.PI * .15); tete.add(pont);
    }
    function chapeauRond(couleur, hauteur, rayonHaut, rayonBas, bord, ruban){
      const ch = new THREE.Group();
      ajoute(ch, new THREE.Mesh(new THREE.CylinderGeometry(rayonHaut, rayonBas, hauteur, 32), mat(couleur, { roughness:.95 }))).position.y = hauteur / 2;
      const aile = new THREE.Mesh(new THREE.CylinderGeometry(bord, bord * .96, .012, 40), mat(couleur, { roughness:.95 })); ch.add(aile);
      if (ruban) { const r = new THREE.Mesh(new THREE.CylinderGeometry(rayonBas * .99 + .002, rayonBas + .002, hauteur * .28, 32, 1, true), mat(ruban)); r.position.y = hauteur * .18; ch.add(r); }
      ch.position.copy(centre).add(new THREE.Vector3(0, .17, 0)); ch.scale.setScalar(1.12); ch.rotation.set(.12, 0, -.12); tete.add(ch); return ch;
    }

    if (v === 'monaco') {                                                      // le monégasque : casquette de capitaine de yacht, bandeau rouge et blanc
      const k = new THREE.Group(); k.position.copy(centre).add(new THREE.Vector3(0, .17, 0)); k.rotation.set(-.12, 0, .12); k.scale.setScalar(1.1); tete.add(k);
      const vers = face.clone().setY(0).normalize().add(new THREE.Vector3(.15, 0, 1)).normalize(); k.rotation.y = Math.atan2(vers.x, vers.z);
      const blanc = mat(0xFFFFFF, { roughness:.5, emissive:0x2A2A2A });
      ajoute(k, new THREE.Mesh(new THREE.CylinderGeometry(.25, .21, .04, 40), blanc)).position.y = .075;               // plateau
      ajoute(k, new THREE.Mesh(new THREE.CylinderGeometry(.205, .205, .04, 40), blanc)).position.y = .04;
      const bande = etiquette(512, 32, (x, l, h) => { x.fillStyle = '#CE1126'; x.fillRect(0, 0, l, h / 2); x.fillStyle = '#fff'; x.fillRect(0, h / 2, l, h / 2); });
      ajoute(k, new THREE.Mesh(new THREE.CylinderGeometry(.208, .208, .04, 40, 1, true), new THREE.MeshStandardMaterial({ map:bande, roughness:.7 }))).position.y = .018;
      const v = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .012, 40, 1, false, -Math.PI / 2, Math.PI), mat(0x10184A, { roughness:.3, metalness:.2 }));
      v.position.set(0, .004, .09); v.rotation.x = .25; k.add(v);
      const galon = new THREE.Mesh(new THREE.TorusGeometry(.12, .006, 6, 24, Math.PI), mat(0xD9B24C, { metalness:1, roughness:.25 }));
      galon.position.set(0, .03, .21); galon.rotation.z = Math.PI; galon.scale.set(1, .25, 1); k.add(galon);
      k.add(boule(.022, mat(0xD9B24C, { metalness:1, roughness:.25 }), [1, 1, .5], [0, .07, .2], 14));        // écusson doré
    }
    if (v === 'deux') casquette('#F0766F', '#A8322A', (x, l, h) => {           // « deux temps » : un grand 2 blanc, contour corail foncé
      x.save(); x.translate(l * .25, h * .58); x.scale(.8, 1); x.font = '800 150px Geist, Helvetica, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineJoin = 'round'; x.lineWidth = 14; x.strokeStyle = '#A8322A'; x.strokeText('2', 0, 0); x.fillStyle = '#fff'; x.fillText('2', 0, 0); x.restore(); });
    if (v === 'uk') casquette('#012169', '#C8102E', (x, l, h) => {                 // Union Jack sur toute la calotte
      x.strokeStyle = '#fff'; x.lineWidth = 34; x.beginPath(); x.moveTo(0, 0); x.lineTo(l, h); x.moveTo(l, 0); x.lineTo(0, h); x.stroke();
      x.strokeStyle = '#C8102E'; x.lineWidth = 12; x.stroke();
      x.fillStyle = '#fff'; x.fillRect(l / 2 - 34, 0, 68, h); x.fillRect(0, h / 2 - 30, l, 60);
      x.fillStyle = '#C8102E'; x.fillRect(l / 2 - 20, 0, 40, h); x.fillRect(0, h / 2 - 18, l, 36); });
    if (v === 'australie') casquette('#00843D', '#FFCD00', (x, l, h) => { ecrire(x, 'AUSSIE', '#FFCD00', 64, l * .29, h * .6); });
    if (v === 'canada') casquette('#F4F1EA', '#D52B1E', (x, l, h) => { ecrire(x, 'CANADA', '#D52B1E', 62, l * .29, h * .6); });
    if (v === 'france') casquette('#1F2A55', '#fff', (x, l, h) => {
      ecrire(x, 'FRANCE', '#fff', 60, l * .29, h * .55); [['#0055A4', 0], ['#fff', 1], ['#EF4135', 2]].forEach(([c, i]) => { x.fillStyle = c; x.fillRect(l * .12 + i * 60, h * .74, 60, 14); }); });
    if (v === 'parasol') {                                                     // parasol de plage planté derrière lui
      const p = new THREE.Group(); p.position.set(-.86, solLocal, -.12); p.rotation.z = -.08; corps.add(p);
      ajoute(p, new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .92, 10), mat(0xEDE6D6))).position.y = .46;
      const toile = etiquette(512, 64, (x, l, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#fff' : '#F0766F'; x.fillRect(i * l / 8, 0, l / 8, h); } });
      const c = new THREE.Mesh(new THREE.ConeGeometry(.32, .12, 32, 1, true), new THREE.MeshStandardMaterial({ map:toile, roughness:.8, side:THREE.DoubleSide }));
      c.position.y = .92; p.add(c);
    }
    if (v === 'golf') {                                                        // un club posé en travers du dos, la balle devant lui
      const dessus = t => { const P = dos.getPointAt(t), T = dos.getTangentAt(t), B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize();
        return P.addScaledVector(B, rayonCorps(t) * 1.08 + .05).add(new THREE.Vector3(0, 0, .14)); };
      const base = dessus(.22), haut = dessus(.7);
      const axe = haut.clone().sub(base), L = axe.length();
      const g = new THREE.Group(); g.position.copy(base); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axe.normalize()); corps.add(g);
      ajoute(g, new THREE.Mesh(new THREE.CylinderGeometry(.014, .011, L, 10), mat(0xE3E7EC, { metalness:.6, roughness:.25 }))).position.y = L / 2;
      ajoute(g, new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .18, 10), mat(0x111111))).position.y = L - .07;
      const t = new THREE.Mesh(new THREE.BoxGeometry(.05, .07, .15), mat(0xD6DBE1, { metalness:.8, roughness:.2 })); t.position.set(0, -.015, .04); g.add(t);
      corps.add(boule(.03, mat(0xFFFFFF, { roughness:.4 }), [1, 1, 1], [-.72, solLocal + .03, .04], 20));
    }
    if (v === 'vice') {                                                        // ambiance néon façon Vice City : aviateur, chaîne en or
      contre.color.set(0xFF3FA4); contre.intensity = 7; contre.position.set(2.2, 1.6, -1.2);
      const turquoise = new THREE.DirectionalLight(0x3FD8E3, .9); turquoise.position.set(-3, .6, 1.5); scene.add(turquoise);
      cle.intensity = 2.2; cle.color.set(0xFFD9EC);
      lunettes(new THREE.MeshStandardMaterial({ color:0x3A1446, metalness:.6, roughness:.1, transparent:true, opacity:.92 }), mat(0xE7C36A, { metalness:1, roughness:.25 }), .05);
      collier(.86, 26, () => boule(.017, mat(0xE7C36A, { metalness:1, roughness:.2 }), [1.3, .8, 1], [0, 0, 0], 10), .04);
    }
    if (v === 'bob') { const ch = chapeauRond(0xD8C7A3, .12, .14, .18, .18);
      const aile = new THREE.Mesh(new THREE.CylinderGeometry(.18, .27, .06, 40, 1, true), mat(0xD8C7A3, { roughness:.95, side:THREE.DoubleSide })); aile.position.y = -.025; ch.add(aile); }
    if (v === 'paille') chapeauRond(0xE3C77A, .09, .14, .16, .34, 0x1C49A5);
    if (v === 'bonnet') {
      const b = new THREE.Group(); b.position.copy(centre).add(new THREE.Vector3(0, .09, 0)); b.rotation.set(.1, 0, -.15); b.scale.setScalar(1.14); tete.add(b);
      const maille = etiquette(256, 64, (x, l, h) => { x.fillStyle = '#E8665F'; x.fillRect(0, 0, l, h); x.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < l; i += 8) x.fillRect(i, 0, 3, h); });
      maille.wrapS = THREE.RepeatWrapping; maille.repeat.set(3, 1);
      ajoute(b, new THREE.Mesh(new THREE.SphereGeometry(.205, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map:maille, roughness:1 }))).scale.set(1.05, 1.05, 1.05);
      b.add(new THREE.Mesh(new THREE.CylinderGeometry(.218, .218, .05, 32, 1, true), mat(0xD9554E, { roughness:1, side:THREE.DoubleSide })));
      b.add(boule(.055, mat(0xF4F1EA, { roughness:1 }), [1, 1, 1], [0, .22, 0], 16));
    }
    if (v === 'lei') collier(.86, 22, i => boule(.034, mat([0xF0766F, 0xFFD27A, 0xFFFFFF, 0xE85A9B][i % 4], { roughness:.8 }), [1, .7, 1], [0, 0, 0], 12), .06);
    if (v === 'tuba') {                                                        // masque relevé sur le front, tuba sur le côté
      const m = new THREE.Group(); m.position.copy(centre).addScaledVector(face, .12).add(new THREE.Vector3(0, .17, 0)); m.lookAt(m.position.clone().add(face).add(new THREE.Vector3(0, .6, 0))); tete.add(m);
      ajoute(m, new THREE.Mesh(new THREE.TorusGeometry(.075, .016, 8, 28), mat(0x1C1C1C, { roughness:.5 }))).scale.set(1.3, 1, 1);
      const verre = new THREE.Mesh(new THREE.CircleGeometry(.075, 28), new THREE.MeshPhysicalMaterial({ color:0x9FD8FF, roughness:.05, transparent:true, opacity:.45 })); verre.scale.set(1.3, 1, 1); verre.position.z = .004; m.add(verre);
      const sangle = new THREE.Mesh(new THREE.TorusGeometry(.255, .012, 6, 40), mat(0x1C1C1C)); sangle.position.copy(centre).add(new THREE.Vector3(0, .08, 0)); sangle.rotation.x = Math.PI / 2; sangle.rotation.y = .2; tete.add(sangle);
      const tc = new THREE.CatmullRomCurve3([centre.clone().addScaledVector(cote, .25).add(new THREE.Vector3(0, .02, 0)), centre.clone().addScaledVector(cote, .26).add(new THREE.Vector3(0, .2, 0)), centre.clone().addScaledVector(cote, .2).add(new THREE.Vector3(0, .36, 0)).addScaledVector(face, -.1)]);
      tete.add(new THREE.Mesh(new THREE.TubeGeometry(tc, 20, .016, 8, false), mat(0xF2D23C, { roughness:.5 })));
    }
    if (v === 'canard') {                                                      // un petit canard en caoutchouc posé sur le dos
      const c = new THREE.Group(); c.position.copy(surCorps(.55, .25, .0)); c.scale.setScalar(1.25); c.rotation.y = -.9; corps.add(c);
      const jaune = mat(0xFFD23F, { roughness:.35 });
      c.add(boule(.07, jaune, [1.25, .85, 1], [0, .055, 0], 20)); c.add(boule(.048, jaune, [1, 1, 1], [-.06, .13, 0], 18));
      const bec = new THREE.Mesh(new THREE.ConeGeometry(.02, .045, 10), mat(0xF27A1A, { roughness:.4 })); bec.rotation.z = Math.PI / 2; bec.position.set(-.115, .125, 0); c.add(bec);
      for (const s of [-1, 1]) c.add(boule(.007, noir, [1, 1, 1], [-.085, .145, s * .028], 8));
    }
    if (v === 'casque') {                                                      // casque audio
      const noirM = mat(0x16181D, { roughness:.4 }), corail = mat(0xF0766F, { roughness:.5 });
      const arceau = new THREE.Mesh(new THREE.TorusGeometry(.3, .016, 8, 32, Math.PI), noirM);
      arceau.position.copy(centre).add(new THREE.Vector3(0, .02, 0)); arceau.lookAt(arceau.position.clone().add(face)); tete.add(arceau);
      for (const s of [-1, 1]) {
        const oreille = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .04, 24), noirM);
        oreille.position.copy(centre).addScaledVector(cote, s * .3).add(new THREE.Vector3(0, .02, 0)); oreille.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cote); tete.add(oreille);
        const disque = new THREE.Mesh(new THREE.CircleGeometry(.04, 20), corail); disque.position.copy(oreille.position).addScaledVector(cote, s * .021); disque.lookAt(disque.position.clone().addScaledVector(cote, s)); tete.add(disque);
      }
    }
  }

  habiller(VARIANTE);

  /* algues : quelques touffes sur le dos et le haut du flanc, au hasard */
  { const algue = new THREE.MeshStandardMaterial({ color:0x6E9444, roughness:.7 }), algueSombre = new THREE.MeshStandardMaterial({ color:0x5B7A3C, roughness:.9 });
    const libres = VARIANTE === 'tshirt' ? [.22, .3, .38, .46, .54] : [.22, .3, .38, .46, .54, .62, .7, .78];
    const choix = libres.sort(() => Math.random() - .5).slice(0, 7);
    for (const t of choix) {
      const a = .15 + Math.random() * .75, P = dos.getPointAt(t), T = dos.getTangentAt(t);
      const B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize(), r = rayonCorps(t);
      const normale = B.clone().multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, 0, Math.sin(a))).normalize();
      const touffe = new THREE.Group(); touffe.position.copy(P).addScaledVector(B, Math.cos(a) * r).add(new THREE.Vector3(0, 0, Math.sin(a) * r * 1.1));
      touffe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normale); corps.add(touffe);
      touffe.add(boule(.03 + Math.random() * .02, algueSombre, [1.5, .15, 1.2], [0, 0, 0], 14));
      const n = 5 + (Math.random() * 5 | 0);
      for (let i = 0; i < n; i++) {
        const h = .07 + Math.random() * .1, brin = new THREE.Mesh(new THREE.ConeGeometry(.012, h, 5), algue);
        brin.geometry.translate(0, h / 2, 0);
        brin.position.set((Math.random() - .5) * .07, 0, (Math.random() - .5) * .05);
        brin.rotation.set((Math.random() - .5) * .9, Math.random() * 3, (Math.random() - .5) * .9 + .35);   // couchés vers l'arrière
        touffe.add(brin);
      }
    }
  }

  // un léger sourire sous le museau : le visage reste aimable
  { const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10 - .5;
      pts.push(museau.clone().addScaledVector(cote, u * .2).addScaledVector(face, .1 - u * u * .1).add(new THREE.Vector3(0, -.075 + u * u * .1, 0))); }
    tete.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .006, 6, false), new THREE.MeshStandardMaterial({ color:0x2B2E2C, roughness:.8 }))); }

  /* croûtes d'algues claires et irrégulières, comme sur la photo : plaques en relief sur le dos et le flanc */
  { const croute = VARIANTE === 'rose' ? [0xC08A7C, 0xA88F72, 0xB59A80] : [0x7A7A6A, 0x6E7562, 0x82806C]; croute.forEach((c, i, arr) => arr[i] = new THREE.MeshStandardMaterial({ color:c, roughness:1 }));
    const nb = VARIANTE === 'tshirt' ? 26 : 50;
    for (let i = 0; i < nb; i++) {
      const t = VARIANTE === 'tshirt' ? .15 + Math.random() * .42 : .12 + Math.random() * .8, a = -.2 + Math.random() * 1.9;
      const P = dos.getPointAt(t), T = dos.getTangentAt(t), B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize();
      const r = rayonCorps(t) * (1 + bosses(t, a) * Math.min(1, t * 6));
      const normale = B.clone().multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, 0, Math.sin(a))).normalize();
      const s = .014 + Math.random() * .022;
      const plaque = boule(s, croute[i % 3], [1.3 + Math.random() * .9, .22, 1 + Math.random() * .7], [0, 0, 0], 12);
      plaque.position.copy(P).addScaledVector(B, Math.cos(a) * r * (Math.cos(a) < 0 ? .86 : 1)).add(new THREE.Vector3(0, 0, Math.sin(a) * r * 1.13));
      plaque.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normale); plaque.rotateY(Math.random() * 3);
      corps.add(plaque);
    }
  }



  /* ---------- l'alligator (ultra rare) : on masque le lamantin et on construit un alligator ---------- */
  if (VARIANTE === 'gator') {
    const sol = new THREE.Box3().setFromObject(corps).min.y;
    corps.children.forEach(c => { if (c !== cou) c.visible = false; });
    tete.children.slice().forEach(c => c.visible = false);
    // peau : écailles rectangulaires en rangées, teinte vert-olive avec variations
    const ec = document.createElement('canvas'); ec.width = 256; ec.height = 256; const x2 = ec.getContext('2d');
    const eb = document.createElement('canvas'); eb.width = 256; eb.height = 256; const b2 = eb.getContext('2d');
    x2.fillStyle = '#3F5A2E'; x2.fillRect(0, 0, 256, 256); b2.fillStyle = '#000'; b2.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 16; r++) for (let c = 0; c < 12; c++) {
      const w = 21, h = 16, x = c * w + (r % 2) * w / 2, y = r * h, v = Math.random();
      x2.fillStyle = `rgb(${58 + v * 26 | 0},${84 + v * 30 | 0},${42 + v * 14 | 0})`; x2.beginPath(); x2.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 4); x2.fill();
      const gr = b2.createRadialGradient(x + w / 2, y + h / 2, 1, x + w / 2, y + h / 2, w / 1.6); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#222');
      b2.fillStyle = gr; b2.beginPath(); b2.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 4); b2.fill(); }
    const tPeau = new THREE.CanvasTexture(ec); tPeau.colorSpace = THREE.SRGBColorSpace; tPeau.wrapS = tPeau.wrapT = THREE.RepeatWrapping; tPeau.repeat.set(6, 3);
    const tRel = new THREE.CanvasTexture(eb); tRel.wrapS = tRel.wrapT = THREE.RepeatWrapping; tRel.repeat.set(6, 3);
    const vert = new THREE.MeshStandardMaterial({ map:tPeau, bumpMap:tRel, bumpScale:2.2, roughness:.62 });
    const ventre = new THREE.MeshStandardMaterial({ color:0x8E8F62, roughness:.75, bumpMap:tRel, bumpScale:1 });
    const plaque = new THREE.MeshStandardMaterial({ color:0x2D4220, roughness:.55, flatShading:true });
    const blanc = new THREE.MeshStandardMaterial({ color:0xF4F0DF, roughness:.35 });
    const or = new THREE.MeshStandardMaterial({ color:0xC9A53A, roughness:.15, emissive:0x2A1E00 });
    const noirG = new THREE.MeshStandardMaterial({ color:0x0A0A0A, roughness:.2 });
    const y0 = sol + .15;
    // colonne en S : le corps file vers la droite, la queue se recourbe vers l'arrière
    const axe = [[-.36, y0 + .03, 0], [-.05, y0 + .05, .02], [.3, y0 + .05, 0], [.62, y0 + .03, -.06], [.95, y0, -.2], [1.25, y0 - .03, -.42], [1.5, y0 - .06, -.7]].map(p => new THREE.Vector3(...p));
    const dosG = new THREE.CatmullRomCurve3(axe);
    const prof = [[0, .15], [.12, .2], [.3, .21], [.45, .17], [.6, .11], [.8, .06], [1, .012]];
    const rayonG = t => { for (let k = 1; k < prof.length; k++) if (t <= prof[k][0]) { const u = (t - prof[k - 1][0]) / (prof[k][0] - prof[k - 1][0]); return prof[k - 1][1] + (prof[k][1] - prof[k - 1][1]) * u; } return .01; };
    const corpsG = new THREE.Mesh(fuseau(axe, prof, 48, 120), vert); corps.add(corpsG);
    corpsG.geometry.scale(1, .72, 1);
    // dessous clair
    const vtr = new THREE.Mesh(fuseau(axe.map(p => p.clone().add(new THREE.Vector3(0, -.05, 0))), prof.map(([t, r]) => [t, r * .82]), 32, 80), ventre); vtr.geometry.scale(1, .55, 1); corps.add(vtr);
    // ostéodermes : rangées de bosses pointues sur le dos, une double crête sur la queue
    for (let i = 0; i < 46; i++) {
      const t = .04 + i * .021, P = dosG.getPointAt(Math.min(t, .99)), T = dosG.getTangentAt(Math.min(t, .99)), r = rayonG(t);
      const lat = new THREE.Vector3(-T.z, 0, T.x).normalize(), haut = P.y * .72 + r * .72;
      const rangs = t < .55 ? [-.62, -.25, .25, .62] : [-.18, .18];
      for (const k of rangs) {
        const h = ((t < .55 ? .03 : .055 * (1 - (t - .55) / .5)) * (1 - Math.abs(k) * .35) + .01) * (.7 + Math.random() * .6);
        const pic = new THREE.Mesh(new THREE.ConeGeometry(.026 * (1 - t * .5), h, 4), plaque); pic.scale.z = 1.6;
        pic.position.copy(P).addScaledVector(lat, k * r).setY(haut - Math.abs(k) * r * .35 + h * .35);
        pic.rotation.y = Math.atan2(T.x, T.z) + (Math.random() - .5) * .4; corps.add(pic);
      }
    }
    // pattes, pliées, avec doigts griffus
    for (const [t, z] of [[.1, 1], [.1, -1], [.48, 1], [.48, -1]]) {
      const P = dosG.getPointAt(t), T = dosG.getTangentAt(t), lat = new THREE.Vector3(-T.z, 0, T.x).normalize().multiplyScalar(z);
      const base = P.clone().addScaledVector(lat, rayonG(t) * .85).setY(y0 - .02);
      const cuisse = boule(.06, vert, [1.3, 1, 1], [0, 0, 0], 18); cuisse.position.copy(base); corps.add(cuisse);
      const tibia = boule(.04, vert, [1, 1.8, 1], [0, 0, 0], 14); tibia.position.copy(base).addScaledVector(lat, .07).setY(sol + .06); tibia.rotation.z = z * .3; corps.add(tibia);
      const pied = boule(.05, vert, [1.6, .35, 1.3], [0, 0, 0], 14); pied.position.copy(base).addScaledVector(lat, .1).setY(sol + .012); corps.add(pied);
      for (let d = -2; d <= 2; d++) { const dg = boule(.012, vert, [2.6, .5, .8], [0, 0, 0], 8); dg.position.copy(pied.position).add(new THREE.Vector3(-.07, -.004, d * .022)).addScaledVector(lat, .02); corps.add(dg);
        const gr = new THREE.Mesh(new THREE.ConeGeometry(.005, .02, 4), blanc); gr.position.copy(dg.position).add(new THREE.Vector3(-.035, 0, 0)); gr.rotation.z = Math.PI / 2; corps.add(gr); }
    }
    // tête : un vrai museau plat en U (vue de dessus extrudée), arcades, yeux en tourelles
    cou.position.set(-.34, y0 + .02, 0);
    const tg = new THREE.Group(); tg.rotation.y = .62; tete.add(tg);
    const forme = (larg, long, k) => { const s = new THREE.Shape(); s.moveTo(0, -larg);
      s.bezierCurveTo(-long * .45, -larg * .95, -long * .8, -larg * .62, -long * .98, -larg * .5 * k);
      s.quadraticCurveTo(-long * 1.06, 0, -long * .98, larg * .5 * k);
      s.bezierCurveTo(-long * .8, larg * .62, -long * .45, larg * .95, 0, larg); s.lineTo(.06, larg); s.lineTo(.06, -larg); return s; };
    const ext = (shape, ep, mat, y) => { const g = new THREE.ExtrudeGeometry(shape, { depth:ep, bevelEnabled:true, bevelThickness:.018, bevelSize:.016, bevelSegments:3, curveSegments:24 });
      g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.y = y; tg.add(m); return m; };
    ext(forme(.115, .5, .7), .045, vert, -.01);                     // mâchoire supérieure
    ext(forme(.1, .46, .7), .022, ventre, -.06);                    // mâchoire inférieure
    tg.add(boule(.14, vert, [1.05, .62, 1.05], [.04, .02, 0], 28)); // crâne
    for (const z of [-1, 1]) {
      tg.add(boule(.035, vert, [1.5, .9, 1], [-.05, .085, z * .06], 18));        // tourelle de l'œil
      tg.add(boule(.023, or, [1, .85, 1], [-.068, .1, z * .07], 16));            // œil doré
      tg.add(boule(.009, noirG, [.35, 1.3, .5], [-.088, .1, z * .073], 8));      // pupille fendue
      const arc = boule(.03, plaque, [1.8, .45, .8], [-.04, .118, z * .062], 10); arc.rotation.y = z * .3; tg.add(arc);   // arcade
      tg.add(boule(.012, plaque, [1, .7, 1], [-.47, .05, z * .022], 8));          // narines au bout du museau
      // rangée de dents, un peu irrégulière, qui dépasse sur le côté comme chez l'alligator
      for (let k = 0; k < 11; k++) { const u = k / 10, x = -.42 + u * .38, w = .1 * Math.sqrt(1 - Math.pow((x + .46) / .5 - 1, 2) * .55);
        const d = new THREE.Mesh(new THREE.ConeGeometry(.0065, .022 + (k % 3 === 1 ? .01 : 0), 5), blanc); d.position.set(x, -.03, z * (w + .012)); d.scale.setScalar(1.5); d.rotation.x = Math.PI; tg.add(d); }
    }
    tg.add(boule(.02, vert, [1.3, .6, 1.4], [-.47, .045, 0], 10));               // bosse du nez
    lamantin.scale.setScalar(1.22); lamantin.position.x = -.12; lamantin.updateMatrixWorld(true);   // un peu plus grand que les lamantins
    for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.ConeGeometry(.012, .025, 4), plaque); p.position.set(.04 + k * .03, .1 - k * .004, (k % 2 ? 1 : -1) * .04); tg.add(p); }   // écussons de la nuque
  }

  // ombre de contact, puis on pose le lamantin exactement au sol
  { const oc = document.createElement('canvas'); oc.width = oc.height = 128; const o = oc.getContext('2d');
    const gr = o.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(5,15,45,.55)'); gr.addColorStop(1, 'rgba(5,15,45,0)');
    o.fillStyle = gr; o.fillRect(0, 0, 128, 128);
    const ombre = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .7), new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(oc), transparent:true, depthWrite:false }));
    ombre.rotation.x = -Math.PI / 2; ombre.position.set(.45 * Math.cos(ORIENT), .002, -.45 * Math.sin(ORIENT)); ombre.rotation.z = ORIENT; scene.add(ombre); }
  const bb = new THREE.Box3().setFromObject(corps); lamantin.position.y = -bb.min.y;

  // la ligne du sol (y = 0) tombe pile sur le bord de la case
  camera.updateMatrixWorld();
  const sol = new THREE.Vector3(.45 * Math.cos(ORIENT), 0, -.45 * Math.sin(ORIENT)).project(camera);
  hote.style.setProperty('--sol', ((1 - sol.y) / 2 * H2).toFixed(1) + 'px');


  /* bulle de dialogue : un drapeau anglophone s'envole quand on touche un code */
  const DRAPEAUX = {
    us: '<svg viewBox="0 0 38 20"><rect width="38" height="20" fill="#B22234"/>' + [1, 3, 5, 7, 9, 11].map(i => `<rect y="${i * 20 / 13}" width="38" height="${20 / 13}" fill="#fff"/>`).join('') + '<rect width="16" height="10.8" fill="#3C3B6E"/>' + Array.from({ length: 12 }, (_, k) => `<circle cx="${2 + (k % 4) * 4 + (k > 3 && k < 8 ? 2 : 0)}" cy="${2 + Math.floor(k / 4) * 3.4}" r=".7" fill="#fff"/>`).join('') + '</svg>',
    uk: '<svg viewBox="0 0 60 30"><clipPath id="bu"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#bu)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>',
    au: '<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#012169"/><g transform="scale(.5)"><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g>' + [[15, 23, 2.6], [45, 6, 1.4], [38, 14, 1.4], [52, 12, 1.4], [45, 25, 1.4], [49, 17, .8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('') + '</svg>'
  };
  // tous les 10 codes touchés : la Courbe des Temps à la place du drapeau
  DRAPEAUX.courbe = '<svg viewBox="0 0 38 20"><path d="M2 12 C9 10.5 14 13 20 11.6 S30 10.6 35 11.6" fill="none" stroke="#1C49A5" stroke-width="1.8" stroke-linecap="round"/><path d="M32.6 8.8 L35.6 11.6 L32.6 14.4" fill="none" stroke="#1C49A5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8.4 V14.6" stroke="#F0766F" stroke-width="2" stroke-linecap="round"/><path d="M23 8.2 V14.4" stroke="#1C49A5" stroke-width="2" stroke-linecap="round"/></svg>';
  let codesTouches = 0;
  // émotes de l'alligator : les pièces difficiles de la Courbe, et un jacaranda très rare
  const ic = (txt, fond, coul, bord) => `<svg viewBox="0 0 38 20"><rect x="1" y="1" width="36" height="18" rx="5" fill="${fond}"${bord ? ` stroke="${bord}" stroke-width="1.6"` : ''}/><text x="19" y="14.5" text-anchor="middle" font-family="Geist,Helvetica,Arial,sans-serif" font-weight="800" font-size="12" fill="${coul}">${txt}</text></svg>`;
  Object.assign(DRAPEAUX, {
    crochets: ic('[ &#160; ]', '#EAF0FF', '#1C49A5'),
    en: ic('-en', '#FFD27A', '#6B4E00'),
    ing: '<svg viewBox="0 0 38 20"><rect x="1" y="1" width="36" height="18" rx="5" fill="#E2F5EA"/><path d="M8 5 h-3 v10 h3 M5 10 H30 M25 6 L30 10 L25 14" fill="none" stroke="#2F8A64" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    t2: ic('T-2', '#F0766F', '#fff', '#8E2A23'),
    t1: ic('T+1', '#F0766F', '#fff', '#8E2A23'),
    jacaranda: '<svg viewBox="0 0 38 20"><path d="M19 19 V12 M19 13 L14 9 M19 13 L24 9" stroke="#4B3A66" stroke-width="1.6" stroke-linecap="round"/>' + [[13,7],[17,5],[21,5],[25,7],[15,10],[23,10],[19,8],[11,10],[27,10],[19,3]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="2.6" fill="${['#8E7CF0','#A48BFF','#B9A4FF','#7B68D9'][i%4]}"/>`).join('') + '</svg>'
  });
  const EMOTES_GATOR = ['crochets', 'en', 'ing', 't2', 't1'];
  function bulle(force){
    codesTouches++;
    if (!force && VARIANTE === 'gator') force = Math.random() < .06 ? 'jacaranda' : EMOTES_GATOR[Math.random() * EMOTES_GATOR.length | 0];
    const r = Math.random(), quel = force ? force : codesTouches % 10 === 0 ? 'courbe' : r < .6 ? 'us' : r < .8 ? 'uk' : 'au';   // surtout les États-Unis
    const b = document.createElement('div'); b.className = 'bulle-drapeau'; b.innerHTML = DRAPEAUX[quel];
    hote.appendChild(b); setTimeout(() => b.remove(), 1700);
  }

  // bulle d'arrivée : seulement une fois le lamantin réellement affiché
  if (hote.dataset.bulle === 'arrivee') { const essai = () => { if (!hote.offsetParent) return setTimeout(essai, 300); setTimeout(() => { emote = 0; actif = performance.now(); bulle(); }, 1200); }; setTimeout(essai, 300); }

  // une page peut demander une émote précise (ex. la Courbe des Temps)
  document.addEventListener('lamantin:emote', e => { if (!hote.offsetParent) return; emote = 0; actif = performance.now(); bulle(e.detail || null); });

  /* regard : la tête suit le pointeur, le corps suit un peu */
  let cibleLacet = 0, cibleTangage = 0, lacet = 0, tangage = 0, emote = -1;
  let actif = performance.now();                                   // au repos, on ralentit pour épargner la batterie
  addEventListener('pointermove', e => {
    actif = performance.now();
    const r = rendu.domElement.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width * .38), dy = e.clientY - (r.top + r.height * .3);
    cibleLacet = Math.max(-1, Math.min(1, dx / 420)) * .6;
    cibleTangage = Math.max(-1, Math.min(1, dy / 320)) * .42;
  }, { passive:true });
  document.querySelectorAll('[data-vitre]').forEach(b => b.addEventListener('click', () => { emote = 0; actif = performance.now(); bulle(); }));

  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, t0 = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) boucle(); }).observe(hote);

  function boucle(now = performance.now()){
    if (!visible) return;
    const dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    const k = calme ? 1 : 1 - Math.pow(.0015, dt);
    lacet += (cibleLacet - lacet) * k; tangage += (cibleTangage - tangage) * k;
    tete.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), lacet)
      .multiply(new THREE.Quaternion().setFromAxisAngle(cote, tangage));
    corps.rotation.y = ORIENT + lacet * .22;
    if (!calme) corps.scale.y = 1 + Math.sin(now / 900) * .006;      // respiration
    if (emote >= 0) {
      emote += dt;
      const e = emote;
      tete.rotateOnWorldAxis(cote.clone().applyQuaternion(corps.quaternion), e < .5 ? Math.sin(e / .5 * Math.PI) * .18 : 0);
      if (e > .6) emote = -1;
    }
    rendu.render(scene, camera);
    if (now - actif > 4000 && emote < 0) setTimeout(() => requestAnimationFrame(boucle), 110);
    else requestAnimationFrame(boucle);
  }
  boucle();
}
