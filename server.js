// main.js
const { getRoundTripData, buildUrl } = require('./func/scrapper'); // Ajuste o caminho do arquivo conforme necessário

const origem = 'NAT';
const destino = 'VVI';
const dataIda = '240109';
const dataVolta = '240122';

const url = buildUrl(origem, destino, dataIda, dataVolta);

getRoundTripData(url).catch(err => console.error(err));
