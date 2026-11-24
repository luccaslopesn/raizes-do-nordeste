"""
Gera o documento do Projeto Multidisciplinar em PDF (ABNT).

Uso: python3 docs/documento/gerar.py [saida.pdf]
Requer: Playwright (Chromium) acessível pelo Node, pypdf e reportlab.

Etapas: monta o HTML (numeração de seções, figuras e quadros, referências cruzadas),
renderiza, descobre a página de cada título pelo texto do PDF, preenche sumário e
listas com as páginas e carimba a numeração a partir da Introdução.
"""
import io, json, os, re, subprocess, sys
from html import escape
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, '4589258_Projeto_Front_End.pdf')

AUTOR = 'Lucas Lopes Nepomusceno'
RU = 'RU 4589258'
INSTITUICAO = ['Centro Universitário Internacional UNINTER', 'Projeto Multidisciplinar · Trilha Front-end']
TITULO = 'Rede Raízes do Nordeste'
SUBTITULO = 'interface multicanal para pedidos, fidelização e pagamento externo'
LOCAL, ANO = 'São Paulo', '2026'

RESUMO = """Este trabalho apresenta a solução de interface (front-end) para a Raízes do Nordeste, rede de lanchonetes
nordestinas em expansão que atende clientes por aplicativo, site, totem de autoatendimento e balcão. O estudo de caso traz
três desafios principais: unidades com formatos, estoques e cardápios diferentes; um programa de fidelização que depende de
dados pessoais e deve respeitar a Lei Geral de Proteção de Dados Pessoais; e pagamentos processados por um serviço externo,
o que exige tratar recusas, demoras e falhas sem cobrança duplicada. A partir desses desafios foram levantados 21 requisitos
funcionais e 11 não funcionais, com priorização e critérios verificáveis, e a solução foi modelada com diagrama de casos de
uso, descrição da funcionalidade de pagamento, diagrama de sequência, jornada do usuário em raias e diagrama de estados do
pedido. Wireframes de baixa fidelidade validaram a navegação no celular, no computador e no totem. A interface foi
implementada em React com TypeScript, dados simulados e um serviço de pagamento simulado, e publicada na Vercel. A LGPD
aparece na própria interface, com aviso de cookies, consentimentos separados e desmarcados, finalidade de cada dado, Central
de Privacidade e CPF opcional e oculto no totem. A qualidade foi verificada por 23 testes ponta a ponta e 15 testes de
unidade, todos aprovados, e por auditoria Lighthouse com notas 95 em performance e 100 em acessibilidade no perfil de
celular."""
PALAVRAS = 'Front-end. Multicanal. LGPD. Pagamento externo. Mobile-first.'

SIGLAS = [
    ('ANPD', 'Autoridade Nacional de Proteção de Dados'), ('CLS', 'Cumulative Layout Shift (deslocamento acumulado de layout)'),
    ('CPF', 'Cadastro de Pessoas Físicas'), ('CT', 'Caso de teste'), ('KDS', 'Kitchen Display System (tela de pedidos da cozinha)'),
    ('LCP', 'Largest Contentful Paint (tempo até o maior elemento visível)'), ('LGPD', 'Lei Geral de Proteção de Dados Pessoais'),
    ('RF', 'Requisito funcional'), ('RN', 'Regra de negócio'), ('RNF', 'Requisito não funcional'),
    ('TBT', 'Total Blocking Time (tempo total de bloqueio)'), ('UC', 'Use case (caso de uso)'),
    ('UML', 'Unified Modeling Language'), ('WCAG', 'Web Content Accessibility Guidelines'),
]

FONTE_PADRAO = 'Elaborado pelo autor (2026).'
FONTE_CAPTURA = 'Capturas da aplicação publicada, geradas pelos testes automatizados (2026).'


def montar_corpo():
    arquivos = sorted(f for f in os.listdir(os.path.join(AQUI, 'secoes')) if f.endswith('.html'))
    html = '\n'.join(open(os.path.join(AQUI, 'secoes', f), encoding='utf-8').read() for f in arquivos)

    # ---- Seções numeradas ----
    sumario, ids_secao = [], {}
    contadores = [0, 0, 0]
    n_auto = [0]

    def titulo(m):
        nivel, attrs, texto = int(m.group(1)), m.group(2) or '', m.group(3)
        idm = re.search(r'id="([^"]+)"', attrs)
        if not idm:
            n_auto[0] += 1
            ident = f'h-auto-{n_auto[0]}'
            attrs += f' id="{ident}"'
        else:
            ident = idm.group(1)
        sem_numero = 'sem-numero' in attrs
        if sem_numero:
            numero = ''
        else:
            contadores[nivel - 1] += 1
            for i in range(nivel, 3):
                contadores[i] = 0
            numero = '.'.join(str(c) for c in contadores[:nivel])
            ids_secao[ident] = numero
        texto_limpo = re.sub('<[^>]+>', '', texto)
        sumario.append(dict(id=ident, nivel=nivel, numero=numero, texto=texto_limpo))
        prefixo = f'<span class="num">{numero}</span>' if numero else ''
        return f'<h{nivel}{attrs}>{prefixo}{texto}<span class="marca">@@{ident}@@</span></h{nivel}>'

    html = re.sub(r'<h([123])((?:\s[^>]*)?)>(.*?)</h\1>', titulo, html, flags=re.S)

    # ---- Figuras e quadros ----
    listas = {'Figura': [], 'Quadro': []}
    numeros = {}

    def figura(m):
        attrs, conteudo = m.group(1), m.group(2)
        tipo = re.search(r'data-tipo="([^"]+)"', attrs).group(1)
        ident = re.search(r'id="([^"]+)"', attrs).group(1)
        n = len(listas[tipo]) + 1
        numeros[ident] = f'{tipo} {n}'
        cap = re.search(r'<figcaption>(.*?)</figcaption>', conteudo, re.S).group(1).strip()
        listas[tipo].append(dict(id=ident, rotulo=f'{tipo} {n} – {re.sub("<[^>]+>", "", cap)}'))
        conteudo = conteudo.replace(
            f'<figcaption>{cap}</figcaption>',
            f'<figcaption>{tipo} {n} – {cap}<span class="marca">@@{ident}@@</span></figcaption>', 1)
        fonte = re.search(r'data-fonte="([^"]+)"', attrs)
        if fonte:
            texto_fonte = fonte.group(1)
        elif re.search(r'img/(tela|ev)-', conteudo):
            texto_fonte = FONTE_CAPTURA
        else:
            texto_fonte = FONTE_PADRAO
        largura = re.search(r'data-largura="([^"]+)"', attrs)
        if largura:
            conteudo = re.sub(r'<img ', f'<img style="width:{largura.group(1)}" ', conteudo, count=1) \
                if 'style=' not in conteudo.split('<img', 1)[1].split('>', 1)[0] else conteudo
        return f'<figure{attrs}>{conteudo}<p class="fonte">Fonte: {texto_fonte}</p></figure>'

    html = re.sub(r'<figure([^>]*)>(.*?)</figure>', figura, html, flags=re.S)

    # ---- Referências cruzadas ----
    def referencia(m):
        ident = m.group(1)
        if ident == 's-apendice':
            return 'Apêndice A'
        if ident in numeros:
            return numeros[ident]
        if ident in ids_secao:
            return f'Seção {ids_secao[ident]}'
        raise KeyError(f'referência desconhecida: {ident}')

    html = re.sub(r'\[\[([\w-]+)\]\]', referencia, html)
    return html, sumario, listas


def item_lista(rotulo, pagina, classe='', numero=None):
    num = f'<span class="num-sum">{numero}</span>' if numero is not None else ''
    return (f'<div class="item {classe}"><span class="rot">{num}{rotulo}</span>'
            f'<span class="pontos"></span><span class="pag">{pagina}</span></div>')


def montar_html(paginas):
    corpo, sumario, listas = montar_corpo()
    pg = lambda ident: paginas.get(ident, '00')

    capa = f'''<section class="pagina capa">
      <div class="topo">{'<br>'.join(escape(x) for x in INSTITUICAO)}</div>
      <div class="meio" style="margin-top:3.5cm;margin-bottom:0">{escape(AUTOR)}<br>{RU}</div>
      <div class="meio"><div class="titulo">{escape(TITULO)}:</div><div class="subtitulo">{escape(SUBTITULO)}</div></div>
      <div class="base">{LOCAL}<br>{ANO}</div></section>'''

    rosto = f'''<section class="pagina rosto">
      <div class="topo">{escape(AUTOR)}<br>{RU}</div>
      <div class="meio"><div class="titulo">{escape(TITULO)}:</div><div class="subtitulo">{escape(SUBTITULO)}</div>
        <div class="natureza">Trabalho apresentado à disciplina Projeto Multidisciplinar, trilha Front-end (Opção B: codificação),
        do Centro Universitário Internacional UNINTER, como requisito parcial de avaliação.</div></div>
      <div class="base">{LOCAL}<br>{ANO}</div></section>'''

    resumo = f'''<section class="pagina resumo"><div class="titulo-pre">Resumo</div>
      <p>{' '.join(RESUMO.split())}</p>
      <p class="palavras"><strong>Palavras-chave:</strong> {PALAVRAS}</p></section>'''

    lista_fig = '<section class="pagina lista"><div class="titulo-pre">Lista de figuras</div>' + \
        ''.join(item_lista(escape(f['rotulo']), pg(f['id'])) for f in listas['Figura']) + '</section>'
    lista_qua = '<section class="pagina lista"><div class="titulo-pre">Lista de quadros</div>' + \
        ''.join(item_lista(escape(f['rotulo']), pg(f['id'])) for f in listas['Quadro']) + '</section>'
    siglas = '<section class="pagina lista siglas"><div class="titulo-pre">Lista de abreviaturas e siglas</div>' + \
        ''.join(f'<div class="item"><span>{a}</span><span>{b}</span></div>' for a, b in SIGLAS) + '</section>'

    linhas = []
    for s in sumario:
        texto = s['texto'] if s['nivel'] > 1 or not s['numero'] else s['texto']
        linhas.append(item_lista(escape(texto), pg(s['id']), f"nivel-{s['nivel'] if s['numero'] else 1}",
                                 numero=s['numero'] if s['numero'] else ''))
    sumario_html = '<section class="lista"><div class="titulo-pre">Sumário</div>' + ''.join(linhas) + '</section>'

    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <title>{escape(TITULO)}</title><link rel="stylesheet" href="estilo.css"></head>
      <body>{capa}{rosto}{resumo}{lista_fig}{lista_qua}{siglas}{sumario_html}
      <main>{corpo}</main></body></html>''', sumario, listas


def renderizar(html, destino):
    caminho_html = os.path.join(AQUI, '_documento.html')
    open(caminho_html, 'w', encoding='utf-8').write(html)
    script = f'''
      const {{ chromium }} = require('playwright');
      (async () => {{
        const b = await chromium.launch();
        const p = await b.newPage();
        await p.goto('file://{caminho_html}', {{ waitUntil: 'networkidle' }});
        await p.evaluate(() => document.fonts.ready);
        await p.pdf({{ path: {json.dumps(destino)}, preferCSSPageSize: true, printBackground: true }});
        await b.close();
      }})();'''
    raiz_npm = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
    subprocess.run(['node', '-e', script], check=True, env={**os.environ, 'NODE_PATH': raiz_npm})


def localizar_paginas(pdf):
    leitor = PdfReader(pdf)
    paginas = {}
    for indice, pagina in enumerate(leitor.pages):
        for ident in re.findall(r'@@([\w-]+)@@', (pagina.extract_text() or '').replace('\n', ''), re.I):
            ident = ident.lower()
            paginas.setdefault(ident, indice)  # índice 0 = capa (não contada); 1 = folha de rosto
    return paginas, len(leitor.pages)


def carimbar(pdf_entrada, pdf_saida, primeira):
    leitor = PdfReader(pdf_entrada)
    escritor = PdfWriter()
    largura, altura = A4
    for indice, pagina in enumerate(leitor.pages):
        if indice >= primeira:
            buf = io.BytesIO()
            c = canvas.Canvas(buf, pagesize=A4)
            c.setFont('Helvetica', 10)
            c.drawRightString(largura - 2 * 28.3465, altura - 2 * 28.3465, str(indice))
            c.save()
            buf.seek(0)
            pagina.merge_page(PdfReader(buf).pages[0])
        escritor.add_page(pagina)
    escritor.add_metadata({'/Title': f'{TITULO}: {SUBTITULO}', '/Author': AUTOR, '/Subject': 'Projeto Multidisciplinar - Trilha Front-end'})
    bruto = pdf_saida + '.tmp'
    with open(bruto, 'wb') as f:
        escritor.write(f)
    # a mesclagem do carimbo descomprime o conteúdo; o qpdf recomprime
    subprocess.run(['qpdf', '--object-streams=generate', '--compress-streams=y', '--recompress-flate',
                    '--compression-level=9', bruto, pdf_saida], check=True)
    os.remove(bruto)


def principal():
    temporario = os.path.join(AQUI, '_passo.pdf')
    paginas = {}
    for passo in range(3):
        html, sumario, _ = montar_html(paginas)
        renderizar(html, temporario)
        novas, total = localizar_paginas(temporario)
        if novas == paginas:
            break
        paginas = novas
    faltando = [s['id'] for s in sumario if s['id'] not in paginas]
    if faltando:
        print('AVISO: títulos não localizados no PDF:', faltando)
    primeira = paginas[sumario[0]['id']]
    carimbar(temporario, SAIDA, primeira)
    os.remove(temporario)
    print(f'{SAIDA}: {total} páginas; texto começa na página {primeira}; {os.path.getsize(SAIDA) / 1e6:.1f} MB')


if __name__ == '__main__':
    principal()
