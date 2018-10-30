const handleServerError = function(req, res){
	console.log(req.err)
	// var reply = new archivePostRes({ 'msg': 'Internal server error. Please try again later' });
	return res.json(500, 'dasd');
};

module.exports = {
	handleServerError: handleServerError
}