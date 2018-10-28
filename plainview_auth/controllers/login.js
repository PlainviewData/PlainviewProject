const router = new (require('restify-router')).Router();
const bcrypt = require('bcryptjs');
const status = require('http-status');
const jwt = require('jsonwebtoken');

const plainview_sdk = require('../../plainview_sdk/');
const loginPostReq = plainview_sdk.api.loginPost.loginPostReq;
const loginPostRes = plainview_sdk.api.loginPost.loginPostRes;

const User = require('../models/User');

router.post('/login', function(req, res, next){
	if (req.user) {
		var reply = new loginPostRes({ 'err': 'Already logged in' });	
		return res.json(status.BAD_REQUEST, reply);
	}
	var userPost = new loginPostReq(req.body);
	if (userPost.isValid() == false) { 
		var reply = new loginPostRes({ 'err': 'Invalid form' });	
		return res.json(status.BAD_REQUEST, reply);
	}
	User.findOne({'username': userPost.username})
	.then(function(foundUser){
		if (!foundUser) {
			var reply = new loginPostRes({ 'msg': 'Username not found' });
			throw { thrown: true, status: status.NOT_FOUND, reply: reply };
		}
		return bcrypt.compare(userPost.password, foundUser.password);
	}).then(function(correctPassword){
		if (correctPassword == false){
			var reply = new loginPostRes({ 'msg': 'Password incorrect' });
			throw { thrown: true, status: status.BAD_REQUEST, reply: reply };
		}
		var token = jwt.sign({ username: userPost.username }, process.env.JWT_KEY, {
			expiresIn: '100d'  
		});
		var reply = new loginPostRes({ 'msg': 'Logged in', 'token': token });
		res.json(status.ACCEPTED, reply);
		User.updateOne({ 'username': userPost.username }, {
			$addToSet: {ipAddresses: req.connection.remoteAddress},
			$inc: { numLogins: 1 }
		});
		return;
	}).catch(function(err){
		if (err.thrown) {
			return res.json(err.status, err.reply);
		}
		console.log(err)
		var reply = new loginPostRes({ 'msg': 'Internal server error. Please try again later' });
		return res.json(status.INTERNAL_SERVER_ERROR, reply);
	});
});

module.exports = router;