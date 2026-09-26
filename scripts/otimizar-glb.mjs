// Gera uma cópia do GLB otimizada para web em public/modelos/.
// Preserva geometria, materiais, proporções, nomes dos nós e metadados (extras),
// incluindo os cinco nós HOTSPOT_*. O arquivo original não é alterado.
//
// Uso: npm run modelo  [-- caminho/entrada.glb]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, weld, textureCompress, reorder, quantize, join, flatten } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { statSync, mkdirSync } from 'node:fs';

const entrada = process.argv[2] ?? 'cozinha_planejada.glb';
const saida = 'public/modelos/cozinha.glb';
mkdirSync('public/modelos', { recursive: true });

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

const doc = await io.read(entrada);
const root = doc.getRoot();

const hotspotsAntes = root.listNodes()
  .filter((n) => n.getName().startsWith('HOTSPOT_'))
  .map((n) => ({ nome: n.getName(), pos: n.getTranslation(), extras: n.getExtras() }));

await doc.transform(
  dedup(),
  weld(),
  // Une malhas que compartilham material: reduz ~300 draw calls para ~20,
  // sem alterar vértices. Nós vazios com extras (hotspots e grupos) permanecem.
  flatten(),
  join({ keepNamed: false }),
  prune({ keepLeaves: true, keepExtras: true }),
  textureCompress({
    encoder: sharp,
    targetFormat: 'webp',
    // Madeira mantém 2048 px (aparece em áreas grandes); o resto fica em 1024 px.
    resize: [2048, 2048],
    quality: 86,
  }),
  reorder({ encoder: MeshoptEncoder }),
  quantize({ pattern: /^(POSITION|NORMAL|TEXCOORD_0)$/ }),
);

// join/prune descartam nós sem malha; os hotspots são recriados na raiz da cena
// com a mesma posição e os mesmos extras (eles já eram nós-raiz no original).
const cena = root.getDefaultScene() ?? root.listScenes()[0];
for (const h of hotspotsAntes) {
  if (root.listNodes().some((n) => n.getName() === h.nome)) continue;
  cena.addChild(doc.createNode(h.nome).setTranslation(h.pos).setExtras(h.extras));
}

doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({
  method: EXTMeshoptCompression.EncoderMethod.QUANTIZE,
});

await io.write(saida, doc);

// Conferência: hotspots precisam sair idênticos.
const conferir = await io.read(saida);
const depois = conferir.getRoot().listNodes().filter((n) => n.getName().startsWith('HOTSPOT_'));
if (depois.length !== hotspotsAntes.length) throw new Error('Hotspots perdidos na otimização');
for (const h of hotspotsAntes) {
  const n = depois.find((d) => d.getName() === h.nome);
  const w = n.getWorldTranslation();
  const ok = w.every((v, i) => Math.abs(v - h.pos[i]) < 1e-4) &&
    JSON.stringify(n.getExtras()) === JSON.stringify(h.extras);
  if (!ok) throw new Error(`Hotspot alterado: ${h.nome}`);
}

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2) + ' MB';
console.log(`${entrada} (${mb(entrada)}) → ${saida} (${mb(saida)})`);
console.log(`Hotspots preservados: ${hotspotsAntes.map((h) => h.nome).join(', ')}`);
console.log(`Malhas: ${conferir.getRoot().listMeshes().length} · Materiais: ${conferir.getRoot().listMaterials().length}`);
