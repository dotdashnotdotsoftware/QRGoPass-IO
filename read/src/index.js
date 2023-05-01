'use strict';

const AWS = require('aws-sdk');

exports.handler = function(event, context, callback){
	var params = {
		TableName : process.env.TABLE_NAME,
		Key: {'UUID': event.UUID }
	};

	var documentClient = new AWS.DynamoDB.DocumentClient();

	documentClient.get(params, function(err, data) {
	  if (err)
	  {
		console.log(err);
		callback(null, null);
	  }
	  else
	  {
		var item = data.Item;
		if("undefined" === typeof(item))
		{
			callback(null, null);
		}
		else
		{
			var toReturn = {};
			toReturn.UUID = item.UUID;
			toReturn.V = item.V;
			toReturn.Data = item.Data;

			var delete_params = {
				Item : {
					"UUID" : item.UUID,
					"V" : 0,
					"Data" : null,
					"ttl" : Math.floor((Date.now() + 60000) / 1000)
				},
				TableName : process.env.TABLE_NAME
			};
			documentClient.put(delete_params, function(err, data){
				callback(err, data);
			});

			callback(null, toReturn);
		}
	  }
	});
}