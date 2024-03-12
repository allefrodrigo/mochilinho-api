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

  async function tryClick(page, selector, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await page.waitForSelector(selector, { visible: true });
            await page.click(selector);
            return; // Se o clique for bem-sucedido, saia da função
        } catch (error) {
            console.log(`Tentativa ${attempt} falhou. Tentando novamente...`);
            if (attempt === maxAttempts) {
                throw error; // Se atingir o número máximo de tentativas, lance o erro
            }
        }
    }
}


  
async function getData(origem, destino) {
    const browser = await puppeteer.launch({
        headless: false, // Abre o navegador em modo não headless para interação manual
      });
    
      const page = await browser.newPage();
      const url = 'https://www.google.com/travel/flights';
    
      await page.goto(url, { waitUntil: 'networkidle2' });
    

await tryClick(page, '[role="combobox"]');

//await page.waitForSelector(liSelector);
await page.waitForTimeout(500);
await tryClick(page, 'li[data-value="2"]');


await page.waitForTimeout(1000);
  const inputSelector = 'input[type="text"][value="Aracati"]';
  await page.waitForSelector(inputSelector);

  // Clique no input para interagir com ele
  await page.click(inputSelector);

  // Simular CTRL+A para selecionar todo o texto
  await page.keyboard.down('Control');
  await page.keyboard.press('A'); // Pode precisar ser 'a' em sistemas macOS
  await page.keyboard.up('Control');

    await page.waitForTimeout(500);
    console.log("\x1b[1m", `Pesquisando ${origem} até ${destino}`); // Yellow
  await page.keyboard.type(origem);
  await page.waitForTimeout(500);

  await page.keyboard.press('Enter');

  // Pressionar Tab duas vezes
  await page.keyboard.press('Tab');
  // Aguarde um momento para que a digitação seja concluída
  const timeWait = 3000;

  await page.keyboard.type(destino);
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);
  await page.keyboard.type('21/12/2023');
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');


  // Pressiona Enter para ativar a seleção
await page.keyboard.press('Enter');

// Localiza o botão com o aria-label "Next"
const nextButtonSelector = 'button[aria-label="Next"]';
await page.waitForSelector(nextButtonSelector);
await page.click(nextButtonSelector);
await page.waitForTimeout(timeWait);// Função para executar a busca de dados

const backButtonSelector = 'button[aria-label="Previous"]';
await page.waitForSelector(backButtonSelector);
await page.click(backButtonSelector);
await page.waitForTimeout(timeWait);// Função para executar a busca de dados


for (let i = 0; i < 9; i++) {
  await page.click(nextButtonSelector);

    await page.waitForTimeout(timeWait);// Função para executar a busca de dados
}


  
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
  
  console.log(cheapestDeparture);
 // console.log('Opções de volta mais baratas:');
 // cheapestReturns.forEach(flight => console.log(flight));
  
   // console.log('Detalhes dos voos:', flightDetails);
  await browser.close();
}


function parseTravelInfo(text) {
  const lines = text.split('\n');
  const travelInfo = [];
  let current = {};

  // Lista de palavras a serem ignoradas
  const ignoreWords = ["About these results", "About", "Privacy", "Terms", "Join user studies", "Feedback", "Help Center"];

  for (let i = 0; i < lines.length; i++) {
      // Verifica se a linha atual contém alguma palavra da lista de ignorados
      if (ignoreWords.some(word => lines[i].includes(word))) {
          continue; // Pula para a próxima iteração do loop se a linha contém uma palavra ignorada
      }

      if (i % 6 === 0) {
          if (current.destination) travelInfo.push(current);
          current = { destination: lines[i] };
      } else if (i % 6 === 1) {
          current.date = lines[i];
      } else if (i % 6 === 2) {
          current.initialPrice = lines[i];
      } else if (i % 6 === 3) {
          current.flightDetails = lines[i];
      } else if (i % 6 === 4) {
          current.duration = lines[i];
      } else if (i % 6 === 5) {
          current.finalPrice = lines[i];
      }
  }

  if (current.destination) travelInfo.push(current);

  return travelInfo;
}
async function searchBestDeparture(origem) {
  let browser;
  try {
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const url = 'https://www.google.com/travel/explore';

      await page.goto(url, { waitUntil: 'networkidle2' });

      // Localizar o elemento de entrada pelo valor 'Aracati'
      const inputSelector = 'input[type="text"][value="Aracati"]';
      await page.waitForSelector(inputSelector);

      // Clique no input para interagir com ele
      await page.click(inputSelector);

      // Simular CTRL+A para selecionar todo o texto
      await page.keyboard.down('Control');
      await page.keyboard.press('A'); // Pode precisar ser 'a' em sistemas macOS
      await page.keyboard.up('Control');

      // Digitar 'REC' para substituir o texto selecionado
      await page.keyboard.type(origem);
      await page.waitForTimeout(1000);

      await page.keyboard.press('Enter');

      // Aguardar a atualização dos resultados
      await page.waitForTimeout(3000);

      // Listar todo o conteúdo da <main> com classe 'Dy1Pdc rcycge'
      const content = await page.evaluate(() => {
          const mainDiv = document.querySelector('main.Dy1Pdc.rcycge');
          return mainDiv ? mainDiv.innerText : 'Nenhum conteúdo encontrado';
      });

      const travelData = parseTravelInfo(content);
      console.log(travelData);

  } catch (error) {
      console.error('Erro encontrado:', error);
  } finally {
      if (browser) {
          await browser.close();
      }
  }
}
  
module.exports = { getData, searchBestDeparture };



      // Extrai informações de