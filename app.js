const restify = require('restify');

const server = restify.createServer({
    name: 'plainview_auth',
    version: '0.0.1'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/', function(req, res, next){ 
    
});

server.listen(process.env.PLAINVIEW_AUTH_PORT, function() {
    console.log('%s listening on port %s', server.name, process.env.PLAINVIEW_AUTH_PORT)
})