// main.js
const { getRoundTripData, getTripData } = require('./func/scrapper'); // Ajuste o caminho do arquivo conforme necessário

const origem = 'NAT';
const destino = 'VVI';
const dataIda = '240109';
const dataVolta = '240122';

//getRoundTripData(origem, destino, dataIda, dataVolta).catch(err => console.error(err));
getTripData(origem, destino, dataIda).catch(err => console.error(err));