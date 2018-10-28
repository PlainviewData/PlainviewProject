var validUrl = require('valid-url');

module.exports = {
	archiveGetReq: function (query) {
		this.uri = query.uri || '';
		this.slug = query.slug || '';
		this.isValid = function(){
			if (typeof this.retrievalValue != 'string'){
				return false;
			}
			if (this.retrievalField == 'uri'){
				return validUrl.isUri(this.uri);
			} else if (this.retrievalField == 'slug'){
				if (this.retrievalValue.length < 3 ){
					return false;
				}
				if (this.retrievalValue.lenght > 21){
					return false;
				}
				var containsNumber = /\d/.test(this.retrievalValue);
				if (containsNumber){
					return false;
				}
				return true;
			}
		};
		this.retrievalField = this.slug ? 'slug' : 'uri';
		this.retrievalValue = this.slug ? this.slug : this.uri;
	},
	archiveGetRes: function (payload) {
		this.msg = payload.msg;
		this.err = payload.err;
		this.archive = payload.archive;
	}
}