// main.js
const { getRoundTripData, getTripData, bestPrices } = require('./func/skyscanner'); // Ajuste o caminho do arquivo conforme necessário
const { getData, searchBestDeparture } = require('./func/googleflights'); // Ajuste o caminho do arquivo conforme necessário
const pais = 'BR'

const origens = ['LPB', 'VVI', 'LIM']
//const origens = ['NAT', 'FOR', 'REC', 'CNF', 'GRU','GIG', 'SDU', 'JPA', 'BSB','BEL', 'CWB', 'MCZ', 'SSA', 'PVH'];
const destino = 'CNF';

async function buscarVoos() {
  for (const origem of origens) {
    console.log(`Buscando voos de ${origem} para ${destino}`);
    try {
      const flightDetails = await getData(origem, destino);

      // Certifique-se de que flightDetails contém itens
      if (flightDetails.length === 0) {
        console.log(`Nenhum detalhe do voo encontrado de ${origem} para ${destino}.`);
        continue; // Vá para a próxima iteração do loop
      }

      // Encontrar o preço mais baixo entre os voos
      const prices = flightDetails.map(flight => flight.price);
      const lowestPrice = Math.min(...prices);

      // Verifique se o menor preço é um número válido
      if (!isFinite(lowestPrice)) {
        console.log(`Não foi possível determinar o preço mais baixo de ${origem} para ${destino}.`);
        continue;
      }

      // Filtrar todos os voos com o preço mais baixo
      const cheapestFlights = flightDetails.filter(flight => flight.price === lowestPrice);

      // Adicionar colunas de origem e destino a cada objeto de voo
      const flightsWithOriginAndDestination = cheapestFlights.map(flight => ({
        origem,
        destino,
        ...flight
      }));

      console.log(`Melhores voos de ${origem} para ${destino}:`);
      console.table(flightsWithOriginAndDestination); // Exibe uma tabela para cada voo

    } catch (err) {
      console.error(`Erro ao buscar voos de ${origem} para ${destino}:`, err);
    }
  }
}



async function buscarVoosMultiple() {
  for (const origem of origens) {
    for (const destino of destinos) {
      console.log(`Buscando voos de ${origem} para ${destino}`);
      try {
        await getData(origem, destino);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function buscarBestMultiple(){
  for (const origem of origens) {
    console.log(`Buscando voos de ${origem} para ${destino}`);
    try {
      await getData(origem, destino);
    } catch (err) {
      console.error(err);
    }
  }
}

async function buscarMelhorMultiple(){
  for (const origem of origens) {
    console.log(`Buscando voos de ${origem}`);
    try {
      await searchBestDeparture(origem);
    } catch (err) {
      console.error(err);
    }
  }

}


buscarVoos()
//buscarVoosMultiple();
//buscarMelhorMultiple()