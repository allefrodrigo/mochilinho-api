const puppeteer = require('puppeteer-extra');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

function createImageFromText(text, maxWidth, maxHeight, filePath) {
    const canvas = createCanvas(maxWidth, maxHeight);
    const ctx = canvas.getContext('2d');
  
    // Definir fundo branco
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Definir cor e fonte do texto
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
  
    // Quebrar o texto em linhas para que caiba na largura máxima
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
  
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine); // Adiciona a última linha
  
    // Desenhar o texto linha por linha
    let y = 20; // Margem superior inicial
    lines.forEach((line) => {
      ctx.fillText(line, 10, y); // 10 é a margem esquerda
      y += 30; // Espaçamento entre linhas
    });
  
    // Salvar a imagem
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
  }
  
  
function findCheapestRoundTrip(flightDetails) {
    // Primeiro, vamos converter os preços para números e as datas para objetos Date
    flightDetails.forEach(flight => {
      flight.price = parseInt(flight.priceContent.replace(/,/g, ''), 10);
      flight.date = new Date(flight.dateLabel.replace(/.*,\s*/, ''));
    });
  
    // Ordena os voos por preço
    flightDetails.sort((a, b) => a.price - b.price);
  
    // Encontra o voo de ida mais barato
    const cheapestDeparture = flightDetails[0];
  
    // Filtra os voos de volta que são após a data de ida mais barata
    const validReturnFlights = flightDetails.filter(flight => flight.date > cheapestDeparture.date);
  
    // Encontra o voo de volta mais barato após a data de ida mais barata
    const cheapestReturn = validReturnFlights.reduce((cheapest, flight) => {
      if (!cheapest || flight.price < cheapest.price) {
        return flight;
      }
      return cheapest;
    }, null);
  
    // Se houver vários voos com o mesmo preço mais baixo, liste-os
    const cheapestReturns = validReturnFlights.filter(flight => flight.price === cheapestReturn.price);
  
    return {
      cheapestDeparture,
      cheapestReturns
    };
  }


  
async function getData(origem, destino) {
    const browser = await puppeteer.launch({
        headless: false, // Abre o navegador em modo não headless para interação manual
      });
    
      const page = await browser.newPage();
      const url = 'https://www.google.com/travel/flights';
    
      await page.goto(url, { waitUntil: 'networkidle2' });
    
   // Espera até que o elemento com role="combobox" esteja visível
const comboboxSelector = '[role="combobox"]';
await page.waitForSelector(comboboxSelector);

// Clica no combobox
await page.click(comboboxSelector);

// Espera até que o elemento li com data-value="2" esteja visível
const liSelector = 'li[data-value="2"]';
await page.waitForSelector(liSelector);

// Clica no elemento li
await page.click(liSelector);


// Aguarda um momento para a ação de clique ser processada
await page.waitForTimeout(1000);
  // Localizar o elemento de entrada pelo valor 'Aracati'
  const inputSelector = 'input[type="text"][value="Aracati"]';
  await page.waitForSelector(inputSelector);

  // Clique no input para interagir com ele
  await page.click(inputSelector);

  // Simular CTRL+A para selecionar todo o texto
  await page.keyboard.down('Control');
  await page.keyboard.press('A'); // Pode precisar ser 'a' em sistemas macOS
  await page.keyboard.up('Control');
    console.log('Iniciando bot.');
    await page.waitForTimeout(200);
    console.log("\x1b[32m", 'Bot configurado.');  // Cyan
    await page.waitForTimeout(500);
    console.log("\x1b[1m", `Pesquisando ${origem} até ${destino}`); // Yellow
  // Digitar 'REC' para substituir o texto selecionado
  await page.keyboard.type(origem);
  await page.waitForTimeout(500);

  await page.keyboard.press('Enter');
  //console.log("\x1b[32m", 'Lista de preços de dezembro obtida ✅'); // Yellow

  // Pressionar Tab duas vezes
  await page.keyboard.press('Tab');
  // Aguarde um momento para que a digitação seja concluída
  await page.keyboard.type(destino);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  await page.keyboard.type('14/12/2023');
  await page.waitForTimeout(2000);
  //console.log("\x1b[32m", 'Lista de preços de janeiro obtida ✅'); // Yellow

  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');

  await page.waitForTimeout(1000);

  // Pressiona Enter para ativar a seleção
await page.keyboard.press('Enter');
// Localiza o botão com o aria-label "Next"
const nextButtonSelector = 'button[aria-label="Next"]';
await page.waitForSelector(nextButtonSelector);

// Clica no botão "Next"
//   await page.keyboard.press('Tab');
//   await page.keyboard.press('Tab');
//   await page.keyboard.press('Enter');
  await page.click(nextButtonSelector);
  await page.waitForTimeout(6000);// Função para executar a busca de dados
  await page.click(nextButtonSelector);
  await page.waitForTimeout(6000);// Função para executar a busca de dados
  await page.click(nextButtonSelector);
  await page.waitForTimeout(6000);// Função para executar a busca de dados
  await page.click(nextButtonSelector);
  await page.waitForTimeout(6000);// Função para executar a busca de dados
// Captura o conteúdo de todas as divs preenchidas com role="button" e tabindex="-1" dentro de divs com role="rowgroup"
const flightDetails = await page.evaluate(() => {
    const details = [];
    // Seleciona todas as divs com role="rowgroup"
    const rowGroups = Array.from(document.querySelectorAll('div[role="rowgroup"]'));
    
    rowGroups.forEach(group => {
      const buttons = Array.from(group.querySelectorAll('div[role="button"][tabindex="-1"]'));
      buttons.forEach(btn => {
        const dateDiv = btn.querySelector('div[jsname="nEWxA"]');
        const priceDiv = btn.querySelector('div[jsname="qCDwBb"]');
        
        // Verifica se ambos os elementos existem e se o priceDiv está preenchido
        if (dateDiv && priceDiv && priceDiv.textContent.trim() !== '') {
          const dateLabel = dateDiv.getAttribute('aria-label');
          const dateContent = dateDiv.textContent.trim();
          const priceLabel = priceDiv.getAttribute('aria-label');
          const priceContent = priceDiv.textContent.trim();
          
          // Salva as informações em um objeto
          details.push({
            dateLabel,
            dateContent,
            priceLabel,
            priceContent
          });
        }
      });
    });
  
    return details;
  });

  
  // Suponha que `flightDetails` seja o seu array de objetos com os detalhes dos voos
  const { cheapestDeparture, cheapestReturns } = findCheapestRoundTrip(flightDetails);
  
  console.log('Dia de ida mais barato:', cheapestDeparture);
 // console.log('Opções de volta mais baratas:');
 // cheapestReturns.forEach(flight => console.log(flight));
  
   // console.log('Detalhes dos voos:', flightDetails);
  await browser.close();
}
  

  
module.exports = { getData };



      // Extrai informações de