// scraper.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function getRoundTripData(url) {
    const browser = await puppeteer.launch({
      headless: false, // Abre o navegador em modo não headless para interação manual
    });
  
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
  

function buildUrl(origem, destino, dataIda, dataVolta) {
    return `https://www.skyscanner.com.br/transporte/passagens-aereas/${origem}/${destino}/${dataIda}/${dataVolta}?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=0`;
}

module.exports = { getRoundTripData, buildUrl };
