/* Lamantin en 3D (three.js) : posé sur la case de la Courbe, il suit la souris
   et fait une bulle avec un drapeau (US, UK ou Australie) quand on touche un code. */
import * as THREE from './vendor/three.module.min.js';   // three.js r160, hébergé avec le site

const hote = document.getElementById('lamantin');

/* chaque visite tire un lamantin différent ; ?lamantin=nom pour en forcer un */
const TIRAGE = [['classique',12],['helice',3.5],['florida',3.5],['usa',3.5],['courbe',3.5],['tshirt',3.5],['uk',3.5],['australie',3.5],['canada',3.5],['france',3.5],['parasol',3.5],['vice',3.5],['bob',3.5],['paille',3.5],['bonnet',3.5],['lei',3.5],['tuba',3.5],['monaco',3.5],['casque',3.5],['noel',new Date().getMonth()===11?20:3.5],['drapeau',1],['rose',1],['gator',0.67]];   // rose : le très rare
function tirer(){
  try { const v = new URLSearchParams(location.search).get('lamantin'); if (v && TIRAGE.some(t => t[0] === v)) return v; } catch (e) {}
  let r = Math.random() * TIRAGE.reduce((s, t) => s + t[1], 0);
  for (const [nom, poids] of TIRAGE) { if ((r -= poids) < 0) return nom; } return 'classique';
}
const VARIANTE = (document.getElementById('lamantin') && document.getElementById('lamantin').dataset.variante) || tirer();
if (hote) try { lancer(); } catch (e) { hote.remove(); }

function lancer(){
  const L = VARIANTE === 'gator' ? 360 : 200, H = 140, H2 = VARIANTE === 'drapeau' ? 230 : 140;   // le grand drapeau : cadre plus haut
  if (H2 !== H) hote.style.height = H2 + 'px';   // l'alligator, bien plus long, a un cadre plus large
  if (L !== 200) { hote.style.width = L + 'px'; }
  const rendu = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  rendu.setPixelRatio(Math.min((devicePixelRatio || 1) * 2.4, 4.8));   // net malgré l’agrandissement (x2,4)
  rendu.setSize(L, H2);
  rendu.outputColorSpace = THREE.SRGBColorSpace;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.05;
  hote.appendChild(rendu.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, L / H, 0.1, 50);
  camera.setViewOffset(L, H, 0, H - H2, L, H2);
  camera.position.set(-0.1, 1.15, 5.2);
  camera.lookAt(0.4, 0.32, 0);

  scene.add(new THREE.HemisphereLight(0xEEF3FF, 0x2A4483, 1.05));
  const cle = new THREE.DirectionalLight(0xFFF6EA, 2.8); cle.position.set(-2.5, 3.5, 3); scene.add(cle);
  const contre = new THREE.DirectionalLight(0xB9CCFF, 2.2); contre.position.set(2, 2.5, -3); scene.add(contre);
  const liseré = new THREE.DirectionalLight(0xDDE6FF, 1.1); liseré.position.set(-3, .6, -2.5); scene.add(liseré);   // liseré sur la silhouette

  /* peau : gris-brun velouté, marbrures douces, voile d'algues et cicatrices peintes dans la texture (plus de plaques en relief) */
  const ROSE = VARIANTE === 'rose', T = 512;
  const c = document.createElement('canvas'); c.width = c.height = T;
  const g = c.getContext('2d'); g.fillStyle = ROSE ? '#9C5A55' : '#565B57'; g.fillRect(0, 0, T, T);
  const tache = (x, y, r, couleur) => { for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) {   // raccord sans couture
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); gr.addColorStop(0, couleur); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2); } };
  for (let i = 0; i < 70; i++) tache(Math.random() * T, Math.random() * T, 18 + Math.random() * 60,
    Math.random() < .5 ? (ROSE ? 'rgba(190,120,110,.16)' : 'rgba(120,124,116,.16)') : 'rgba(30,32,30,.14)');      // marbrures
  for (let i = 0; i < 22; i++) tache(Math.random() * T, Math.random() * T * .55, 20 + Math.random() * 46, ROSE ? 'rgba(96,128,56,.32)' : 'rgba(92,126,58,.2)'); // algues
  for (let i = 0; i < 9000; i++) { const v = 70 + Math.random() * 60 | 0;
    g.fillStyle = ROSE ? `rgba(${v + 80},${v + 20},${v + 16},${Math.random() * .16})` : `rgba(${v},${v + 3},${v + 1},${Math.random() * .16})`;
    g.fillRect(Math.random() * T, Math.random() * T, 1.2, 1.2); }
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(186,188,178,.22)'; g.lineWidth = 1.4 + Math.random() * 1.4;
    const x = Math.random() * T, y = Math.random() * T; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 26, y + 10 - Math.random() * 20, x + 50 + Math.random() * 30, y + Math.random() * 14 - 7); g.stroke(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  // relief : grain très fin et rides souples, sans bosses dures
  const rc = document.createElement('canvas'); rc.width = rc.height = T; const rg = rc.getContext('2d');
  rg.fillStyle = '#808080'; rg.fillRect(0, 0, T, T);
  for (let i = 0; i < 14000; i++) { const v = Math.random() * 255 | 0; rg.fillStyle = `rgba(${v},${v},${v},.08)`; rg.fillRect(Math.random() * T, Math.random() * T, 2, 2); }
  rg.filter = 'blur(.6px)'; rg.drawImage(rc, 0, 0); rg.filter = 'none';
  for (let y = 0; y < T; y += 16 + Math.random() * 12) { rg.strokeStyle = 'rgba(50,50,50,.12)'; rg.lineWidth = 2; rg.beginPath(); rg.moveTo(0, y); for (let x = 0; x <= T; x += 24) rg.lineTo(x, y + Math.sin(x * .025 + y) * 3); rg.stroke(); }
  const relief = new THREE.CanvasTexture(rc); relief.wrapS = relief.wrapT = THREE.RepeatWrapping; relief.repeat.set(3, 2);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
  // fini légèrement satiné : un lamantin sort de l'eau, sa peau garde un voile humide
  const peau = new THREE.MeshPhysicalMaterial({ map:tex, bumpMap:relief, bumpScale:.35, roughness:.72, metalness:0, clearcoat:.28, clearcoatRoughness:.5, sheen:.4, sheenRoughness:.8, sheenColor:new THREE.Color(ROSE ? 0xE8B8B0 : 0xB8C4C0) });
  const peauMuseau = peau;
  const peauClaire = new THREE.MeshStandardMaterial({ color:ROSE ? 0xB06C66 : 0x676C67, roughness:.95 });
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
  const bosses = (t, a) => .026 * Math.sin(7 * t + ph[0]) * Math.sin(3 * a + ph[1]) + .012 * Math.sin(11 * t + ph[2]) * Math.cos(4 * a + ph[3]);   // rondeurs douces, plus de grumeaux
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
  { const q = boule(.33, peau, [1.15, .12, 1], [1.4, .29, 0], 64); q.rotation.set(.75, 0, .08);
    // UV à plat (vues de dessus) : plus d'étoile au centre de la pagaie
    const P = q.geometry.attributes.position, U = q.geometry.attributes.uv; for (let i = 0; i < P.count; i++) U.setXY(i, P.getX(i) * .9 + .5, P.getZ(i) * .9 + .5); U.needsUpdate = true;
    corps.add(q); }
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
  const face = new THREE.Vector3(-.75, -.12, .65).normalize();          // regarde vers l'avant-gauche
  const cote = new THREE.Vector3(.65, 0, .75).normalize();
  const centre = new THREE.Vector3(-.04, .08, 0);
  /* crâne et museau d'un seul tenant : une surface balayée, lisse, sans coutures entre boules */
  { const Y = new THREE.Vector3(0, 1, 0);
    const chemin = new THREE.CatmullRomCurve3([
      new THREE.Vector3(.2, -.03, 0), new THREE.Vector3(.09, 0, 0), centre.clone().add(new THREE.Vector3(0, -.015, 0)),
      centre.clone().addScaledVector(face, .12).add(new THREE.Vector3(0, -.035, 0)),
      centre.clone().addScaledVector(face, .2).add(new THREE.Vector3(0, -.06, 0)).addScaledVector(face, .035)]);
    const R = [[0, .272], [.25, .262], [.5, .246], [.7, .2], [.84, .158], [1, .158]], FIN = .84;
    const rayon = t => { if (t > FIN) { const u = (t - FIN) / (1 - FIN); return .158 * Math.sqrt(Math.max(0, 1 - u * u)); }
      for (let k = 1; k < R.length; k++) if (t <= R[k][0]) { const [t0, r0] = R[k - 1], [t1, r1] = R[k], u = (t - t0) / (t1 - t0), e = u * u * (3 - 2 * u); return r0 + (r1 - r0) * e; } return 0; };
    const n = 90, radial = 64, pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, P = chemin.getPointAt(t), T = chemin.getTangentAt(t);
      const cote2 = new THREE.Vector3().crossVectors(T, Y).normalize(), haut = new THREE.Vector3().crossVectors(cote2, T).normalize();
      const r = rayon(t), large = 1.02 + .1 * Math.max(0, 1 - t / .35), bas = t < .6 ? .9 : .93;
      for (let j = 0; j <= radial; j++) {
        const a = j / radial * Math.PI * 2, ch = Math.cos(a), sh = Math.sin(a);
        const v = P.clone().addScaledVector(haut, ch * r * (ch < 0 ? bas * .92 : .95)).addScaledVector(cote2, sh * r * large);
        pos.push(v.x, v.y, v.z); uv.push(j / radial, t * .5);
      }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); tete.add(new THREE.Mesh(g, peau)); }
  // gros museau carré, lèvre supérieure fendue en deux lobes
  const museau = centre.clone().addScaledVector(face, .2).add(new THREE.Vector3(0, -.06, 0));
  for (const s of [-1, 1]) {
    const lobe = boule(.118, peauMuseau, [.88, .86, .95], museau.clone().addScaledVector(cote, s * .06).addScaledVector(face, .02).toArray(), 32);
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
    cap.rotation.y = Math.atan2(vers.x, vers.z); cap.scale.setScalar(1.5);
    cap.position.copy(centre).add(new THREE.Vector3(0, .13, 0)).addScaledVector(face, -.02);
    cap.rotateX(-.12); tete.add(cap);
  }
  const ecrire = (x, txt, couleur, taille, cx, cy, police = '800') => {
    x.save(); x.translate(cx, cy); x.scale(.75, 1); x.fillStyle = couleur; x.font = `${police} ${taille}px Geist, Helvetica, Arial, sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 0, 0); x.restore(); };

  function habiller(v){
    if (v === 'helice') {             // cicatrices d'hélice, cicatrisées, en biais sur le flanc visible
      const cic = new THREE.MeshStandardMaterial({ color:0xEDE4D8, roughness:.9, emissive:0x2A241E });
      for (const t0 of [.4, .47, .54]) {
        const pts = [];
        for (let k = 0; k <= 12; k++) {
          const a = .15 + k / 12 * 1.35, t = t0 + k / 12 * .05, P = dos.getPointAt(t), T = dos.getTangentAt(t);
          const B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize(), r = rayonCorps(t) + .003;
          pts.push(P.clone().addScaledVector(B, Math.cos(a) * r).add(new THREE.Vector3(0, 0, Math.sin(a) * r * 1.1)));
        }
        corps.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .02, 6, false), cic));
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
      const k = new THREE.Group(); k.position.copy(centre).add(new THREE.Vector3(0, .17, 0)); k.rotation.set(-.12, 0, .12); k.scale.setScalar(1.35); tete.add(k);
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
    if (v === 'lei') collier(.86, 18, i => boule(.052, mat([0xF0766F, 0xFFD27A, 0xFFFFFF, 0xE85A9B][i % 4], { roughness:.8 }), [1, .7, 1], [0, 0, 0], 12), .06);
    if (v === 'tuba') {                                                        // masque relevé sur le front, tuba sur le côté
      const m = new THREE.Group(); m.position.copy(centre).addScaledVector(face, .12).add(new THREE.Vector3(0, .17, 0)); m.lookAt(m.position.clone().add(face).add(new THREE.Vector3(0, .6, 0))); tete.add(m);
      ajoute(m, new THREE.Mesh(new THREE.TorusGeometry(.1, .024, 8, 28), mat(0x1C49A5, { roughness:.45 }))).scale.set(1.3, 1, 1);
      const verre = new THREE.Mesh(new THREE.CircleGeometry(.1, 28), new THREE.MeshPhysicalMaterial({ color:0xBFE6FF, roughness:.05, transparent:true, opacity:.7 })); verre.scale.set(1.3, 1, 1); verre.position.z = .004; m.add(verre);
      const sangle = new THREE.Mesh(new THREE.TorusGeometry(.255, .012, 6, 40), mat(0x1C1C1C)); sangle.position.copy(centre).add(new THREE.Vector3(0, .08, 0)); sangle.rotation.x = Math.PI / 2; sangle.rotation.y = .2; tete.add(sangle);
      const tc = new THREE.CatmullRomCurve3([centre.clone().addScaledVector(cote, .25).add(new THREE.Vector3(0, .02, 0)), centre.clone().addScaledVector(cote, .26).add(new THREE.Vector3(0, .2, 0)), centre.clone().addScaledVector(cote, .2).add(new THREE.Vector3(0, .36, 0)).addScaledVector(face, -.1)]);
      tete.add(new THREE.Mesh(new THREE.TubeGeometry(tc, 20, .028, 8, false), mat(0xFFD23F, { roughness:.4 })));
    }
    if (v === 'noel') {                                                        // bonnet de Père Noël, pompon qui retombe
      const b = new THREE.Group(); b.position.copy(centre).add(new THREE.Vector3(0, .12, 0)); b.rotation.set(.08, 0, -.18); b.scale.setScalar(1.18); tete.add(b);
      const rouge = mat(0xC8202C, { roughness:.85 }), blancN = mat(0xF7F4EE, { roughness:1 });
      const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push(new THREE.Vector2(.2 * (1 - u) + .012, u * .36)); }
      const cone = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), rouge); b.add(cone);
      cone.geometry.translate(0, 0, 0); const pos = cone.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), f = Math.pow(y / .36, 2); pos.setX(i, pos.getX(i) - f * .2); pos.setY(i, y - f * .08); }
      cone.geometry.computeVertexNormals();
      const bord = new THREE.Mesh(new THREE.TorusGeometry(.205, .045, 12, 36), blancN); bord.rotation.x = Math.PI / 2; b.add(bord);
      b.add(boule(.055, blancN, [1, 1, 1], [-.2, .27, 0], 16));
    }
    if (v === 'drapeau') {                                                     // grand drapeau américain qui flotte derrière lui
      const p = new THREE.Group(); p.position.set(-.08, solLocal, -.62); corps.add(p);   // mât derrière le dos : le drapeau se lit de gauche à droite
      ajoute(p, new THREE.Mesh(new THREE.CylinderGeometry(.016, .02, 1.75, 10), mat(0xC9CCD1, { metalness:.7, roughness:.3 }))).position.y = .875;
      p.add(boule(.036, mat(0xD9B24C, { metalness:1, roughness:.25 }), [1, 1, 1], [0, 1.77, 0], 14));
      const tissu = etiquette(512, 270, (x, l, h) => {
        for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#fff' : '#B22234'; x.fillRect(0, i * h / 13, l, h / 13 + 1); }
        x.fillStyle = '#3C3B6E'; x.fillRect(0, 0, l * .4, h * 7 / 13); x.fillStyle = '#fff';
        for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) { x.beginPath(); x.arc(l * .4 / 12 * (2 * c + 1 + (r % 2)), h * 7 / 13 / 10 * (r + 1), 4.5, 0, 7); x.fill(); } });
      const geo = new THREE.PlaneGeometry(1.05, .55, 30, 10); geo.translate(.525, 0, 0);
      const toile = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map:tissu, roughness:.85, side:THREE.DoubleSide }));
      toile.position.set(.012, 1.46, 0); toile.rotation.y = -.18; p.add(toile);
      drapeauFlotte = { geo, base:Float32Array.from(geo.attributes.position.array) };
    }
    if (v === 'casque') {                                                      // casque audio
      const noirM = mat(0x16181D, { roughness:.4 }), corail = mat(0xF0766F, { roughness:.5 });
      const arceau = new THREE.Mesh(new THREE.TorusGeometry(.3, .026, 8, 32, Math.PI), noirM);
      arceau.position.copy(centre).add(new THREE.Vector3(0, .02, 0)); arceau.lookAt(arceau.position.clone().add(face)); tete.add(arceau);
      for (const s of [-1, 1]) {
        const oreille = new THREE.Mesh(new THREE.CylinderGeometry(.095, .095, .06, 24), corail);
        oreille.position.copy(centre).addScaledVector(cote, s * .3).add(new THREE.Vector3(0, .02, 0)); oreille.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cote); tete.add(oreille);
        const disque = new THREE.Mesh(new THREE.CircleGeometry(.055, 20), noirM); disque.position.copy(oreille.position).addScaledVector(cote, s * .031); disque.lookAt(disque.position.clone().addScaledVector(cote, s)); tete.add(disque);
      }
    }
  }

  let drapeauFlotte = null;
  habiller(VARIANTE);

  /* algues : quelques touffes sur le dos et le haut du flanc, au hasard */
  { const algue = new THREE.MeshStandardMaterial({ color:0x6F8C4A, roughness:.8 }), algueSombre = new THREE.MeshStandardMaterial({ color:0x55703A, roughness:.95 });
    const libres = VARIANTE === 'tshirt' ? [.22, .3, .38, .46, .54] : [.22, .3, .38, .46, .54, .62, .7, .78];
    const choix = libres.sort(() => Math.random() - .5).slice(0, 4);
    for (const t of choix) {
      const a = .15 + Math.random() * .75, P = dos.getPointAt(t), T = dos.getTangentAt(t);
      const B = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1)).normalize(), r = rayonCorps(t);
      const normale = B.clone().multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, 0, Math.sin(a))).normalize();
      const touffe = new THREE.Group(); touffe.position.copy(P).addScaledVector(B, Math.cos(a) * r).add(new THREE.Vector3(0, 0, Math.sin(a) * r * 1.1));
      touffe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normale); corps.add(touffe);
      touffe.add(boule(.026 + Math.random() * .016, algueSombre, [1.5, .12, 1.2], [0, 0, 0], 20));
      const n = 7 + (Math.random() * 5 | 0);
      for (let i = 0; i < n; i++) {
        const h = .06 + Math.random() * .07, brin = new THREE.Mesh(new THREE.ConeGeometry(.0065, h, 6), algue);
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
    const nb = 0;   // les plaques en relief faisaient « cailloux » : le voile est désormais peint dans la peau
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



  let solGator = null; const piedsGator = [];
  /* ---------- l'alligator (ultra rare) : on masque le lamantin et on construit un alligator ---------- */
  if (VARIANTE === 'gator') {
    const sol = new THREE.Box3().setFromObject(corps).min.y;
    corps.children.forEach(c => { if (c !== cou) c.visible = false; });
    solGator = sol;
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
    const or = new THREE.MeshStandardMaterial({ color:0xD69A1E, roughness:.12, emissive:0x3A2200 });
    const noirG = new THREE.MeshStandardMaterial({ color:0x0A0A0A, roughness:.2 });
    const y0 = sol + .15;
    // colonne en S : le corps file vers la droite, la queue se recourbe vers l'arrière
    // queue en S, la pointe retombe par-dessus le bord
    const axe = [[-.36, y0 + .03, 0], [-.05, y0 + .05, .02], [.3, y0 + .05, 0], [.62, y0 + .03, -.06], [.95, y0, -.18], [1.22, y0 - .03, -.24], [1.42, y0 - .08, -.08], [1.56, y0 - .24, .08], [1.62, y0 - .44, .2]].map(p => new THREE.Vector3(...p));
    const dosG = new THREE.CatmullRomCurve3(axe);
    const prof = [[0, .17], [.12, .23], [.3, .245], [.45, .2], [.6, .13], [.8, .065], [1, .012]];
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
      const pied = boule(.05, vert, [1.6, .35, 1.3], [0, 0, 0], 14); pied.position.copy(base).addScaledVector(lat, .1).setY(sol + .012); corps.add(pied); piedsGator.push(pied);
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
    ext(forme(.1, .46, .7), .022, ventre, -.06).rotation.z = .06;   // mâchoire inférieure, à peine entrouverte
    tg.add(boule(.14, vert, [1.05, .62, 1.05], [.04, .02, 0], 28)); // crâne
    for (const z of [-1, 1]) {
      tg.add(boule(.035, vert, [1.5, .9, 1], [-.05, .085, z * .06], 18));        // tourelle de l'œil
      tg.add(boule(.023, or, [1, .85, 1], [-.068, .1, z * .07], 16));            // œil doré
      tg.add(boule(.009, noirG, [.22, 1.4, .5], [-.088, .1, z * .073], 8));      // pupille fendue
      const arc = boule(.032, plaque, [1.9, .5, .85], [-.05, .112, z * .066], 10); arc.rotation.set(z * .25, z * .3, .32); tg.add(arc);   // arcade froncée, plus basse sur l'œil
      tg.add(boule(.012, plaque, [1, .7, 1], [-.47, .05, z * .022], 8));          // narines au bout du museau
      // rangée de dents, un peu irrégulière, qui dépasse sur le côté comme chez l'alligator
      for (let k = 0; k < 11; k++) { const u = k / 10, x = -.42 + u * .38, w = .1 * Math.sqrt(1 - Math.pow((x + .46) / .5 - 1, 2) * .55);
        const d = new THREE.Mesh(new THREE.ConeGeometry(.0065, .022 + (k % 3 === 1 ? .01 : 0), 5), blanc); d.position.set(x, -.03, z * (w + .012)); d.scale.setScalar(1.5); d.rotation.x = Math.PI; tg.add(d); }
    }
    tg.add(boule(.02, vert, [1.3, .6, 1.4], [-.47, .045, 0], 10));               // bosse du nez
    lamantin.scale.set(1.95, 1.8, 1.8); lamantin.position.x = -.62; lamantin.updateMatrixWorld(true);   // plus gros et bien plus long qu'un lamantin
    for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.ConeGeometry(.012, .025, 4), plaque); p.position.set(.04 + k * .03, .1 - k * .004, (k % 2 ? 1 : -1) * .04); tg.add(p); }   // écussons de la nuque
  }

  // ombre de contact, puis on pose le lamantin exactement au sol
  { const oc = document.createElement('canvas'); oc.width = oc.height = 128; const o = oc.getContext('2d');
    const gr = o.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(5,15,45,.55)'); gr.addColorStop(1, 'rgba(5,15,45,0)');
    o.fillStyle = gr; o.fillRect(0, 0, 128, 128);
    const ombre = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .7), new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(oc), transparent:true, depthWrite:false }));
    ombre.rotation.x = -Math.PI / 2; ombre.position.set(.45 * Math.cos(ORIENT), .002, -.45 * Math.sin(ORIENT)); ombre.rotation.z = ORIENT; scene.add(ombre); }
  const bb = new THREE.Box3().setFromObject(corps); lamantin.position.y = -bb.min.y;
  if (piedsGator.length) {   // l'alligator pose ses pattes au sol, la queue peut pendre
    lamantin.updateMatrixWorld(true); const bp = new THREE.Box3(); piedsGator.forEach(p => bp.expandByObject(p));
    lamantin.position.y -= bp.min.y; lamantin.updateMatrixWorld(true); }

  // la ligne du sol (y = 0) tombe pile sur le bord de la case
  camera.updateMatrixWorld();
  const sol = new THREE.Vector3(.45 * Math.cos(ORIENT), 0, piedsGator.length ? .32 : -.45 * Math.sin(ORIENT)).project(camera);   // l'alligator : on cale sur ses pattes avant
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
    if (drapeauFlotte && !calme) {                                    // le drapeau ondule au vent
      const a = drapeauFlotte.geo.attributes.position, b0 = drapeauFlotte.base;
      const rafale = .72 + .28 * Math.sin(now / 1700) * Math.sin(now / 2900 + 1);   // le vent faiblit et reprend
      for (let i = 0; i < a.count; i++) { const x = b0[i * 3], y = b0[i * 3 + 1], u = x / 1.05, bas = (.275 - y) / .55;
        // tissu : il pend sous son poids (le bord libre et le coin bas tombent plus), des plis verticaux partent du mât
        const vague = Math.sin(x * 6.2 - now / 330 + y * 1.4) * (.022 + .11 * u) * rafale
                    + Math.sin(x * 11 - now / 190 - y * 2) * .024 * u * rafale
                    + Math.sin(x * 3.1 - now / 620) * .03 * u * u;
        const chute = (.19 + .12 * bas) * Math.pow(u, 1.7) * (1.25 - .45 * rafale);
        a.setX(i, x - .05 * u * u * (1.2 - rafale) - Math.abs(vague) * .25 * u);
        a.setY(i, y * (1 - .07 * u) - chute + Math.sin(x * 4 - now / 450) * .012 * u);
        a.setZ(i, vague); }
      a.needsUpdate = true; drapeauFlotte.geo.computeVertexNormals();
    }
    rendu.render(scene, camera);
    if (now - actif > 4000 && emote < 0 && !drapeauFlotte) setTimeout(() => requestAnimationFrame(boucle), 110);
    else requestAnimationFrame(boucle);
  }
  boucle();
}
