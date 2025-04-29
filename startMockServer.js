// Import Pact & other dependencies
const pact = require("@pact-foundation/pact");
const Pact = pact.PactV3;
const path = require("path");

// Setup Pact
const provider = new Pact({
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  dir: path.resolve(process.cwd(), "pacts"),
  logLevel: "info",
  consumer: consumerName,
  provider: providerName,
});