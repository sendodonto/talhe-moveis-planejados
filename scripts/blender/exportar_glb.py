"""Exporta o GLB do site a partir do .blend aberto.

Deixa de fora a cenografia usada só nos renders (coleção/objeto
'Cenografia_render' e seus filhos), câmeras e luzes. Mantém hierarquia,
animações e as propriedades extras (titulo, descricao, animation) dos
nós HOTSPOT_*. Sem Draco: o site otimiza com meshopt depois
(npm run modelo -- <saida.glb> <nome>).

Uso:
  blender --background sala_carvalho.blend --python scripts/blender/exportar_glb.py -- sala_carvalho.glb
"""
import bpy, sys, json, struct

saida = sys.argv[sys.argv.index('--') + 1]


def dentro_de_cenografia(o):
    while o:
        if o.name.startswith('Cenografia_render'):
            return True
        o = o.parent
    return False


bpy.ops.object.select_all(action='DESELECT')
qtd = 0
for o in bpy.context.scene.objects:
    if o.type in {'CAMERA', 'LIGHT'} or dentro_de_cenografia(o):
        continue
    o.hide_set(False)
    o.select_set(True)
    qtd += 1

# O exportador glTF ignora a cor do nó Mix (Multiply) textura × cor usado nos
# tecidos e madeiras: sem isto eles sairiam brancos. Guardamos essa cor e
# gravamos como baseColorFactor depois de exportar.
fatores = {}
for m in bpy.data.materials:
    if not m.use_nodes:
        continue
    b = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not b or not b.inputs['Base Color'].is_linked:
        continue
    n = b.inputs['Base Color'].links[0].from_node
    if n.type == 'MIX_RGB' and n.blend_type == 'MULTIPLY':
        cor = next((i.default_value for i in n.inputs[1:] if not i.is_linked), None)
    elif n.type == 'MIX' and getattr(n, 'blend_type', '') == 'MULTIPLY':
        cor = next((i.default_value for i in n.inputs if i.type == 'RGBA' and i.enabled and not i.is_linked), None)
    else:
        cor = None
    if cor is not None:
        fatores[m.name] = [round(float(x), 4) for x in cor[:3]] + [1.0]

bpy.ops.export_scene.gltf(
    filepath=saida,
    export_format='GLB',
    use_selection=True,
    export_extras=True,
    export_apply=True,
    export_yup=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_draco_mesh_compression_enable=False,
)
# grava as cores no JSON do GLB
with open(saida, 'rb') as f:
    dados = f.read()
tam_json = struct.unpack('<I', dados[12:16])[0]
gltf = json.loads(dados[20:20 + tam_json])
aplicados = 0
for mat in gltf.get('materials', []):
    fator = fatores.get(mat.get('name'))
    if fator:
        mat.setdefault('pbrMetallicRoughness', {})['baseColorFactor'] = fator
        aplicados += 1
novo = json.dumps(gltf, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
novo += b' ' * ((4 - len(novo) % 4) % 4)
resto = dados[20 + tam_json:]
total = 12 + 8 + len(novo) + len(resto)
with open(saida, 'wb') as f:
    f.write(dados[:8] + struct.pack('<I', total) + struct.pack('<I', len(novo)) + b'JSON' + novo + resto)
print('RESULTADO cores aplicadas:', aplicados)

hotspots = [o.name for o in bpy.context.scene.objects if o.name.startswith('HOTSPOT_')]
print("RESULTADO exportados:", qtd, '| hotspots:', len(hotspots), '| animações:', [a.name for a in bpy.data.actions])
