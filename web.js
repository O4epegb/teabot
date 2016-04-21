'use strict';

const Hapi = require('hapi');

const port = process.env.PORT || 3000

const server = new Hapi.Server();
server.connection({port: port});

server.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }
    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            file: './public/index.html'
        }
    });
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Web server started at:', server.info.uri);
});

module.exports = (bot) => {
    server.route({
        method: 'POST',
        path: '/' + bot.token,
        handler: (request, reply) => {
            bot.processUpdate(request.payload);
            return reply('ok');
        }
    });
};
