const program = require('commander');
const prompt = require('prompt');

const plainviewService = require('./plainviewService');
const settings = require('./settings');
const plainview_sdk = require('../plainview_sdk/');

const loginPostReq = plainview_sdk.api.loginPost.loginPostReq;
const registerPostReq = plainview_sdk.api.registerPost.registerPostReq;
const archivePostReq = plainview_sdk.api.archivePost.archivePostReq;
const archiveGetReq = plainview_sdk.api.archiveGet.archiveGetReq;
const archivePostRes = plainview_sdk.api.archivePost.archivePostRes;
const archiveGetRes = plainview_sdk.api.archiveGet.archiveGetRes;

const loginPostRes = plainview_sdk.api.loginPost.loginPostRes;
const registerPostRes = plainview_sdk.api.registerPost.registerPostRes;

var userSettings = new settings();

program
  .version('0.1.0')

program.on('--help', function(){
	console.log('Plainview CLI for interacting with the Plainview service')
	console.log('Examples:');
	console.log('  $ plainview user login');
	console.log('  $ plainview archive new --url http://cnn.com');
});

program
  .command('user [action]')
  .description('user interactions with the Plainview service')
  .action(function(action, options){
		var username = '';
		var password = '';
		var payload = {};
		if (action == 'login' || action == 'register') {
			prompt.start()
			prompt.get([
				{
					name: 'username',
					required: true
				}, {
					name: 'password',
					required: true,
					hidden: true
				}
			], function (err, result) {
					username = result.username;
					password = result.password;
					payload = {
						username: username,
						password: password
					}
					if (action == 'register') {
						var userPost = new registerPostReq(payload);
						if (userPost.isValid() == false) {
							return console.error('Invalid form');
						}
						var request = new plainviewService.post({
							payload: payload,
							route: 'register'
						});
						request.execute()
						.then(function(body){
							var reply = new loginPostRes(body);
							if (reply.err) {
								console.error(reply.err);
								process.exit(1);
							}
							userSettings.setToken(reply.token);
							console.log(reply.msg);
						}).catch(function(err){
							console.error(err);
							process.exit(1);
						});
					} else if (action == 'login') {
						var userPost = new loginPostReq(payload);
						if (userPost.isValid() == false) {
							return console.error('Invalid form');
						}
						var request = new plainviewService.post({
							payload: payload,
							route: 'login'
						});
						request.execute()
						.then(function(body){
							var reply = new loginPostRes(body);
							if (reply.err) {
								console.error(reply.err);
								process.exit(1);
							}
							userSettings.setToken(reply.token);
							console.log(reply.msg);
						}).catch(function(err){
							console.error(err);
							process.exit(1);
						});
					}			
			});
		} else if (action == 'logout') {
			userSettings.setToken('');
			console.log('Logged out')
		} else {
			console.warn('Command %s not supported', action);
		}
	});
 
program
  .command('archive [action]')
  .description('interactions with Plainview\'s archival service')
  .option("-u, --url <url>", "URL for Plainview to archive")
  .option("-i, --id <id>", "Id of a Plainview archive")
  .action(function(action, options){
		if (action == 'new') {
			if (!options.url){
				prompt.start()
				prompt.get([
					{
						name: 'url',
						required: true
					}
				], function (err, result) {
					var uri = result.url;
					var payload = {
						uri: uri
					};
					var archivePost = new archivePostReq(payload);
					if (!archivePost.isValid()) {
						return console.error('Invalid form');
					}
					var request = new plainviewService.post({
						payload: payload,
						route: 'archive'
					});
					request.execute()
					.then(function(body){
						var reply = new archivePostRes(body);
						// console.log(reply.archive)
						// var reply = new loginPostRes(body);
						// if (reply.err) {
						// 	console.error(reply.err);
						// 	process.exit(1);
						// }
						// userSettings.setToken(reply.token);
						// console.log(reply.msg);
					}).catch(function(err){
						console.error(err);
						process.exit(1);
					});
				});	
			}
		} else if (action == 'list') {

		} else if (action == 'get') {
			if (!options.id) {
				prompt.start()
				prompt.get([
					{
						name: 'slug',
						require: true,
					}
				], function(err, result){
					var slug = result.slug;
					var query = {
						slug: slug
					};
					var archiveGet = new archiveGetReq(query);
					if (!archiveGet.isValid()){
						return console.error('Invalid form');
					}
					var request = new plainviewService.get({
						query: query,
						route: '/archive'
					});
					request.execute()
					.then(function(body){
						var reply = new archiveGetRes(body);
						console.log(reply.archive);
					});
				})
			}
		} else {
			console.error('Command %s not supported', action);
		}
  }).on('--help', function() {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ deploy exec sequential');
    console.log('  $ deploy exec async');
	});
	
	program
  .command('settings [action]')
  .description('modify or view settings for interacting with Plainview service')
  .action(function(action, options){
		if (action == 'view') {
			userSettings.view();
		} else if (action == 'edit') {
			userSettings.edit();
		} else {
			console.error('Command %s not supported', action);
		}
  }).on('--help', function() {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ deploy exec sequential');
    console.log('  $ deploy exec async');
  });


program.parse(process.argv);