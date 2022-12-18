
const mongoose = require("mongoose");

const url = `mongodb+srv://Pankaj_Maihtele:Pankaj12@cluster0.xfxnakk.mongodb.net/CIS?retryWrites=true&w=majority`;



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
  isAuthorised: { type: Boolean, default: true},
  bio: { type: String, default: "Hi, I am theme contributer."},
  name: { type: String, required: true },
  email: { type: String, unique: true },
  profile_photo: { type: String, default: "" },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  token: { type: String, default: "" },
  message: { type: String, default: ""}
})


module.exports = mongoose.model('user', userSchema);