"""Melhora livros e quadro da sala (sala_carvalho.blend).

Livros: cada volume passa a ter capa dura, miolo de páginas recuado e
lombada arredondada, com alturas, espessuras e cores variadas; na estante
eles ficam em pé com um livro inclinado, nas pilhas ficam levemente
desalinhados. Quadro: moldura de carvalho com passe-partout e uma pintura
abstrata (textura gerada) em vez da tira terracota.

Uso:
  blender --background sala_carvalho.blend --python scripts/blender/sala_objetos.py -- --salvar
"""
import bpy, bmesh, math, random, re, sys
from mathutils import Vector, Matrix

SALVAR = '--salvar' in sys.argv
random.seed(21)
pai = bpy.data.objects['07_Objetos']


def caixa(o):
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return Vector([min(v[i] for v in bb) for i in range(3)]), Vector([max(v[i] for v in bb) for i in range(3)])


def material(nome, cor, rug=0.55, textura=None):
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get('Principled BSDF')
    b.inputs['Roughness'].default_value = rug
    if textura:
        img = nt.nodes.new('ShaderNodeTexImage')
        img.image = textura
        nt.links.new(img.outputs['Color'], b.inputs['Base Color'])
    else:
        b.inputs['Base Color'].default_value = (*cor, 1)
    return m


capas = [
    material('Capa livro terracota', (0.36, 0.11, 0.05), 0.6),
    material('Capa livro oliva', (0.15, 0.17, 0.08), 0.6),
    material('Capa livro areia', (0.62, 0.52, 0.38), 0.55),
    material('Capa livro grafite', (0.03, 0.03, 0.035), 0.5),
    material('Capa livro off-white', (0.78, 0.75, 0.68), 0.55),
    material('Capa livro azul', (0.05, 0.1, 0.17), 0.55),
    material('Capa livro mostarda', (0.55, 0.36, 0.08), 0.6),
]
paginas = material('Miolo de páginas', (0.86, 0.83, 0.74), 0.85)


def objeto(nome, bm, mats):
    me = bpy.data.meshes.new(nome)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = pai
    ob.matrix_parent_inverse = pai.matrix_world.inverted()
    bev = ob.modifiers.new('Chanfro', 'BEVEL')
    bev.width = 0.0012
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    return ob


def livro(esp, alt, prof, capa):
    """Livro em pé na origem: lombada em x=0 voltada para -x... (eixos locais:
    x = espessura, y = profundidade (lombada em y=0), z = altura)."""
    bm = bmesh.new()
    c = 0.0022  # espessura da capa
    rec = 0.003  # recuo do miolo
    # capas (duas placas) + lombada
    for x0 in (0, esp - c):
        bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((x0 + c / 2, prof / 2, alt / 2)) @ Matrix.Diagonal((c, prof, alt, 1)))
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((esp / 2, c / 2, alt / 2)) @ Matrix.Diagonal((esp, c, alt, 1)))
    n_capa = len(bm.faces)
    # miolo de páginas recuado
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((esp / 2, (prof - rec) / 2 + c / 2, alt / 2)) @ Matrix.Diagonal((esp - 2 * c, prof - rec - c, alt - 2 * rec, 1)))
    for i, f in enumerate(bm.faces):
        f.material_index = 0 if i < n_capa else 1
    return objeto('Livro', bm, [capa, paginas])


def colocar(ob, m):
    ob.matrix_world = m @ ob.matrix_world


# ——— Livros antigos: grupos por nome ———
grupos = {}
for o in list(bpy.context.scene.objects):
    mt = re.match(r'^(Livros estante|Livros na prateleira alta|Livro horizontal rack|Livro sobre mesa)(\.\d{3})?$', o.name)
    if mt:
        mn, mx = caixa(o)
        g = grupos.setdefault(mt.group(1), {'mn': mn.copy(), 'mx': mx.copy()})
        g['mn'] = Vector([min(a, b) for a, b in zip(g['mn'], mn)])
        g['mx'] = Vector([max(a, b) for a, b in zip(g['mx'], mx)])
        bpy.data.objects.remove(o, do_unlink=True)
print('RESULTADO grupos:', {k: ([round(x, 2) for x in v['mn']], [round(x, 2) for x in v['mx']]) for k, v in grupos.items()})


def fileira_em_pe(g, eixo_fila, n, alt_max, prof, inclinar_ultimo=True):
    """Livros em pé enfileirados ao longo de eixo_fila ('x' ou 'y'); lombada voltada para a sala (-y... ou +x)."""
    mn, mx = g['mn'], g['mx']
    base_z = mn.z
    pos = mn.x if eixo_fila == 'x' else mn.y
    for i in range(n):
        esp = random.uniform(0.018, 0.034)
        alt = alt_max * random.uniform(0.78, 1.0)
        ob = livro(esp, alt, prof, random.choice(capas))
        if eixo_fila == 'y':
            # estante: fila ao longo de y, lombada voltada para +x... a estante abre para -y? usamos a frente = menor y do nicho
            m = Matrix.Translation((mn.x + 0.002, pos, base_z)) @ Matrix.Rotation(math.pi / 2, 4, 'Z') @ Matrix.Translation((0, -prof, 0))
            m = Matrix.Translation((mx.x - prof, pos + esp, base_z)) @ Matrix.Rotation(-math.pi / 2, 4, 'Z')
        else:
            m = Matrix.Translation((pos, mx.y - prof, base_z))
        colocar(ob, m)
        pos += esp + random.uniform(0.0, 0.002)
    return pos


def pilha(g, n, larg, prof):
    mn, mx = g['mn'], g['mx']
    cx, cy = (mn.x + mx.x) / 2, (mn.y + mx.y) / 2
    z = mn.z
    for i in range(n):
        esp = random.uniform(0.014, 0.028)
        w = larg * random.uniform(0.88, 1.0)
        p = prof * random.uniform(0.88, 1.0)
        ob = livro(esp, w, p, random.choice(capas))
        # deitado: altura (z local) vira comprimento em x; espessura vira z
        giro = math.radians(random.uniform(-6, 6))
        # Ry(-90°): altura local (z) vira -x e espessura (x) vira +z
        m = (Matrix.Translation((cx, cy, z)) @ Matrix.Rotation(giro, 4, 'Z')
             @ Matrix.Translation((w / 2, -p / 2, 0)) @ Matrix.Rotation(-math.pi / 2, 4, 'Y'))
        colocar(ob, m)
        z += esp


# Estante (nicho vertical): fileira ao longo de x? — medir o grupo
if 'Livros estante' in grupos:
    g = grupos['Livros estante']
    tam = g['mx'] - g['mn']
    # nicho da estante: fileira ao longo de x, lombadas para a frente (-y)
    fim = fileira_em_pe(g, 'x', 6, tam.z * 1.02, min(0.2, tam.y))
    # um livro inclinado, apoiado no último
    esp, alt = 0.024, tam.z * 0.9
    ob = livro(esp, alt, min(0.19, tam.y), random.choice(capas))
    ang = math.radians(-14)
    colocar(ob, Matrix.Translation((fim + alt * math.sin(-ang) + 0.004, g['mx'].y - min(0.19, tam.y), g['mn'].z)) @ Matrix.Rotation(ang, 4, 'Y') @ Matrix.Translation((-esp, 0, 0)))
if 'Livros na prateleira alta' in grupos:
    g = grupos['Livros na prateleira alta']
    tam = g['mx'] - g['mn']
    pilha(g, 3, tam.x * 0.95, tam.y * 0.9)  # livros deitados sobre a prateleira
if 'Livro horizontal rack' in grupos:
    g = grupos['Livro horizontal rack']
    tam = g['mx'] - g['mn']
    pilha(g, 4, max(tam.x, tam.y) * 0.9, min(tam.x, tam.y) * 0.9)
if 'Livro sobre mesa' in grupos:
    g = grupos['Livro sobre mesa']
    tam = g['mx'] - g['mn']
    pilha(g, 3, max(tam.x, tam.y), min(tam.x, tam.y))

# ——— Quadro: pintura abstrata + passe-partout ———
q = {n: bpy.data.objects.get(n) for n in ('Quadro • moldura', 'Quadro • fundo', 'Quadro • composição abstrata')}
if all(q.values()):
    fundo = q['Quadro • fundo']
    mn, mx = caixa(fundo)
    W, H = 512, 640
    img = bpy.data.images.new('Pintura abstrata', W, H)
    px = [0.0] * (W * H * 4)
    fundo_cor = (0.86, 0.82, 0.74)
    formas = [
        ('circulo', 0.5, 0.62, 0.23, (0.62, 0.24, 0.1)),
        ('circulo', 0.62, 0.36, 0.14, (0.18, 0.22, 0.12)),
        ('faixa', 0.0, 0.28, 0.07, (0.55, 0.42, 0.25)),
    ]
    for yy in range(H):
        for xx in range(W):
            u, v = xx / W, yy / H
            cor = fundo_cor
            for tipo, a, b, r, c in formas:
                if tipo == 'circulo' and (u - a) ** 2 + ((v - b) * H / W) ** 2 < r * r:
                    cor = c
                if tipo == 'faixa' and abs(v - b) < r / 2 and u > 0.12:
                    cor = c
            g = (math.sin(xx * 0.9) * math.cos(yy * 1.3)) * 0.012  # grão de tinta
            i = (yy * W + xx) * 4
            px[i:i + 4] = [cor[0] + g, cor[1] + g, cor[2] + g, 1]
    img.pixels = px
    img.pack()
    arte = material('Pintura abstrata', None, 0.75, textura=img)
    passe = material('Passe-partout', (0.9, 0.88, 0.82), 0.9)
    # passe-partout = antigo fundo; pintura = placa menor à frente
    fundo.data.materials.clear()
    fundo.data.materials.append(passe)
    bpy.data.objects.remove(q['Quadro • composição abstrata'], do_unlink=True)
    bm = bmesh.new()
    lx, ly, lz = mx.x - mn.x, mx.y - mn.y, mx.z - mn.z
    m = 0.035
    # placa fina, na frente do passe-partout (quadro fica na parede do fundo; frente = -y)
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5,
                          matrix=Matrix.Translation(((mn.x + mx.x) / 2, mn.y - 0.0008, (mn.z + mx.z) / 2)) @ Matrix.Rotation(math.pi / 2, 4, 'X') @ Matrix.Diagonal((lx - 2 * m, lz - 2 * m, 1, 1)))
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for lp in f.loops:
            co = lp.vert.co
            lp[uv].uv = ((co.x - (mn.x + m)) / (lx - 2 * m), (co.z - (mn.z + m)) / (lz - 2 * m))
    me = bpy.data.meshes.new('Quadro • pintura')
    bm.to_mesh(me); bm.free()
    me.materials.append(arte)
    ob = bpy.data.objects.new('Quadro • pintura', me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = pai
    ob.matrix_parent_inverse = pai.matrix_world.inverted()
    print('RESULTADO quadro atualizado', [round(x, 3) for x in mn], [round(x, 3) for x in mx])

if SALVAR:
    bpy.ops.wm.save_mainfile()
    print('RESULTADO salvo')
