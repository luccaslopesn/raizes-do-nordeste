/** Exporta cada wireframe (bloco com título, quadro e notas) para PNG. Uso: node wireframes/exportar.cjs */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const saida = path.join(__dirname, 'png');
  fs.mkdirSync(saida, { recursive: true });
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
  await pagina.goto('file://' + path.join(__dirname, 'wireframes.html'));
  const blocos = await pagina.$$('.bloco');
  for (const bloco of blocos) {
    const id = await bloco.getAttribute('id');
    const titulo = await bloco.$eval('.titulo', (e) => e.textContent);
    const nome = `${id}-${titulo.split('·')[1].trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    await bloco.screenshot({ path: path.join(saida, `${nome}.png`) });
    console.log(nome);
  }
  await navegador.close();
})();
