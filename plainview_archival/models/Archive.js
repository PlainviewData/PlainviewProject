const mongoose = require('mongoose');
const URL = require('url-parse');
const rword = require('rword');
const moment = require('moment');

const archiveSchema = new mongoose.Schema({
	uri: {
		type: String,
		require: true,
		unique: true
	},
	warcs: [{
		id: {
			type:	String,
			require: true,
			unique: true
		},
		created: {
			type: Date,
			require: true,
			default: function() {
				return moment();
			}
		},
		slug: {
			type: String,
			require: true,
			default: function() {
				return rword.generate(3, { length: '1-7', capitalize: 'first' }).join('')
			},
			unique: true
		},
		times_accessed: {
			type: Number,
			require: true,
			default: 0
		}
	}],
	last_updated: {
		type: Date, 
		require: true,
		default: function() {
			return moment();
		}
	},
	times_accessed: {
		type: Number,
		require: true,
		default: 0
	}
});

archiveSchema.statics.findByURI = function(uri){
	return new Promise(function(resolve, reject){
		archiveSchema.find({'uri':uri})
		.then(function(foundArchive){
			resolve(foundArchive);
		})
		.catch(function(err){
			reject();
		});
	});
};

archiveSchema.statics.findByWarcSlug = function(slug){
	return new Promise(function(resolve, reject){
		Archive.findOne({'warcs.slug': slug}, {'times_accessed': true, 'warcs.$': 1})
		.then(function(foundWarc){
			resolve(foundWarc);
		})
		.catch(function(err){
			reject(err);
		})
	});
}

archiveSchema.statics.minMinutesBeforeReArchive = 1;

archiveSchema.statics.normalizeURI = function(uri){
	const schemes = ['http:', 'https:'];

	var url = new URL(uri);
	if (schemes.indexOf(url.protocol) == -1){
		return '';
	}
	if (url.hostname == ''){
		return ''
	}

	//Disregard difference between http and https when normalizing (Might need to reconsider)
	url.set('protocol', ''); 

	//Keep double slashes
	url.set('slashes', false);

	//Remove trailing slashes at the end
	while (url.pathname.endsWith('/')){ 
		url.set('pathname', url.pathname.slice(0, -1));
	}

	//Normalize each part of the URL path
	var normalizedSegments = [];
	var pathSegments = url.pathname.split('/');
	pathSegments.forEach(function(segment){
		if (segment == ''){
			return;
		}
		normalizedSegments.push(encodeURIComponent(segment))
	});
	url.set('pathname', normalizedSegments.join('/'));

	//Don't store www. if it is included
	if (url.hostname.startsWith('www.')){ 
		url.set('hostname', url.hostname.substr(4));
	}

	//Don't keep the query (Might need to reconsider there)
	url.set('query', ''); 

	return url.toString();
};

var Archive = mongoose.model('Archive', archiveSchema);

module.exports = Archive;
