// main.js
const { getRoundTripData, getTripData, bestPrices } = require('./func/scrapper'); // Ajuste o caminho do arquivo conforme necessário

const pais = 'BR'
const origem = 'REC';
const destino = 'MAO';
const dataIda = '240106';
const dataVolta = '240122';

//getRoundTripData(origem, destino, dataIda, dataVolta).catch(err => console.error(err));
//getTripData(origem, destino, dataIda).catch(err => console.error(err));
bestPrices(origem, dataIda, pais).catch(err => console.error(err));