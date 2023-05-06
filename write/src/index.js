'use strict';

const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const config = process.env.IS_LOCAL_RUN ? {
	endpoint: "http://localstack:4566",
	region: "us-east-2"
} : undefined;
const documentClient = DynamoDBDocument.from(new DynamoDB(config));

function isUUID(str) {
	const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
	return regexExp.test(str);
}

const getOneMinuteFromNow = () => Math.floor((Date.now() + 60000) / 1000);

exports.handler = function(event){

	if(!event) return;
	if(!isUUID(event.UUID)) return;

	var params = {
		Item : {
			"UUID" : event.UUID,
			// TODO: Harden these. Lack of input verification is concerning...
			"V" : event.V,
			"Data" : event.Data,
			"ttl" : getOneMinuteFromNow()
		},
		TableName : process.env.TABLE_NAME
	};

	documentClient.put(params, function(err, data){
		console.log("Put callback")
		console.log(JSON.stringify(err));
		console.log(JSON.stringify(data));
	});
}