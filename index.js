'use strict';

var AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

function isUUID(str) {
	const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
	return regexExp.test(str);
}

const getOneMinuteFromNow = () => Math.floor((Date.now() + 60000) / 1000);

exports.handler = async function(event){

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

	await documentClient.put(params, function(err, data){
		console.log(JSON.stringify(err));
		console.log(JSON.stringify(data));
	});
}