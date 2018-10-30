const router = new (require('restify-router')).Router();
const status = require('http-status');
const moment = require('moment');

const plainview_sdk = require('../../plainview_sdk');
const handleServerError = require('../utils').handleServerError;
const archivePostReq = plainview_sdk.api.archivePost.archivePostReq;
const archivePostRes = plainview_sdk.api.archivePost.archivePostRes;
const archiveGetReq = plainview_sdk.api.archiveGet.archiveGetReq;
const archiveGetRes = plainview_sdk.api.archiveGet.archiveGetRes;

const Archive = require('../models/Archive');

router.post('/archive', function(req, res, next){
	var archivePost = new archivePostReq(req.body);
	if (archivePost.isValid() == false) { 
		var reply = new archivePostRes({ 'err': 'Invalid form' });	
		throw { thrown: true, reply: reply, status: status.BAD_REQUEST }
	}
	var normalizedURI = Archive.normalizeURI(archivePost.uri);
	if (normalizedURI == ''){
		var reply = new archivePostRes({ 'err': 'Invalid form' });	
		throw { thrown: true, reply: reply, status: status.BAD_REQUEST }
	}
	archivePost.uri = normalizedURI;
	Archive.findOne({'uri': normalizedURI})
	.then(function(foundArchive){
		if (foundArchive){
			var now = moment();
			var minutesSinceLastUpdated = now.diff(foundArchive.last_updated, 'minutes');
			if (minutesSinceLastUpdated < Archive.minMinutesBeforeRearchive) {
				var reply = new archivePostRes({ 'msg': 'Found archive from ' + minutesSinceLastUpdated + ' minutes ago', 'archive': foundArchive });
				throw { thrown: true, reply: reply, status: status.ACCEPTED }	
			}
			foundArchive.last_updated = now;
			foundArchive.warcs.push({
				id: 'a'
			});
			return foundArchive.save();
		}
		var newArchive = new Archive({
			uri: archivePost.uri
		});
		newArchive.warcs.push({
			id: 'a'
		});
		return newArchive.save();
	}).then(function(savedArchive){
		var reply = new archivePostRes({ 'msg': 'Archive created', 'archive': savedArchive });
		return res.json(status.CREATED, reply);
	})
	.catch(function(err){
		if (err.thrown) {
			return res.json(err.status, err.reply);
		}
		handleServerError(req, res);
	});
});

router.get('/archive', function(req, res, next){
	var archiveGet = new archiveGetReq(req.query);
	if (archiveGet.isValid() == false) { 
		var reply = new archiveGetRes({ 'err': 'Invalid form' });	
		throw { thrown: true, reply: reply, status: status.BAD_REQUEST }
	}
	if (archiveGet.retrievalField() == archiveGet.URI){
		var normalizedURI = Archive.normalizeURI(archiveGet.uri);
		Archive.findByURI(normalizedURI)
		.then(function(foundArchive){
			if (!foundArchive) {
				var reply = new archiveGetRes({ 'msg': 'Archive not found' });
				throw { thrown: true, reply: reply, status: status.NOT_FOUND }	
			}
			foundArchive.times_accessed += 1;
			foundArchive.save();
			var reply = new archiveGetRes({ 'msg': 'Archive found', 'archive': foundArchive });
			return res.json(status.ACCEPTED, reply);	
		})
		.catch(function(err){
			if (err.thrown) {
				return res.json(err.status, err.reply);
			}
			req.err = err;
			handleServerError(req, res);
		});
	} else if (archiveGet.retrievalField() == archiveGet.SLUG) {
		Archive.findByWarcSlug(archiveGet.slug)
		.then(function(foundArchive){
			if (!foundArchive) {
				var reply = new archiveGetRes({ 'msg': 'Archive not found' });
				throw { thrown: true, reply: reply, status: status.NOT_FOUND }	
			}
			foundArchive.times_accessed += 1;
			foundArchive.warcs[0].times_accessed += 1;
			
			var reply = new archiveGetRes({ 'msg': 'Archive found', 'archive': foundArchive });
			res.json(status.ACCEPTED, reply);	
			
			Archive.findOneAndUpdate({'_id': foundArchive.id}, foundArchive, function(err, updatedArchive){
				if (err) {
					console.log('GET archive: findOneAndUpdate err', err);
				}
			});
		})
		.catch(function(err){
			if (err.thrown) {
				return res.json(err.status, err.reply);
			}
			req.err = err;
			handleServerError(req, res);
		});
	} else if (archiveGet.retrievalField() == archiveGet.URI_DATE) {
		var normalizedURI = Archive.normalizeURI(archiveGet.uri);
		Archive.findByURIAndDate(normalizedURI, archiveGet.date_created)
		.then(function(foundArchive){
			res.json(foundArchive)
		})
	}
});

module.exports = router;