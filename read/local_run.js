process.env.TABLE_NAME = "QRGoTransfer";
process.env.IS_LOCAL_RUN = "true";

const payload = require('./payload');
const handler = require("./src/index").handler;

async function main() {
	console.log(`Running with: ${JSON.stringify(payload)}`);
	const result = await handler(payload, {});
	console.log(result);
}
main();