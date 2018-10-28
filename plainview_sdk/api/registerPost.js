module.exports = {
	registerPostReq: function (payload) {
		this.username = payload.username || '';
		this.password = payload.password || '';
		this.isValid = function() {
			if (typeof this.username != 'string' || this.username.length < 3) {
					return false;
			}
			if (typeof this.password != 'string' || this.password.length < 3) {
					return false;
			}
			return true;        
		};
	},
	registerPostRes: function (payload) {
		this.msg = payload.msg;
		this.err = payload.err;
		this.token = payload.token;
	}
}