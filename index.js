const fs = require("fs");
const async = require("async");
const parse = require('csv-parse');
const Api = require('./api');

let websites = [];

const done = function(err, result) {};

console.log('Starting ... ');

/**
 * Clear file before start
 */
fs.truncate("result.csv", 0, function(){ /** Done truncating file */ });

/**
 * Read domains and save to result.csv
 */
fs.readFile('domains.csv', 'utf8', function(err, data) {
  parse(data, {}, function(err, output) {
    output.map(item => websites.push(item[0]));

    async.mapSeries(websites, Api.batchProcess, done);
  });
});


