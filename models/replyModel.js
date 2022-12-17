const mongoose = require("mongoose");
const User = require('./userModel')

// mongoose.connect('mongodb://localhost:27017/angularJs')
// mongoose.connect('mongodb+srv://BhupendraMaithele:Pankaj12@cluster0.wlwdnfk.mongodb.net/?retryWrites=true&w=majority')

const url = `mongodb+srv://Pankaj_Maihtele:Pankaj12@cluster0.xfxnakk.mongodb.net/?retryWrites=true&w=majority`;



mongoose.connect(url)
  .then( () => {
      console.log('Connected to the database ')
  })
  .catch( (err) => {
      console.error(`Error connecting to the database. ${err}`);
  })



const Schema = mongoose.Schema;
const commentSchema = new Schema({
  
  post_id: { type: String, required: true},
  comment_id: { type: String, required: true},
  commentedBy_id: { type: String, required: true},
  reply: { type: String, default: ''},
  date: { type: Date, default: Date.now},
  replyBy : {
    type: mongoose.Schema.Types.ObjectId,
    ref: User},
  
})




module.exports = mongoose.model('comment', commentSchema);