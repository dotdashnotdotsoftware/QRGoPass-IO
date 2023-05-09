'use strict';

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const config = process.env.IS_LOCAL_RUN ? {
	endpoint: "http://localstack:4566",
	region: "us-east-2"
} : undefined;
const client = new DynamoDBClient(config);

function isUUID(str) {
	const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
	return regexExp.test(str);
}

const getOneMinuteFromNow = () => Math.floor((Date.now() + 60000) / 1000);

exports.handler = async function(event){

	if(!event) return;
	if(!isUUID(event.UUID)) return;

	try {
		const putCommand = new PutItemCommand({
			Item: marshall({
				"UUID" : event.UUID,
				// TODO: Harden these. Lack of input verification is concerning...
				"V" : event.V,
				"Data" : event.Data,
				"ttl" : getOneMinuteFromNow()
			}),
			"ReturnConsumedCapacity": "NONE",
			"TableName": process.env.TABLE_NAME,
		});
		await client.send(putCommand);
	} catch(err) {
		console.error(err);
		return;
	}
}