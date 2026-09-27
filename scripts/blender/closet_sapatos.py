"""Troca os sapatos da sapateira (closet_nogueira.blend) por pares modelados.

Antes: um pé por posição, em forma de bolha, e cadarços com ~370 mil
triângulos. Agora: pares (esquerdo e direito) com sola e salto, cabedal com
a forma do pé, bico arredondado e abertura de calçar; couros variados.

Uso:
  blender --background closet_nogueira.blend --python scripts/blender/closet_sapatos.py -- --salvar
"""
import bpy, bmesh, math, random, re, sys
from mathutils import Vector, Matrix

SALVAR = '--salvar' in sys.argv
random.seed(11)
pai = bpy.data.objects['03_Organizacao']


def caixa(o):
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return Vector([min(v[i] for v in bb) for i in range(3)]), Vector([max(v[i] for v in bb) for i in range(3)])


def material(nome, cor, rug, verniz=0.0):
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*cor, 1)
    b.inputs['Roughness'].default_value = rug
    if 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = verniz
        b.inputs['Coat Roughness'].default_value = 0.25
    return m


# sem verniz (clearcoat): custo alto no celular e invisível a essa distância
couros = [
    material('Couro castanho', (0.16, 0.07, 0.03), 0.34),
    material('Couro preto', (0.012, 0.011, 0.01), 0.3),
    material('Couro caramelo', (0.36, 0.17, 0.06), 0.38),
]
sola_mat = material('Sola de borracha', (0.02, 0.018, 0.016), 0.75)
interior_mat = material('Forro de couro', (0.22, 0.14, 0.09), 0.6)

# posições antigas (centro de cada pé solto)
posicoes = []
for o in bpy.context.scene.objects:
    if re.match(r'^Sapato • cabedal(\.\d{3})?$', o.name):
        mn, mx = caixa(o)
        posicoes.append(Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z - 0.02)))
remover = [o for o in bpy.context.scene.objects if re.match(r'^(Sapato • (cabedal|sola)|Cadarço)(\.\d{3})?$', o.name)]
for o in remover:
    bpy.data.objects.remove(o, do_unlink=True)
print('RESULTADO posições:', len(posicoes), 'removidos:', len(remover))

L = 0.275  # comprimento do sapato


def largura(t):
    w = 0.066 + (0.094 - 0.066) * min(1, max(0, (t - 0.1) / 0.55))
    if t < 0.09:
        w *= math.sqrt(max(0.04, t / 0.09))
    if t > 0.72:
        w *= math.sqrt(max(0.0, 1 - ((t - 0.72) / 0.28) ** 2))
    return max(w, 0.004)


def altura(t):
    if t < 0.38:
        h = 0.056 + 0.004 * (t / 0.38)          # contraforte / abertura
    elif t < 0.5:
        h = 0.06 + 0.01 * (t - 0.38) / 0.12     # peito do pé
    else:
        h = 0.07 - (0.07 - 0.026) * ((t - 0.5) / 0.5) ** 0.9
    if t > 0.85:
        h *= math.sqrt(max(0.05, 1 - ((t - 0.85) / 0.15) ** 2))
    return h


def base_z(t):
    """altura da face superior da sola (salto elevado atrás)."""
    if t < 0.25:
        return 0.03
    if t < 0.5:
        return 0.03 - 0.018 * (t - 0.25) / 0.25
    return 0.012


def anel(t, w, z0, h, n=14):
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n
        c, s = math.cos(a), math.sin(a)
        # laterais quase retas, topo mais estreito que a base
        y = (w / 2) * math.copysign(abs(c) ** 0.45, c) * (1 - 0.3 * max(0.0, s) ** 2)
        z = z0 + h * (math.copysign(abs(s) ** 0.6, s) + 1) / 2
        pts.append(Vector((t * L, y, z)))
    return pts


def tubo(bm, aneis):
    vs = [[bm.verts.new(p) for p in a] for a in aneis]
    for a, b in zip(vs, vs[1:]):
        n = len(a)
        for k in range(n):
            bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
    bm.faces.new(list(reversed(vs[0])))
    bm.faces.new(vs[-1])


def objeto(nome, bm, mat):
    me = bpy.data.meshes.new(nome)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = pai
    ob.matrix_parent_inverse = pai.matrix_world.inverted()
    return ob


def sapato(couro, espelhar):
    ts = [i / 14 for i in range(15)]
    # cabedal
    bm = bmesh.new()
    tubo(bm, [anel(t, largura(t), base_z(t), altura(t)) for t in ts])
    cab = objeto('Sapato • cabedal', bm, couro)
    # sola: fatia um pouco mais larga, do chão até a base do cabedal
    bm = bmesh.new()
    def anel_sola(t):
        w = largura(t) + 0.008
        fundo = 0.0 if (t < 0.24 or t > 0.5) else 0.007 * math.sin(math.pi * (t - 0.24) / 0.26)
        topo = base_z(t) + 0.004
        pts = []
        for k in range(10):
            a = 2 * math.pi * k / 10
            c, s = math.cos(a), math.sin(a)
            y = (w / 2) * math.copysign(abs(c) ** 0.35, c)
            z = fundo if s < 0 else topo
            pts.append(Vector((t * L - 0.003 if t == 0 else t * L + (0.004 if t == 1 else 0), y, z)))
        return pts
    tubo(bm, [anel_sola(t) for t in ts])
    sola = objeto('Sapato • sola', bm, sola_mat)
    # abertura de calçar: forro escuro inclinado na parte de trás
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=12, radius=1)
    for v in bm.verts:
        v.co = Vector((0.018 + 0.05 * (v.co.x + 1), v.co.y * 0.026, 0))
    ab = objeto('Sapato • abertura', bm, interior_mat)
    ab.matrix_world = Matrix.Translation((0, 0, base_z(0.15) + altura(0.15) + 0.0015)) @ Matrix.Rotation(math.radians(6), 4, 'Y')
    pecas = [cab, sola, ab]
    if espelhar:
        for o in pecas:
            o.matrix_world = Matrix.Scale(-1, 4, (0, 1, 0)) @ o.matrix_world
    return pecas


for i, p in enumerate(posicoes):
    couro = couros[i % len(couros)]
    for lado, dy in ((0, -0.052), (1, 0.052)):
        pecas = sapato(couro, espelhar=bool(lado))
        abre = math.radians(random.uniform(2, 5)) * (1 if lado else -1)
        recuo = random.uniform(-0.012, 0.012)
        m = (Matrix.Translation((p.x - L / 2 + recuo, p.y + dy, p.z + 0.02)) @ Matrix.Rotation(abre, 4, 'Z'))
        for o in pecas:
            o.matrix_world = m @ o.matrix_world
            if lado and o.data.users == 1:
                # espelhamento inverte as normais: corrige
                bm = bmesh.new(); bm.from_mesh(o.data)
                bmesh.ops.reverse_faces(bm, faces=bm.faces)
                bm.to_mesh(o.data); bm.free()

print('RESULTADO pares:', len(posicoes))
if SALVAR:
    bpy.ops.wm.save_mainfile()
    print('RESULTADO salvo')
