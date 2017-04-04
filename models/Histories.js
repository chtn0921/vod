var mongoose = require('mongoose');

var HistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_history: []  
});

HistorySchema.methods.add_to_history = function(movie_id,cb) {
  this.user_history.push(movie_id);
  this.save(cb);
};

mongoose.model('History', HistorySchema);