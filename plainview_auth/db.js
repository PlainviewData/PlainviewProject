const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = {
  connect: function(server) {
    mongoose.connect(process.env.DATABASE_CONNECTION_STRING, { useNewUrlParser: true })
    .then(function(){
      console.log('%s connected to %s', server.name, process.env.DATABASE_CONNECTION_STRING)
    })
  }
};