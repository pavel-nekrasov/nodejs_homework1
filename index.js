const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const homework1Server = (request, response) => {
    let parsedUrl = url.parse(request.url, true);
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let method = request.method.toLowerCase();
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    request.on('data', data => {
        buffer += decoder.write(data);
    });

    request.on('end', () => {
        buffer += decoder.end();

        let chosenHandler = route(method, trimmedPath);

        var data = {
            'payload': buffer
        };

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            let payloadString = JSON.stringify(payload);

            response.setHeader('Content-Type', 'application/json')
            response.writeHead(statusCode);
            response.end(payloadString);
        });
    });
}

const handlers={};

handlers.hello = (data, callback) => {
    callback(200, {message: 'You are welcome'});
}

handlers.notFound = (data, callback) => {
    callback(404);
}

const routes = {
    'hello': {
        'post': handlers.hello
    }
};

const route = (method, path) => {
    return typeof(routes[path]) !== 'undefined' && typeof(routes[path][method]) !== 'undefined'
        ? routes[path][method]
        : handlers.notFound;
}


const httpServer = http.createServer((request, response) => {
    homework1Server(request, response);
});

httpServer.listen(config.httpPort, () => {
    console.log('listening on port', config.httpPort, 'in', config.envName, 'mode')
});