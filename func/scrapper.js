// scraper.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function getRoundTripData(origem, destino, dataIda, dataVolta) {
    const browser = await puppeteer.launch({
      headless: false, // Abre o navegador em modo não headless para interação manual
    });
  
    const url = `https://www.skyscanner.com.br/transporte/passagens-aereas/${origem}/${destino}/${dataIda}/${dataVolta}?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=0`;

    const page = await browser.newPage();
  
    // Navega para a URL desejada
    await page.goto(url, { waitUntil: 'networkidle2' });
  
    // Espera que pelo menos um elemento com a classe desejada esteja presente
    await page.waitForSelector("div[class^='FlightsTicket_container']", { visible: true });
  
    // Captura as informações específicas dentro das divs FlightsTicket_container
    const flightInfo = await page.evaluate(() => {
      const tickets = Array.from(document.querySelectorAll("div[class^='FlightsTicket_container']"));
  
      return tickets.map(ticket => {
        // Extrai informações de partida
        const departSpans = ticket.querySelectorAll("div[class^='LegInfo_routePartialDepart'] span");
        const departTime = departSpans[0]?.querySelector('div span')?.textContent.trim() || '';
        // Usa o seletor correto para o código do aeroporto
        const departDiv = ticket.querySelector("div[class^='LegInfo_routePartialDepart'] div[aria-label]");
  
        const departCode = departDiv?.getAttribute('aria-label') || '';
  
        // Extrai informações de chegada
        const arriveSpans = ticket.querySelectorAll("div[class^='LegInfo_routePartialArrive'] span");
        const arriveTime = arriveSpans[0]?.querySelector('div span')?.textContent.trim() || '';
        // Usa o seletor correto para o código do aeroporto
        const arriveDiv = ticket.querySelector("div[class^='LegInfo_routePartialArrive'] div[aria-label]");
  
        const arriveCode = arriveDiv?.getAttribute('aria-label') || '';
        // Extrai informações de paradas
        const stops = ticket.querySelector("div[class^='LegInfo_stopsLabelContainer']")?.textContent.trim() || '';
        const price = ticket.querySelector("div[class^='Price_mainPriceContainer'] span")?.textContent.trim() || '';
  
        return { departTime, departCode, stops, arriveTime, arriveCode, price };
      });
    });
  
    console.log('Informações extraídas:', flightInfo);
  
    // Fechar o navegador após a interação
    await browser.close();
}

async function getTripData(origem, destino, dataIda) {
  const browser = await puppeteer.launch({
    headless: false, // Abre o navegador em modo não headless para interação manual
  });

  const url = `https://www.skyscanner.com.br/transporte/passagens-aereas/${origem}/${destino}/${dataIda}?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=0`;

  const page = await browser.newPage();

  // Navega para a URL desejada
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Espera que pelo menos um elemento com a classe desejada esteja presente
  await page.waitForSelector("div[class^='FlightsTicket_container']", { visible: true });

  // Captura as informações específicas dentro das divs FlightsTicket_container
  const flightInfo = await page.evaluate(() => {
    const tickets = Array.from(document.querySelectorAll("div[class^='FlightsTicket_container']"));

    return tickets.map(ticket => {
      // Extrai informações de partida
      const departSpans = ticket.querySelectorAll("div[class^='LegInfo_routePartialDepart'] span");
      const departTime = departSpans[0]?.querySelector('div span')?.textContent.trim() || '';
      // Usa o seletor correto para o código do aeroporto
      const departDiv = ticket.querySelector("div[class^='LegInfo_routePartialDepart'] div[aria-label]");

      const departCode = departDiv?.getAttribute('aria-label') || '';

      // Extrai informações de chegada
      const arriveSpans = ticket.querySelectorAll("div[class^='LegInfo_routePartialArrive'] span");
      const arriveTime = arriveSpans[0]?.querySelector('div span')?.textContent.trim() || '';
      // Usa o seletor correto para o código do aeroporto
      const arriveDiv = ticket.querySelector("div[class^='LegInfo_routePartialArrive'] div[aria-label]");

      const arriveCode = arriveDiv?.getAttribute('aria-label') || '';
      // Extrai informações de paradas
      const stops = ticket.querySelector("div[class^='LegInfo_stopsLabelContainer']")?.textContent.trim() || '';
      const price = ticket.querySelector("div[class^='Price_mainPriceContainer'] span")?.textContent.trim() || '';

      return { departTime, departCode, stops, arriveTime, arriveCode, price };
    });
  });

  console.log('Informações extraídas:', flightInfo);

  // Fechar o navegador após a interação
  await browser.close();
}

async function bestPrices(origem, dataIda, pais) {
  const browser = await puppeteer.launch({
    headless: false, // Abre o navegador em modo não headless para interação manual
  });

  const url = `https://www.skyscanner.com.br/transporte/passagens-aereas/${origem}/${pais}/${dataIda}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=0&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`
  const page = await browser.newPage();

  // Navega para a URL desejada
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(5000);

  // Aguarda a div CombinedResultsPlaces_container ser carregada
  await page.waitForSelector("div[class*='CombinedResultsPlaces_container']", { visible: true });

  // Captura as informações específicas das divs BpkCard_bpk-card e ResultList_placeCard
  const placeCardsContent = await page.evaluate(() => {
    // Seleciona a div CombinedResultsPlaces_container
    const combinedResultsContainer = document.querySelector("div[class*='CombinedResultsPlaces_container']");

    // Dentro dessa div, seleciona todas as divs com a classe ResultList_placeCard
    const placeCards = Array.from(combinedResultsContainer.querySelectorAll("div[class*='BpkCard_bpk-card'][class*='ResultList_placeCard']"));

    // Mapeia cada div para extrair as informações necessárias
    return placeCards.map(card => {
      const linkElement = card.querySelector('a');
      const imageElement = card.querySelector('div[class*="BpkBackgroundImage_bpk-background-image"] div[class*="BpkBackgroundImage_bpk-background-image__img"]');
      const descriptionElement = card.querySelector('div[class*="PlaceCard_descriptionContainer"]');

      // Extrai o URL da imagem de estilo inline
      const imageStyle = imageElement.style.backgroundImage;
      const imageUrlMatch = imageStyle.match(/url\("(.+?)"\)/);
      const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

      // Extrai os textos
      const texts = Array.from(descriptionElement.querySelectorAll('span[class*="BpkText_bpk-text"]')).map(span => span.textContent);

      return {
       // link: linkElement ? linkElement.href : '',
       // imageUrl: imageUrl,
        oportunidade: texts
      };
    });
  });

  console.log('Conteúdo das place cards:', placeCardsContent);

  // Fechar o navegador após a interação
  await browser.close();
}






module.exports = { getRoundTripData, getTripData, bestPrices };
