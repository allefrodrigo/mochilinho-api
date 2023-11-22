// main.js
const { getRoundTripData, getTripData, bestPrices } = require('./func/skyscanner'); // Ajuste o caminho do arquivo conforme necessário
const { getData, searchBestDeparture } = require('./func/googleflights'); // Ajuste o caminho do arquivo conforme necessário
const pais = 'BR'

//const origens = ['NAT', 'FOR', 'REC', 'CNF', 'GRU','GIG', 'SDU', 'JPA', 'BSB','BEL', 'CWB', 'MCZ'];
const origens = ['NAT', 'FOR','JPA','REC'  ]
//const origens = ['JPA']
//const destino = 'LPB';
const destinos = ['LPB', 'VVI', 'LIM']

async function buscarVoos() {
  for (const origem of origens) {
    console.log(`Buscando voos de ${origem} para ${destino}`);
    try {
      await getData(origem, destino);
    } catch (err) {
      console.error(err);
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

//buscarVoos()
buscarVoosMultiple();
//searchBestDeparture()