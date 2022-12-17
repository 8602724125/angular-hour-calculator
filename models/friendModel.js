const mongoose = require("mongoose");

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
const friendSchema = new Schema({
  friendList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
})


module.exports = mongoose.model('admin', friendSchema);