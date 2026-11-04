// Hand-modelled isometric VOXEL whale -> inline SVG. No external assets.
// Model space: x = tail(0) .. head(L). y = width (only +y flank faces the camera).
// z = belly(0) .. back(H). Iso projection: sx=(x-y)*cos30, sy=(x+y)/2 - z.
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const L = 34;
const COS30 = Math.cos(Math.PI / 6);

// t: 0 = nose, 1 = caudal peduncle end
const PROF = [
  [0.00, 1.3, 8.4, 2.4],
  [0.03, 3.3, 10.3, 1.2],
  [0.08, 4.9, 11.4, 0.7],
  [0.16, 6.2, 11.8, 0.6],
  [0.27, 7.0, 11.5, 0.7],
  [0.40, 7.2, 10.9, 1.0],
  [0.52, 6.9, 10.3, 1.4],
  [0.62, 6.3, 9.8, 1.9],
  [0.71, 5.5, 9.3, 2.5],
  [0.79, 4.4, 8.9, 3.3],
  [0.86, 3.5, 9.2, 4.5],
  [0.93, 2.6, 9.5, 6.1],
  [1.00, 1.6, 9.7, 7.6],
];
function profileAt(t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 0; i < PROF.length - 1; i++) {
    const a = PROF[i], b = PROF[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const u = (t - a[0]) / (b[0] - a[0] || 1);
      return { w: a[1] + (b[1] - a[1]) * u, top: a[2] + (b[2] - a[2]) * u, bot: a[3] + (b[3] - a[3]) * u };
    }
  }
  const l = PROF[PROF.length - 1];
  return { w: l[1], top: l[2], bot: l[3] };
}

const vox = new Map();
const key = (x, y, z) => `${x},${y},${z}`;
const X0 = -9, X1 = L + 1, Y0 = -11, Y1 = 12, Z0 = 0, Z1 = 17;
function put(x, y, z, mat) {
  if (x < X0 || x >= X1 || y < Y0 || y >= Y1 || z < Z0 || z >= Z1) return;
  vox.set(key(x, y, z), mat);
}

// ---- body ----
for (let x = 0; x < L; x++) {
  const t = (L - x - 0.5) / L;
  const { w, top, bot } = profileAt(t);
  const c = (top + bot) / 2, hh = (top - bot) / 2;
  for (let y = Y0; y < Y1; y++) {
    const yc = y + 0.5;
    if (Math.abs(yc) > w) continue;
    for (let z = Z0; z < Z1; z++) {
      const zc = z + 0.5;
      if (zc > top || zc < bot) continue;
      if ((yc / w) ** 2 + ((zc - c) / hh) ** 2 <= 1) put(x, y, z, zc < c - 0.55 * hh ? 'belly' : 'body');
    }
  }
}

// ---- tail flukes: raised horizontal fluke, butterfly seen from above ----
const FZ = 9;            // fluke plate base height
for (let y = Y0; y < Y1; y++) {
  const yc = Math.abs(y + 0.5);
  if (yc < 0.8 || yc > 10.2) continue;
  const q = (yc - 0.8) / 9.4;
  const xLead = 1.4 - 1.0 * q;
  const xTrail = -0.8 - 4.9 * Math.pow(q, 0.62);
  const thick = yc > 8.4 ? 1 : 2;
  for (let x = Math.ceil(xTrail); x <= Math.floor(xLead); x++)
    for (let z = FZ; z < FZ + thick; z++) put(x, y, z, 'fin');
}

// ---- pectoral fins (swept back & down, thin paddles) ----
for (let y = Y0; y < Y1; y++) {
  const yc = Math.abs(y + 0.5);
  if (yc < 5.8 || yc > 12.4) continue;
  const k = yc - 5.8;
  const xc = 24.6 - 0.82 * k;
  const half = 2.15 - 0.08 * k;
  const zc = 5.0 - 0.44 * k;
  for (let x = Math.floor(xc - half); x <= Math.ceil(xc + half); x++)
    for (let z = Math.floor(zc); z <= Math.ceil(zc + 1.5); z++)
      if (Math.abs(x + 0.5 - xc) <= half && z + 0.5 >= zc && z + 0.5 <= zc + 1.5) put(x, y, z, 'fin');
}

// ---- voxel face: paint the outermost voxels of the visible (+y) flank ----
const flank = new Map(); // "x,z" -> {y, mat}
for (const [k, mat] of vox) {
  const [x, y, z] = k.split(',').map(Number);
  if (vox.has(key(x, y + 1, z))) continue;
  const fk = `${x},${z}`;
  const cur = flank.get(fk);
  if (!cur || y > cur.y) flank.set(fk, { x, y, z, mat });
}
function paint(x0, x1, z0, z1, mat) {
  for (let x = Math.round(x0); x <= Math.round(x1); x++)
    for (let z = Math.round(z0); z <= Math.round(z1); z++) {
      const f = flank.get(`${x},${z}`);
      if (f) vox.set(key(f.x, f.y, f.z), mat);
    }
}


// ---- optional director beret: a voxel cap that hugs the top of the head ----
const director = process.argv[2] === 'director';
if (director) {
  const bx = 31.4, by = 0;
  const topAt = new Map();
  for (const [k] of vox) {
    const [x, y, z] = k.split(',').map(Number);
    const kk = `${x},${y}`;
    if (!topAt.has(kk) || z > topAt.get(kk)) topAt.set(kk, z);
  }
  for (const [kk, zTop] of topAt) {
    const [x, y] = kk.split(',').map(Number);
    const dx = (x + 0.5 - bx) / 4.6, dy = (y + 0.5 - by) / 3.6;
    const r = dx * dx + dy * dy;
    if (r > 1) continue;
    put(x, y, zTop + 1, 'hat');
    if (r < 0.5) put(x, y, zTop + 2, 'hat');
  }
  // beret stalk + a small mint pin
  const st = topAt.get(String(bx) + ',' + String(by));
  if (st !== undefined) put(bx, by, st + 3, 'hat');
  const pinKey = `${bx + 2},${by - 1}`;
  const pinTop = topAt.get(pinKey);
  if (pinTop !== undefined) put(bx + 2, by - 1, pinTop + 2, 'hatpin');
}
// ---- visible faces ----
const shade = {
  top: { body: [136, 156, 255], belly: [190, 206, 255], fin: [108, 130, 250], hat: [146, 92, 56], hatpin: [255, 196, 128], ink: [66, 84, 168], inkwhite: [235, 242, 255] },
  left: { body: [84, 108, 246], belly: [146, 170, 255], fin: [74, 96, 224], hat: [108, 64, 38], hatpin: [235, 170, 104], ink: [16, 26, 66], inkwhite: [228, 238, 255] },
  right: { body: [58, 76, 196], belly: [116, 138, 232], fin: [56, 74, 196], hat: [74, 44, 26], hatpin: [190, 132, 76], ink: [12, 20, 54], inkwhite: [214, 228, 255] },
};
const hash = (x, y, z) => Math.abs(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1;
const faces = [];
for (const [k, mat] of vox) {
  const [x, y, z] = k.split(',').map(Number);
  if (!vox.has(key(x + 1, y, z))) faces.push({ kind: 'right', mat, x, y, z, d: x + y + z + 1.0 });
  if (!vox.has(key(x, y + 1, z))) faces.push({ kind: 'left', mat, x, y, z, d: x + y + z + 0.5 });
  if (!vox.has(key(x, y, z + 1))) faces.push({ kind: 'top', mat, x, y, z, d: x + y + z + 0.5 });
}
faces.sort((a, b) => a.d - b.d);

const pt = (x, y, z) => [(x - y) * COS30, (x + y) * 0.5 - z];
const n = (v) => Math.round(v * 100) / 100;
let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
const polys = [];
for (const f of faces) {
  const { x, y, z, kind, mat } = f;
  const pts =
    kind === 'top'
      ? [pt(x, y, z + 1), pt(x + 1, y, z + 1), pt(x + 1, y + 1, z + 1), pt(x, y + 1, z + 1)]
      : kind === 'left'
        ? [pt(x, y + 1, z), pt(x + 1, y + 1, z), pt(x + 1, y + 1, z + 1), pt(x, y + 1, z + 1)]
        : [pt(x + 1, y, z), pt(x + 1, y + 1, z), pt(x + 1, y + 1, z + 1), pt(x + 1, y, z + 1)];
  for (const p of pts) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const b = shade[kind][mat] || shade[kind].body;
  const j = (hash(x, y, z) - 0.5) * 8;
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  polys.push(`<polygon points="${pts.map((p) => n(p[0]) + ',' + n(p[1])).join(' ')}" fill="rgb(${cl(b[0] + j)},${cl(b[1] + j)},${cl(b[2] + j)})"/>`);
}

// ---- mint blow spout (small voxel diamonds rising off the blowhole) ----
const blow = pt(26.6, 0.4, 12.1);
const spout = [];
for (let i = 0; i < 8; i++) {
  const up = i * 1.6;
  const sway = Math.sin(i * 0.95) * 1.35;
  const s = 2.2 - i * 0.19;
  const cx = blow[0] + sway, cy = blow[1] - up;
  minX = Math.min(minX, cx - s); maxX = Math.max(maxX, cx + s);
  minY = Math.min(minY, cy - s); maxY = Math.max(maxY, cy + s);
  spout.push(
    `<rect x="${n(cx - s / 2)}" y="${n(cy - s / 2)}" width="${n(s)}" height="${n(s)}" fill="#5ef2c2" opacity="${n(0.92 - i * 0.085)}" transform="rotate(45 ${n(cx)} ${n(cy)})"/>`
  );
}

// ---- crisp ink smile, hugging the stair-stepped flank surface ----
const flankY = (x, z) => {
  const f = flank.get(`${x},${z}`);
  if (f) return f.y + 1;
  return profileAt((L - x - 0.5) / L).w - 0.4;
};
const mouthPts = [[33.8, 5.7], [33.0, 5.1], [32.0, 5.15], [31.2, 5.9]].map(([x, z]) => pt(x, flankY(Math.round(x), Math.round(z)) + 0.18, z));
const mouthD = `M ${n(mouthPts[0][0])} ${n(mouthPts[0][1])} Q ${n((mouthPts[1][0] + mouthPts[2][0]) / 2)} ${n(mouthPts[1][1] + 0.1)} ${n(mouthPts[3][0])} ${n(mouthPts[3][1])}`;
const faceSvg = `<path d="${mouthD}" fill="none" stroke="#0a1330" stroke-width="0.62" stroke-linecap="round" opacity="0.95"/>`;
// eye: crisp ink decal on the same flank plane, with a mint-white sparkle
const flankAt = (x, z) => {
  for (let dx = 0; dx <= 2; dx++)
    for (let dz = 0; dz <= 2; dz++)
      for (const [ddx, ddz] of [[dx, dz], [-dx, dz], [dx, -dz], [-dx, -dz]]) {
        const f = flank.get(`${Math.round(x) + ddx},${Math.round(z) + ddz}`);
        if (f) return f.y + 1;
      }
  return 6.4;
};
const eyeY = flankAt(31.5, 8.4) + 0.22;
const eyeC = pt(31.6, eyeY, 8.45);
const eyeTf = `matrix(0.866,0.5,0,-1,${n(-0.866 * eyeY)},${n(0.5 * eyeY)})`;
const eyeSvg = `<g transform="${eyeTf}">
  <ellipse cx="31.6" cy="8.45" rx="1.5" ry="1.72" fill="#081026"/>
  <ellipse cx="32.15" cy="9.05" rx="0.56" ry="0.66" fill="#eef5ff"/>
  <circle cx="31.15" cy="7.85" r="0.36" fill="#5ef2c2" opacity="0.75"/>
</g>`;

const pad = 2.5;
const vb = `${n(minX - pad)} ${n(minY - pad)} ${n(maxX - minX + pad * 2)} ${n(maxY - minY + pad * 2)}`;
const svg = `<svg class="whale-voxel" xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none" aria-hidden="true">
<g class="whale-mesh">${polys.join('')}</g>
<g class="whale-face">${faceSvg}${eyeSvg}</g>
<g class="whale-spout">${spout.join('')}</g>
</svg>
`;
const out = resolve(here, director ? 'whale-director.svg' : 'whale-voxel.svg');
writeFileSync(out, svg);
console.log('wrote', out, (svg.length / 1024).toFixed(1) + 'KB faces', faces.length, 'voxels', vox.size, 'viewBox', vb);
