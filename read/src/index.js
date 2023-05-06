'use strict';

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const config = process.env.IS_LOCAL_RUN ? {
	endpoint: "http://localstack:4566",
	region: "us-east-2"
} : undefined;

const client = new DynamoDBClient(config);

async function getStoredItem(UUID) {
	try {
		const command = new GetItemCommand({
			Key: {
				UUID: {
					S: UUID
				}
			},
			TableName: process.env.TABLE_NAME,
		});
		return await client.send(command);
	} catch(err) {
		console.error(err);
		return null;
	}
}

async function nullifyStoredItem(getResponse) {
	try {
		// A PUT and not a DELETE so we can track if the item was already read
		// I.e. detect if an attacker is trying to read the item at the same time
		const putCommand = new PutItemCommand({
			Item: {
				...getResponse.Item,
				Data: {
					NULL: true
				},
			},
			"ReturnConsumedCapacity": "NONE",
			"TableName": process.env.TABLE_NAME,
		});
		await client.send(putCommand);
	} catch(err) {
		console.error(err);
		return false;
	}

	return true;
}

exports.handler = async function(event){

	const getResponse = await getStoredItem(event.UUID);
	if(!getResponse || !getResponse.Item) {
		console.log("Item not found");
		return null;
	}

	const nullifySuccess = nullifyStoredItem(getResponse);
	if(!nullifySuccess) {
		return null;
	}

	return unmarshall(getResponse.Item);
}