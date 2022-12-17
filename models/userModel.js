//import { friend } from './friendModel'
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
const userSchema = new Schema({
  status: { type: Boolean, default: false},
  isAuthor: { type: Boolean, default: false},
  bio: { type: String, default: "Hi, I am blogger user."},
  name: { type: String, required: true },
  email: { type: String, unique: true },
  mobile_no: { type: Number, default: 1234567890 },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  token: { type: String, default:"" },
  friends: { type: Array, default: []},
  pending_requests: { type: Array, default: []},
  send_requests: { type: Array, default: []},
  subscribes: { type: Array, default: []},
  subscribers: { type: Array, default: []}
  //isActive: { type: Boolean, default: false },
  //device_info: { type: Array, default: []}
})


module.exports = mongoose.model('user', userSchema);