'use strict';

const AWS = require('aws-sdk');
const config = process.env.IS_LOCAL_RUN ? {
	endpoint: "http://localstack:4566",
	region: "us-east-2"
} : undefined;
const documentClient = new AWS.DynamoDB.DocumentClient(config);

exports.handler = function(event, context, callback){
	const params = {
		TableName : process.env.TABLE_NAME,
		Key: {'UUID': event.UUID }
	};

	documentClient.get(params, function(err, data) {
		if (err)
		{
			console.log(err);
			callback(null, null);
			return;
		}

		if(!data || !data.Item) {
			console.log("Item not found");
			callback(null, null);
			return;
		}

		const item = data.Item;
		const toReturn = {
			UUID: item.UUID,
			V: item.V,
            Data: item.Data
		};

		// This really should be just a plain delete...
		const delete_params = {
			Item : {
				"UUID" : item.UUID,
				"V" : 0,
				"Data" : null,
				"ttl" : Math.floor((Date.now() + 60000) / 1000)
			},
			TableName : process.env.TABLE_NAME
		};
		documentClient.put(delete_params, function(err, data) {
			console.log("Put callback");
			console.log(JSON.stringify(err));
			console.log(JSON.stringify(data));
		});

		callback(null, toReturn);
	});
}