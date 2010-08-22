var sys = require('sys');
var http = require('http');
var fs = require('fs');
var URL = require('url');

require.paths.unshift('vendor');

var express = require('express');
var app = express.createServer();

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyDecoder());
	app.use(app.router);
	app.use(express.staticProvider(__dirname + '/public'));
	app.use(express.errorHandler({dumpExceptions:true, showStack:true}));
});

function fetch(uri, callback) {
	if (uri.indexOf('http') !== 0) {
		uri = 'http://' + uri;
	}
	var url = URL.parse(uri, true);
	var client = http.createClient(80, url.host);
	var request = client.request('GET', url.pathname, {'host': url.host});
	request.addListener('response', function responseHandler(response) {
		var result = '';
		response.setEncoding('utf8');
		response.addListener('data', function dataHandler(chunk) {
			result += chunk;
		});
		response.addListener('end', function endHandler() {
			callback(result);
		});
	});
	request.end();
}

function fetchMany(uris, callback) {
	var bodies = [];
	for (var i=0; i<uris.length; i++) {
		fetch(uris[i], function fetchHandler(data){
			bodies.push(data);
			if (bodies.length === uris.length) {
				callback(bodies);
			}
		});
	}
}

app.get('/', function(request, response) {
	var urls = request.query.urls;
	var url = request.query.url;
	if (urls || url) {
		var callbackParam = request.query.callback || 'console.log';
		if (urls) {
			fetchMany(urls, function fetchManyHandler(bodies){
				var hashes = [];
				for (var i=0; i<bodies.length; i++) {
					hashes.push({body: bodies[i]});
				}
				response.contentType(".js");
				response.send(callbackParam +'('+ JSON.stringify(hashes) +')');
			});
		} else {
			fetch(url, function fetchHandler(data) {
				response.send(callbackParam +'({"body":'+ JSON.stringify(data) +'})');
				response.contentType(".js");
			});
		}
	} else {
		response.sendfile('public/index.html');
	}
});

app.get('/*', function(request, response) {
	response.sendfile('public/' + request.url);
});

app.listen(parseInt(process.env.PORT || 8000));
