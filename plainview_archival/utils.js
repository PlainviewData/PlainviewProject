const handleServerError = function(req, res){
	console.log(req.err)
	var reply = new archivePostRes({ 'msg': 'Internal server error. Please try again later' });
	return res.json(status.INTERNAL_SERVER_ERROR, reply);
};

module.exports = {
	handleServerError: handleServerError
}