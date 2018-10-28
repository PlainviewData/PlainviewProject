const restify = require('restify');
const router = new (require('restify-router')).Router();
const status = require('http-status');
const jwt = require('jsonwebtoken');

const db = require('./db');
const archivalRouter = require('./controllers/archival');

const server = restify.createServer({
	name: 'plainview_archival',
	version: '0.0.1'
});

db.connect(server);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

archivalRouter.applyRoutes(server)

server.listen(process.env.PLAINVIEW_ARCHIVAL_PORT, function() {
	console.log('%s listening on port %s', server.name, process.env.PLAINVIEW_ARCHIVAL_PORT)
});