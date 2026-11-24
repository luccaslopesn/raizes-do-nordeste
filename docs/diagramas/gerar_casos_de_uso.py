"""Diagrama de Casos de Uso (UML) desenhado em SVG puro. Uso: python3 gerar_casos_de_uso.py saida.svg"""
import sys

L, A = 920, 760
fonte = "Arial, 'Liberation Sans', sans-serif"
partes = []
def add(s): partes.append(s)

def ator(x, y, nome, linhas=None):
    add(f'<g stroke="#222" stroke-width="1.6" fill="none">'
        f'<circle cx="{x}" cy="{y}" r="11"/><line x1="{x}" y1="{y+11}" x2="{x}" y2="{y+42}"/>'
        f'<line x1="{x-18}" y1="{y+22}" x2="{x+18}" y2="{y+22}"/>'
        f'<line x1="{x}" y1="{y+42}" x2="{x-15}" y2="{y+66}"/><line x1="{x}" y1="{y+42}" x2="{x+15}" y2="{y+66}"/></g>')
    for i, t in enumerate(linhas or [nome]):
        add(f'<text x="{x}" y="{y+84+i*14}" text-anchor="middle" font-size="12.5" font-weight="700">{t}</text>')

def ator_sistema(x, y, linhas):
    add(f'<rect x="{x-62}" y="{y}" width="124" height="62" fill="#fff" stroke="#222" stroke-width="1.6"/>')
    add(f'<text x="{x}" y="{y+16}" text-anchor="middle" font-size="11">«sistema externo»</text>')
    for i, t in enumerate(linhas):
        add(f'<text x="{x}" y="{y+33+i*14}" text-anchor="middle" font-size="12.5" font-weight="700">{t}</text>')

uc = {}
def caso(id_, x, y, linhas, rx=108, ry=25):
    uc[id_] = (x, y, rx, ry)
    add(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#fff" stroke="#222" stroke-width="1.4"/>')
    base = y - (len(linhas) - 1) * 6.5 + 4
    for i, t in enumerate(linhas):
        add(f'<text x="{x}" y="{base+i*13}" text-anchor="middle" font-size="11.5">{t}</text>')

def borda(id_, alvo):
    x, y, rx, ry = uc[id_]
    import math
    dx, dy = alvo[0]-x, alvo[1]-y
    t = 1/math.sqrt((dx/rx)**2 + (dy/ry)**2)
    return x+dx*t, y+dy*t

def linha(p, q):
    add(f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{q[0]:.1f}" y2="{q[1]:.1f}" stroke="#222" stroke-width="1.2"/>')

def assoc(ponto_ator, id_):
    linha(ponto_ator, borda(id_, ponto_ator))

def dependencia(de, para, rotulo, dx=0, dy=0):
    a = borda(de, uc[para][:2]); b = borda(para, uc[de][:2])
    add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#222" stroke-width="1.2" stroke-dasharray="6 4" marker-end="url(#seta)"/>')
    mx, my = (a[0]+b[0])/2 + dx, (a[1]+b[1])/2 + dy
    add(f'<text x="{mx:.1f}" y="{my:.1f}" text-anchor="middle" font-size="11" font-style="italic" fill="#222" paint-order="stroke" stroke="#fff" stroke-width="4">«{rotulo}»</text>')

def generalizacao(p, q):
    add(f'<line x1="{p[0]}" y1="{p[1]}" x2="{q[0]}" y2="{q[1]}" stroke="#222" stroke-width="1.3" marker-end="url(#triangulo)"/>')

add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {L} {A}" width="{L}" height="{A}" font-family="{fonte}" fill="#111">')
add('<defs><marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#222" stroke-width="1.4"/></marker>'
    '<marker id="triangulo" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="#fff" stroke="#222" stroke-width="1.2"/></marker></defs>')
add(f'<rect width="{L}" height="{A}" fill="#fff"/>')

# Fronteira do sistema
add('<rect x="150" y="16" width="590" height="738" rx="6" fill="#f7f7f7" stroke="#222" stroke-width="1.6"/>')
add('<text x="445" y="38" text-anchor="middle" font-size="13.5" font-weight="700">Plataforma Raízes do Nordeste (App · Web · Totem · Loja)</text>')

def ponta_esquerda(id_):
    x, y, rx, ry = uc[id_]
    return (x - rx, y)

# Coluna do cliente
c1 = 300
caso('UC01', c1, 82, ['UC01 Criar conta e', 'autenticar-se'])
caso('UC02', c1, 142, ['UC02 Gerenciar dados e', 'consentimentos (LGPD)'])
caso('UC03', c1, 202, ['UC03 Escolher unidade e', 'consultar cardápio'])
caso('UC04', c1, 262, ['UC04 Consultar', 'promoções'])
caso('UC05', c1, 322, ['UC05 Montar', 'carrinho'])
caso('UC10', c1, 382, ['UC10 Acompanhar', 'pedido'])
caso('UC06', c1, 462, ['UC06 Realizar', 'pedido'], rx=104, ry=27)
caso('UC08', 286, 560, ['UC08 Resgatar', 'recompensa'], rx=86)
caso('UC09', 286, 640, ['UC09 Identificar-se', 'por CPF (totem)'], rx=86)

# Coluna da loja
c2 = 610
caso('UC11', c2, 92, ['UC11 Atualizar status', 'de preparo'])
caso('UC12', c2, 196, ['UC12 Consultar', 'indicadores da unidade'])
caso('UC13', c2, 258, ['UC13 Auditar cancelamentos', 'e descontos'])
caso('UC14', c2, 362, ['UC14 Cancelar', 'pedido'])
caso('UC15', c2, 428, ['UC15 Entregar', 'pedido'])
caso('UC16', c2, 494, ['UC16 Registrar pedido', 'no balcão'])
caso('UC07', 500, 690, ['UC07 Realizar', 'pagamento'], rx=104, ry=27)

# Atores
ator(70, 300, 'Cliente', ['Cliente', '(App, Web, Totem)'])
cliente = (88, 322)
for u in ['UC01', 'UC02', 'UC03', 'UC04', 'UC05', 'UC10', 'UC06']:
    linha(cliente, ponta_esquerda(u))

ator(840, 40, 'Cozinha')
linha((822, 64), (c2 + 108, 92))
ator(840, 200, 'Gerente', ['Gerente /', 'Administrador'])
linha((822, 224), (c2 + 108, 196)); linha((822, 224), borda('UC13', (822, 224)))
ator(840, 396, 'Atendente')
for u in ['UC14', 'UC15', 'UC16']:
    linha((822, 420), borda(u, (822, 420)))
ator_sistema(850, 659, ['Serviço de', 'Pagamento'])
linha((788, 690), (604, 690))

# Gerente herda Cozinha e Atendente (seta do filho para o pai)
generalizacao((856, 188), (856, 142))
generalizacao((856, 304), (856, 386))

# Inclusões e extensões
dependencia('UC06', 'UC07', 'include', dx=46, dy=-8)
dependencia('UC16', 'UC07', 'include', dx=48, dy=0)
dependencia('UC08', 'UC06', 'extend', dx=-40, dy=4)
# UC09 estende UC06 contornando UC08 pela esquerda
add('<path d="M200,640 C150,630 150,500 205,476" fill="none" stroke="#222" stroke-width="1.2" stroke-dasharray="6 4" marker-end="url(#seta)"/>')
add('<text x="168" y="572" text-anchor="middle" font-size="11" font-style="italic" paint-order="stroke" stroke="#f7f7f7" stroke-width="4" transform="rotate(-90 168 572)">«extend»</text>')

add('</svg>')
open(sys.argv[1], 'w').write('\n'.join(partes))
