const https      = require("https");
const fsPromises = require("fs").promises;
const moment     = require("moment");
/**
 * TODO: Recieve this as an argument
 */
const resultFile = "result.csv";
const batchLimit = 5;

let domains = 0;

/**
 * Gets information about SSL certificate on a domain
 *
 * It appends a line to @param {resultFile} with:
 * * domain
 * * expires_at
 * * error
 *
 * @param {string} domain
 */
const crawl = function(domain) {
  const options = {
    port: 443,
    method: "GET",
    host: domain
  };

  const req = https.request(options, async function(res) {
    const certificate = res.connection.getPeerCertificate();
    const expiresAt = moment(new Date(certificate.valid_to));
    const formattedDate = expiresAt.format("YYYY-MM-DD");
    const line = [domain, formattedDate, null].join(",");
    await append(resultFile, line);
  });

  req.on("error", async function(e) {
    const line = [domain, null, e.toString()].join(",");
    await append(resultFile, line);
  });

  req.end();
};

/**
 * Async process in batch.
 *
 * @param {string} domain
 * @param {function} callback
 */
const batchProcess = function(domain, callback) {
  if (domains > batchLimit) {
    setTimeout(function() {
      domains++;
      callback(null, crawl(domain));
    }, 1000);
  } else {
    domains++;
    callback(null, crawl(domain));
  }
};

/**
 * Asynchronous append line to csv file
 *
 * @param {string} filename
 * @param {string} line
 */
const append = async function(file, line) {
  fsPromises.appendFile(file, line + "\n");
  console.log(line);
};

module.exports = {
  batchProcess
};
