const router = new (require('restify-router')).Router();
const status = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const plainview_sdk = require('../../plainview_sdk/');
const registerPostReq = plainview_sdk.api.registerPost.registerPostReq;
const registerPostRes = plainview_sdk.api.registerPost.registerPostRes;

const User = require('../models/User');

router.post('/register', function(req, res, next){
	if (req.user) {
		var reply = new registerPostRes({ 'err': 'Already logged in' });	
		return res.json(status.BAD_REQUEST, reply);
	}
	var userPost = new registerPostReq(req.body);
	if (userPost.isValid() == false) { 
		var reply = new registerPostRes({ 'err': 'Invalid form' });	
		return res.json(status.BAD_REQUEST, reply);
	}
	User.findOne({'username': userPost.username})
	.then(function(foundUser){
		if (foundUser){
			var reply = new registerPostRes({ 'err': 'Username taken. Please try another one' });
			throw { thrown: true, reply: reply, status: status.UNPROCESSABLE_ENTITY }
		}
		return bcrypt.genSalt(10);
	}).then(function(salt){
		return bcrypt.hash(userPost.password, salt)
	}).then(function(hash){
		userPost.password = hash;
		var newUser = new User({
			username: userPost.username,
			password: userPost.password
		});
		return newUser.save();
	}).then(function(savedUser){
		var token = jwt.sign({ username: userPost.username }, process.env.JWT_KEY, {
			expiresIn: '100d' 
		});
		var reply = new registerPostRes({ 'msg': 'User created', 'token': token });
		return res.json(status.CREATED, reply);
	}).catch(function(err){
		if (err.thrown) {
			return res.json(err.status, err.reply);
		}
		console.log(err)
		var reply = new registerPostRes({ 'msg': 'Internal server error. Please try again later' });
		return res.json(status.INTERNAL_SERVER_ERROR, reply);
	});
});

module.exports = router;