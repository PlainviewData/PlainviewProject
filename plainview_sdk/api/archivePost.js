var validUrl = require('valid-url');

module.exports = {
	archivePostReq: function (payload) {
		this.uri = payload.uri || '';
		this.isValid = function(){
			return validUrl.isUri(this.uri);
		};
	},
	archivePostRes: function (payload) {
		this.msg = payload.msg;
		this.err = payload.err;
		this.archive = payload.archive;
	}
}