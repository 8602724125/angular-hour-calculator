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

  // reply: {
  //   commentedBy_id: { type: String, required: true},
  //   replyBy_id:{ type: String, required: true},
  //   reply_message: { type: String, default: ''},
  //   reply: {type: Array, default: []}
  // }

const Schema = mongoose.Schema;
const commentSchema = new Schema({
  
  post_id: { type: String, required: true},
  comment: { type: String, default: ''},
  date: { type: Date, default: Date.now},
  commentBy : {
    type: mongoose.Schema.Types.ObjectId,
    ref: User},
  reply: {type: Array, default: []}
  
})




module.exports = mongoose.model('comment', commentSchema);