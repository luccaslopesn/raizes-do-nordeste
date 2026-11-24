"""Diagrama da Jornada do Usuário em raias (atividade UML). Uso: python3 gerar_jornada.py saida.svg"""
import sys

RAIAS = ['Cliente', 'Interface (App · Web · Totem)', 'Plataforma Raízes', 'Serviço de Pagamento', 'Loja (Cozinha · Balcão)']
LR, TOPO, LIN = 158, 46, 47           # largura da raia, altura do cabeçalho, altura da linha
L = LR * len(RAIAS) + 2
cx = lambda r: 1 + LR * r + LR / 2
cy = lambda l: TOPO + 22 + l * LIN

nos = {}
# id: (raia, linha, tipo, texto, estado)
def no(i, r, l, tipo, texto, estado=None):
    nos[i] = dict(r=r, l=l, tipo=tipo, texto=texto, estado=estado, x=cx(r), y=cy(l))

no('ini', 0, 0, 'inicio', '')
no('a1', 1, 0, 'acao', 'Exibe unidades|(formato, horário)')
no('a2', 0, 1, 'acao', 'Escolhe a unidade|de retirada')
no('a3', 2, 2, 'acao', 'Resolve cardápio: formato,|estoque, sazonal, região')
no('a4', 1, 3, 'acao', 'Mostra cardápio|(esgotado desabilitado)')
no('a5', 0, 4, 'acao', 'Adiciona itens e|revisa o carrinho')
no('d1', 1, 5, 'decisao', 'Identificado?')
no('a6', 0, 6, 'acao', 'App: entra ou cadastra-se|Totem: CPF opcional')
no('a7', 2, 7, 'acao', 'Calcula total: campanha,|recompensa e pontos')
no('a8', 0, 8, 'acao', 'Escolhe a forma e|confirma o pagamento')
no('a9', 2, 9, 'acao', 'Revalida estoque, cria|pedido e chave única', 'AGUARDANDO PAGTO.')
no('a10', 3, 10.35, 'acao', 'Processa a|solicitação')
no('d2', 2, 11.5, 'decisao', 'Resposta?')
no('a11', 1, 12.75, 'acao', 'Informa recusa ou|tempo esgotado')
no('a12', 2, 13, 'acao', 'Registra resultado e|credita pontos', 'RECEBIDO')
no('a13', 1, 14.35, 'acao', 'Mostra código de|retirada e status')
no('a14', 4, 14.35, 'acao', 'Inicia preparo', 'EM PREPARO')
no('a15', 4, 15.7, 'acao', 'Marca como pronto', 'PRONTO')
no('a16', 1, 17.05, 'acao', 'Atualiza app e|painel de chamada')
no('a17', 0, 18.05, 'acao', 'Apresenta o código|no balcão')
no('a18', 4, 19.05, 'acao', 'Confirma a entrega', 'RETIRADO')
no('fim', 4, 20.25, 'fim', '')

A = int(cy(20.25) + 30)
out = []
add = out.append
fonte = "Arial, 'Liberation Sans', sans-serif"
add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {L} {A}" width="{L}" height="{A}" font-family="{fonte}" fill="#111">')
add('<defs><marker id="s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#222"/></marker></defs>')
add(f'<rect width="{L}" height="{A}" fill="#fff"/>')
for r, nome in enumerate(RAIAS):
    x = 1 + LR * r
    add(f'<rect x="{x}" y="1" width="{LR}" height="{A-2}" fill="{"#f6f6f6" if r % 2 == 0 else "#fff"}" stroke="#222" stroke-width="1.3"/>')
    add(f'<rect x="{x}" y="1" width="{LR}" height="{TOPO-6}" fill="#e2e2e2" stroke="#222" stroke-width="1.3"/>')
    partes = nome.split(' (')
    add(f'<text x="{x+LR/2}" y="{20 if len(partes) > 1 else 26}" text-anchor="middle" font-size="12" font-weight="700">{partes[0]}</text>')
    if len(partes) > 1:
        add(f'<text x="{x+LR/2}" y="{34}" text-anchor="middle" font-size="10">({partes[1]}</text>')

W, H = 138, 34
def caixa(n):
    x, y = n['x'], n['y']
    if n['tipo'] == 'inicio':
        add(f'<circle cx="{x}" cy="{y}" r="9" fill="#222"/>'); return
    if n['tipo'] == 'fim':
        add(f'<circle cx="{x}" cy="{y}" r="11" fill="#fff" stroke="#222" stroke-width="1.6"/><circle cx="{x}" cy="{y}" r="6.5" fill="#222"/>'); return
    linhas = n['texto'].split('|')
    if n['tipo'] == 'decisao':
        add(f'<polygon points="{x},{y-21} {x+62},{y} {x},{y+21} {x-62},{y}" fill="#fff" stroke="#222" stroke-width="1.4"/>')
    elif n['tipo'] == 'nota':
        add(f'<path d="M{x-W/2},{y-H/2} h{W-10} l10,10 v{H-10} h-{W} Z" fill="#fffbe6" stroke="#666" stroke-width="1" stroke-dasharray="3 2"/>')
    else:
        add(f'<rect x="{x-W/2}" y="{y-H/2}" width="{W}" height="{H}" rx="9" fill="#fff" stroke="#222" stroke-width="1.4"/>')
    base = y - (len(linhas) - 1) * 6 + 3.5
    for i, t in enumerate(linhas):
        add(f'<text x="{x}" y="{base+i*12}" text-anchor="middle" font-size="10.3">{t}</text>')
    if n['estado']:
        e = n['estado']; w = len(e) * 5.6 + 12
        add(f'<rect x="{x-w/2}" y="{y+H/2+1}" width="{w}" height="13" rx="6.5" fill="#333"/>')
        add(f'<text x="{x}" y="{y+H/2+11}" text-anchor="middle" font-size="8.4" font-weight="700" fill="#fff" letter-spacing=".3">{e}</text>')

def lim(n, lado):
    x, y = n['x'], n['y']
    meia_l = 9 if n['tipo'] in ('inicio',) else 11 if n['tipo'] == 'fim' else 62 if n['tipo'] == 'decisao' else W / 2
    meia_a = 9 if n['tipo'] == 'inicio' else 11 if n['tipo'] == 'fim' else 21 if n['tipo'] == 'decisao' else H / 2
    extra = 14 if n.get('estado') and lado == 'b' else 0
    return {'t': (x, y - meia_a), 'b': (x, y + meia_a + extra), 'l': (x - meia_l, y), 'r': (x + meia_l, y)}[lado]

def rotulo(x, y, t, ancora='middle'):
    add(f'<text x="{x}" y="{y}" text-anchor="{ancora}" font-size="9.5" font-style="italic" paint-order="stroke" stroke="#fff" stroke-width="3.5">{t}</text>')

def seta(pontos, tracejada=False):
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pontos)
    add(f'<path d="{d}" fill="none" stroke="#222" stroke-width="1.25" {"stroke-dasharray=\"5 3\"" if tracejada else ""} marker-end="url(#s)"/>')

def liga(a, b, la='r', lb='l', via=None, rot=None, rot_pos=None, tracejada=False):
    p = lim(nos[a], la); q = lim(nos[b], lb)
    if via == 'hv':      # horizontal e depois vertical
        pts = [p, (q[0], p[1]), q]
    elif via == 'vh':    # vertical e depois horizontal
        pts = [p, (p[0], q[1]), q]
    elif isinstance(via, list):
        pts = [p, *via, q]
    else:
        pts = [p, q]
    seta(pts, tracejada)
    if rot:
        rotulo(*rot_pos, rot)

for n in nos.values():
    pass

liga('ini', 'a1', 'r', 'l')
liga('a1', 'a2', 'b', 'r', via='vh')
liga('a2', 'a3', 'b', 'l', via='vh')
liga('a3', 'a4', 'b', 'r', via='vh')
liga('a4', 'a5', 'b', 'r', via='vh')
liga('a5', 'd1', 'r', 't', via='hv')
liga('d1', 'a6', 'b', 'r', via='vh', rot='não', rot_pos=(cx(1) + 14, cy(6) - 5))
liga('a6', 'd1', 't', 'l', via='vh')
liga('d1', 'a7', 'r', 't', via='hv', rot='sim', rot_pos=(cx(1) + 82, cy(5) - 5))
liga('a7', 'a8', 'l', 't', via='hv')
liga('a8', 'a9', 'r', 't', via='hv')
liga('a9', 'a10', 'r', 't', via='hv')
liga('a10', 'd2', 'b', 'r', via='vh')
# Falha de comunicação: reenvia com a mesma chave
seta([lim(nos['d2'], 't'), (cx(2), cy(10.35)), lim(nos['a10'], 'l')], tracejada=True)
rotulo(cx(2) + 6, cy(10.35) - 6, 'falha de rede:', 'start')
rotulo(cx(2) + 6, cy(10.35) + 16, 'mesma chave', 'start')
liga('d2', 'a12', 'b', 't', rot='aprovado', rot_pos=(cx(2) + 30, cy(12.3)))
liga('d2', 'a11', 'l', 't', via='hv', rot='recusado ou', rot_pos=(cx(1) + 18, cy(11.5) - 14))
rotulo(cx(1) + 18, cy(11.5) - 3, 'sem resposta')
# Nova tentativa volta à escolha de pagamento (nova chave)
seta([lim(nos['a11'], 'l'), (cx(0), cy(12.75)), lim(nos['a8'], 'b')], tracejada=True)
rotulo(cx(0) - 4, cy(10.6), 'nova tentativa')
rotulo(cx(0) - 4, cy(10.6) + 11, '(nova chave)')
liga('a12', 'a13', 'b', 'r', via='vh')
liga('a12', 'a14', 'r', 't', via='hv')
liga('a14', 'a15', 'b', 't')
liga('a15', 'a16', 'l', 't', via='hv')
liga('a16', 'a17', 'b', 'r', via='vh')
liga('a17', 'a18', 'b', 'l', via='vh')
liga('a18', 'fim', 'b', 't')

for n in nos.values():
    caixa(n)

add('</svg>')
open(sys.argv[1], 'w').write('\n'.join(out))
