const mongoose = require("mongoose");
const User = require('./userModel')

// mongoose.connect('mongodb://localhost:27017/angularJs')
// mongoose.connect('mongodb+srv://BhupendraMaithele:Pankaj12@cluster0.wlwdnfk.mongodb.net/?retryWrites=true&w=majority')

const url = `mongodb+srv://Pankaj_Maihtele:Pankaj12@cluster0.xfxnakk.mongodb.net/?retryWrites=true&w=majority`;

// const connectionParams={
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true 
// }


mongoose.connect(url)
  .then( () => {
      console.log('Connected to the database ')
  })
  .catch( (err) => {
      console.error(`Error connecting to the database. ${err}`);
  })



const Schema = mongoose.Schema;
const postSchema = new Schema({
  // subcription: { type: Boolean, default: false },
  // subcribers: { type: Number, default: 0},
  // author_id: { type: String, required: true},
  // author_name: { type: String, required: true},
  // author_email: { type: String, required: true},
  // visible: { type: String, required: true},
  title: { type: String, required: true},
  article: { type: String, default: ''},
  visibility : { type: String, required: true},
  date: { type: Date, default: Date.now},
  postedBy : {
    type: mongoose.Schema.Types.ObjectId,
    ref: User},
  // myUser: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: User
  // },
  likedBy: {type: Array, default: []},
  dislikedBy: {type: Array, default: []},
  views: { type: Number, default: 0},
  likes: { type: Number, default: 0},
  dislikes: { type: Number, default: 0}

  
  // posts: [{
  //   title: {type: String, required: true},
  //   article: {type: String, required: true}
  // }],
  //count: { type: Number, default: 0 },
  //date: { type: Date, default: Date.now },
  //subDate: { type: Date },
  //subEndDate: {type: Date }
})

// {
//   title: { type: String, required: true},
//   post: { type: String, default: ''},
//   view: { type: Number, default: 0 },
//   postDate: { type: Date, default: Date.now }
// }


module.exports = mongoose.model('post', postSchema);