const request = require('request');
const settings = require('./settings');
const urljoin = require('url-join');

module.exports = {
	post: function(options) {
		this.route = options.route;
		this.payload = options.payload;
		this.settings = new settings();
		this.settings.load();
		this.payload.token = this.settings.loadedSettings.token;
		this.execute = function(){
			var self = this;
			return new Promise(function(resolve, reject){
				const url = urljoin(self.settings.loadedSettings.plainview_url, self.route);
				request.post({url: url, form: self.payload}, function(err, httpResponse, body){
					if (err) {
						reject(err);
					}
					resolve(JSON.parse(body));
				});
			});
		}
	},
	get: function(options) {
		this.route = options.route;
		this.query = options.query;
		this.settings = new settings();
		this.settings.load();
		this.execute = function(){
			var self = this;
			return new Promise(function(resolve, reject){
				const url = urljoin(self.settings.loadedSettings.plainview_url, self.route);
				request.get({url: url, qs: self.query}, function(err, httpResponse, body){
					if (err) {
						reject(err);
					}
					resolve(JSON.parse(body));
				});
			});
		}
	}
}