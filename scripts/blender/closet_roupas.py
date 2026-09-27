"""Reconstrói as roupas penduradas do closet (closet_nogueira.blend).

Substitui as 20 peças antigas (cones enrolados, cabides desalinhados) por
camisas modeladas: ombros no formato do cabide, corpo com volume, barra
curva, mangas, gola, carcela com botões, dobras suaves, cabide de madeira e
gancho que abraça o varão. Mantém a cor e o varão de cada peça.

Uso:
  blender --background closet_nogueira.blend --python scripts/blender/closet_roupas.py -- --salvar
"""
import bpy, bmesh, math, random, re, sys
from mathutils import Vector, Matrix

SALVAR = '--salvar' in sys.argv
random.seed(7)

PARTES_ANTIGAS = r'^(Roupa pendurada|Manga com punho aberto|Botão da camisa|Camisa • (costura lateral|barra|gola|carcela)|Cabide de madeira|Gancho do cabide)(\.\d{3})?$'
pai_org = bpy.data.objects['03_Organizacao']


def caixa(o):
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return Vector([min(v[i] for v in bb) for i in range(3)]), Vector([max(v[i] for v in bb) for i in range(3)])


# ——— Varões (centro do tubo) ———
varoes = []
for o in bpy.context.scene.objects:
    if re.match(r'^Cabideiro (central|roupas longas)', o.name):
        mn, mx = caixa(o)
        varoes.append({'x0': mn.x, 'x1': mx.x, 'y': (mn.y + mx.y) / 2, 'z': (mn.z + mx.z) / 2, 'r': (mx.z - mn.z) / 2})

# ——— Peças antigas: posição, cor e comprimento ———
pecas = []
for o in bpy.context.scene.objects:
    if re.match(r'^Roupa pendurada(\.\d{3})?$', o.name):
        mn, mx = caixa(o)
        cx = (mn.x + mx.x) / 2
        varao = min((v for v in varoes if v['x0'] - 0.05 <= cx <= v['x1'] + 0.05 and v['z'] > mx.z - 0.02),
                    key=lambda v: v['z'] - mx.z, default=None)
        pecas.append({'x': cx, 'mat': o.data.materials[0], 'comp': mx.z - mn.z, 'varao': varao})
print('RESULTADO peças encontradas:', len(pecas), 'varões:', len(varoes))

# ——— Remove as partes antigas ———
remover = [o for o in bpy.context.scene.objects if re.match(PARTES_ANTIGAS, o.name)]
for o in remover:
    bpy.data.objects.remove(o, do_unlink=True)
print('RESULTADO removidos:', len(remover))

madeira = bpy.data.materials.get('Nogueira natural acetinada')
metal = bpy.data.materials.get('Metal champanhe')


def novo_objeto(nome, bm, mats, suave=True):
    me = bpy.data.meshes.new(nome)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    if suave:
        for p in me.polygons:
            p.use_smooth = True
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = pai_org
    ob.matrix_parent_inverse = pai_org.matrix_world.inverted()
    return ob


def tubo(bm, anel, n_v, fechar_topo=False, fechar_base=False):
    """anel(v) -> lista de Vector (laço fechado); cria faces entre anéis consecutivos."""
    aneis = []
    for i in range(n_v + 1):
        pts = anel(i / n_v)
        aneis.append([bm.verts.new(p) for p in pts])
    for a, b in zip(aneis, aneis[1:]):
        n = len(a)
        for k in range(n):
            bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
    if fechar_topo:
        bm.faces.new(list(reversed(aneis[0])))
    if fechar_base:
        bm.faces.new(aneis[-1])
    return aneis


def camisa(p, i):
    v = p['varao']
    W = 0.43 + random.uniform(-0.015, 0.012)                     # largura de ombro a ombro (ao longo da profundidade do armário)
    H = max(0.55, min(p['comp'], 1.1)) + random.uniform(-0.035, 0.03)
    topo = v['z'] - v['r'] - 0.052  # ombros ficam logo abaixo do cabide
    queda = 0.055                 # inclinação do ombro
    T = 0.05 + random.uniform(-0.006, 0.008)  # volume (frente + costas + mangas)
    fase = random.uniform(0, math.tau)
    N = 24

    def perfil(t, th):
        """Ponto do corpo: t 0 (ombro) → 1 (barra), th ângulo ao redor."""
        c, s = math.cos(th), math.sin(th)
        y = (W / 2) * c * (1 + 0.035 * t)                 # leve abertura para baixo
        # espessura: quase zero na costura do ombro, cheia no corpo
        esp = T * min(1.0, 0.15 + t * 7.0) * (1 - 0.25 * abs(c) ** 3)
        x = (esp / 2) * s
        # dobras verticais que aumentam para baixo
        x += 0.0045 * math.sin(5 * th + fase) * t
        y += 0.004 * math.sin(3 * th + fase * 0.7) * t
        z_ombro = topo - queda * abs(c) ** 1.15
        z_barra = topo - H + 0.04 * abs(c) ** 4          # fraldas: laterais mais curtas
        z = z_ombro + (z_barra - z_ombro) * t
        return Vector((x, y, z))

    bm = bmesh.new()
    tubo(bm, lambda t: [perfil(t, 2 * math.pi * k / N) for k in range(N)], 14, fechar_topo=True)

    # Mangas: caem ao longo das laterais, do ombro até ~60% do corpo
    for lado in (-1, 1):
        y0 = lado * (W / 2 - 0.018)
        L = min(0.6, H * 0.82)
        def anel_manga(t, y0=y0, lado=lado):
            r = 0.034 - 0.009 * t
            cx = (T / 2 + 0.006) * (1 if lado > 0 else -1) * 0.35
            cz = topo - queda - 0.01 - L * t
            cy = y0 - lado * 0.012 * t
            return [Vector((cx + r * 0.55 * math.sin(a), cy + r * math.cos(a), cz)) for a in (2 * math.pi * k / 8 for k in range(8))]
        tubo(bm, anel_manga, 6, fechar_base=True)

    # Gola: faixa em pé ao redor do pescoço
    def anel_gola(t):
        z = topo + 0.004 + 0.03 * t
        return [Vector((0.022 * math.sin(a) + 0.004, 0.06 * math.cos(a), z - 0.008 * abs(math.cos(a)))) for a in (2 * math.pi * k / 14 for k in range(14))]
    tubo(bm, anel_gola, 2)

    corpo = novo_objeto('Camisa pendurada', bm, [p['mat']])
    sol = corpo.modifiers.new('Espessura', 'SOLIDIFY')
    sol.thickness = 0.003
    sol.offset = -1

    # Carcela e botões na frente (+x), no centro
    bm = bmesh.new()
    for k in range(6):
        z = topo - 0.06 - k * (H - 0.14) / 5
        bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.0055, radius2=0.0055, depth=0.003,
                              matrix=Matrix.Translation((T / 2 + 0.0015, 0, z)) @ Matrix.Rotation(math.pi / 2, 4, 'Y'))
    botoes = novo_objeto('Camisa • botões', bm, [metal], suave=False)

    # Cabide de madeira: arco que acompanha os ombros + gancho no varão
    bm = bmesh.new()
    def anel_cabide(t):
        u = t * 2 - 1
        y = u * (W / 2 - 0.02)
        z = topo + 0.012 - queda * abs(u) ** 1.15 * 0.95
        return [Vector((0.006 * math.sin(a), y, z + 0.009 * math.cos(a))) for a in (2 * math.pi * k / 8 for k in range(8))]
    tubo(bm, anel_cabide, 10, fechar_topo=True, fechar_base=True)
    cabide = novo_objeto('Cabide de madeira', bm, [madeira])

    bm = bmesh.new()
    rg = v['r'] + 0.006
    def anel_gancho(t):
        # haste vertical à frente do varão e meia-volta por cima dele (eixo do varão = x)
        if t < 0.35:
            c = Vector((0, -rg, topo + 0.02 + (v['z'] - topo - 0.02) * (t / 0.35)))
            tang = Vector((0, 0, 1))
        else:
            a = math.pi * (t - 0.35) / 0.65
            c = Vector((0, -rg * math.cos(a), v['z'] + rg * math.sin(a)))
            tang = Vector((0, math.sin(a), math.cos(a)))
        n1 = Vector((1, 0, 0))
        n2 = tang.cross(n1).normalized()
        return [c + 0.0022 * (math.cos(b) * n1 + math.sin(b) * n2) for b in (2 * math.pi * k / 8 for k in range(8))]
    tubo(bm, anel_gancho, 10, fechar_topo=True, fechar_base=True)
    gancho = novo_objeto('Gancho do cabide', bm, [metal])

    # Posição no varão, com pequenas variações naturais
    giro = math.radians(random.uniform(-7, 7))
    # leve balanço em torno do varão (o cabide pendura, não fica rígido)
    balanco = math.radians(random.uniform(-2.5, 2.5))
    piv = Vector((0, 0, v['z']))
    base = (Matrix.Translation((p['x'], v['y'], 0)) @ Matrix.Rotation(giro, 4, 'Z')
            @ Matrix.Translation(piv) @ Matrix.Rotation(balanco, 4, 'Y') @ Matrix.Translation(-piv))
    for ob in (corpo, botoes, cabide, gancho):
        ob.matrix_world = base @ ob.matrix_world
    # o gancho gira só em torno do varão (fica encaixado)


for i, p in enumerate(sorted(pecas, key=lambda p: (p['varao']['z'], p['x']))):
    if p['varao'] is None:
        print('RESULTADO sem varão:', p)
        continue
    camisa(p, i)

print('RESULTADO camisas criadas:', len(pecas))
if SALVAR:
    bpy.ops.wm.save_mainfile()
    print('RESULTADO salvo')
