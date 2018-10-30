var validUrl = require('valid-url');

module.exports = {
	archiveGetReq: function (query) {
		this.uri = query.uri || '';
		this.slug = query.slug || '';
		this.date_created = query.date_created || '';
		this.isValid = function(){
			var retrievalField = this.retrievalField();
			if (retrievalField == this.URI){
				return validUrl.isUri(this.uri);
			} else if (retrievalField == this.SLUG){
				if (this.slug.length < 3 ){
					return false;
				}
				if (this.slug.length > 21){
					return false;
				}
				var containsNumber = /\d/.test(this.retrievalValue);
				if (containsNumber){
					return false;
				}
				return true;
			} else {
				return true;
			}
		};
		this.SLUG = 'slug';
		this.URI_DATE = 'uri_date';
		this.URI = 'uri';
		this.retrievalField = function() {
			if (this.uri && this.date_created) {
				return this.URI_DATE;
			} else if (this.uri) {
				return this.URI;
			} else if (this.slug) {
				return this.SLUG;
			}
		};
	},
	archiveGetRes: function (payload) {
		this.msg = payload.msg;
		this.err = payload.err;
		this.archive = payload.archive;
	}
}