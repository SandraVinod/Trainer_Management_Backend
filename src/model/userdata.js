const mongoose = require("mongoose");
// mongoose.connect('mongodb://localhost:27017/tms',{ useUnifiedTopology: true ,useNewUrlParser: true});
mongoose.connect('mongodb+srv://team3:team3@cluster0.6iuwn.mongodb.net/TrainerManagement?retryWrites=true&w=majority',{ useUnifiedTopology: true,useNewUrlParser: true });
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  useremail:String,
  username: String,
  password: String,
  role: String
});
var userdata = mongoose.model('userdata', UserSchema);
module.exports = userdata;
