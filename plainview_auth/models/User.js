const mongoose = require('mongoose');
const shortid = require('shortid');

const userSchema = new mongoose.Schema({
  username: {
		type: String, 
		required: true,
		unique: true,
		index: true
	},
  password: {
		type: String, 
		required: true
	},
	display_name: {
		type: String
	},
  email: {
		type: String
	},
  created: {
		type: Date, 
		required: true,
		default: Date.now
	},
	numLogins: {
		type: Number,
		default: 0
	},
	numLogouts: {
		type: Number,
		default: 0
	},
	ipAddresses: [{
		type: String
	}]
});

module.exports = mongoose.model('User', userSchema);
