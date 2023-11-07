// main.js
const { getRoundTripData, getTripData, bestPrices } = require('./func/skyscanner'); // Ajuste o caminho do arquivo conforme necessário
const { getData } = require('./func/googleflights'); // Ajuste o caminho do arquivo conforme necessário
const pais = 'BR'

const origens = ['NAT', 'FOR', 'REC', 'CNF', 'GRU', 'SSA', 'JPA', 'MCZ','BEL', 'CWB', 'GIG'];
const destino = 'RUH';

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

buscarVoos();