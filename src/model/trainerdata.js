const mongoose = require("mongoose");
// mongoose.connect('mongodb://localhost:27017/tms',{ useUnifiedTopology: true,useNewUrlParser: true });
mongoose.connect('mongodb+srv://team3:team3@cluster0.6iuwn.mongodb.net/TrainerManagement?retryWrites=true&w=majority',{ useUnifiedTopology: true,useNewUrlParser: true });
const Schema = mongoose.Schema;
const TrainerSchema = new Schema({
  id:String,
  fname:String,
  lname: String,
  address: String,
  email: String,
  phno: String,
  qual:String,
  skill: String,
  comp: String,
  desgn: String,
  course: String,
  img: String,
  typeemp:String
});
var trainerdata = mongoose.model('trainerdata', TrainerSchema);
module.exports = trainerdata;