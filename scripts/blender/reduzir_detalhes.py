"""Reduz a resolução de detalhes microscópicos (costuras, franjas, teclas)
que somavam centenas de milhares de triângulos sem aparecer na tela.

- Curvas de costura e franja: menos pontos ao longo da curva e seção de
  4 lados (continua lendo como costura na distância do ambiente).
- Chanfros (Bevel) de peças pequenas: 1 segmento.

Uso:
  blender --background arquivo.blend --python scripts/blender/reduzir_detalhes.py -- --salvar
"""
import bpy, re, sys

SALVAR = '--salvar' in sys.argv
CURVAS = re.compile(r'costura|franja|cadarço', re.I)
PEQUENOS = re.compile(r'tecla|botão|dobradiça|manípulo|puxador', re.I)


def triangulos():
    dg = bpy.context.evaluated_depsgraph_get()
    t = 0
    for o in bpy.context.scene.objects:
        if o.type in ('MESH', 'CURVE') and not o.hide_render:
            me = o.evaluated_get(dg).to_mesh()
            t += sum(len(p.vertices) - 2 for p in me.polygons)
            o.evaluated_get(dg).to_mesh_clear()
    return t


antes = triangulos()
curvas = mods = 0
for o in bpy.context.scene.objects:
    if o.type == 'CURVE' and CURVAS.search(o.name):
        c = o.data
        c.resolution_u = max(2, min(c.resolution_u, 4))
        c.render_resolution_u = 0
        if c.bevel_depth > 0:
            c.bevel_resolution = 0
        curvas += 1
    if o.type == 'MESH' and PEQUENOS.search(o.name):
        for m in o.modifiers:
            if m.type == 'BEVEL' and m.segments > 1:
                m.segments = 1
                mods += 1
depois = triangulos()
print(f'RESULTADO curvas: {curvas} · chanfros: {mods} · triângulos {antes:,} → {depois:,}')
if SALVAR:
    bpy.ops.wm.save_mainfile()
    print('RESULTADO salvo')
