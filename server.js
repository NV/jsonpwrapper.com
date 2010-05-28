var sys = require('sys'),
	http = require('http'),
	fs = require('fs'),
	URL = require('url');

require.paths.unshift('vendor');
require('express');
require('express/plugins');

configure(function(){
	set('root', __dirname);
	use(Static);
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

get('/', function() {
	var request = this;
	if (request.params.get.urls || request.params.get.url) {
		var callbackParam = request.params.get.callback || 'console.log';
		if (request.params.get.urls) {
			fetchMany(request.params.get.urls, function fetchManyHandler(bodies){
				var hashes = [];
				for (var i=0; i<bodies.length; i++) {
					hashes.push({body: bodies[i]});
				}
				request.respond(200, callbackParam +'('+ JSON.stringify(hashes) +')');
			});
		} else {
			fetch(request.params.get.url, function fetchHandler(data) {
				request.respond(200, callbackParam +'({"body":'+ JSON.stringify(data) +'})');
			});
		}
	} else {
		this.sendfile('public/index.html');
	}
});

get('/*', function(path) {
	this.sendfile('public/'+path);
});


run(parseInt(process.env.PORT || 8000), null);
