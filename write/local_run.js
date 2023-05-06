process.env.TABLE_NAME = "QRGoTransfer";
process.env.IS_LOCAL_RUN = "true";

const payload = require('./payload');
const handler = require("./src/index").handler;

console.log(`Running with: ${JSON.stringify(payload)}`);

handler(payload, {}, (err, data) => {
	console.log("Done");
	console.log(err);
	console.log(data);
});
