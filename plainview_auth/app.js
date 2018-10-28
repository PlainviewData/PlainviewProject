const restify = require('restify');
const router = new (require('restify-router')).Router();
const status = require('http-status');
const jwt = require('jsonwebtoken');

const db = require('./db');
const loginRouter = require('./controllers/login');
const registerRouter = require('./controllers/register');

const server = restify.createServer({
	name: 'plainview_auth',
	version: '0.0.1'
});

db.connect(server);

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.use(function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (!token) {
		return next();
	}
	jwt.verify(token, process.env.JWT_KEY, function(err, decoded) {
		if (decoded && decoded.username){
			req.user = {
				username:	decoded.username
			};
		}
		next();
	});
});

server.post('/validate', function (req, res, next) {
	if (req.user) {
		return res.send(status.ACCEPTED)
	}
	return res.send(status.UNAUTHORIZED);
});

loginRouter.applyRoutes(server)
registerRouter.applyRoutes(server)

server.listen(process.env.PLAINVIEW_AUTH_PORT, function() {
	console.log('%s listening on port %s', server.name, process.env.PLAINVIEW_AUTH_PORT)
});