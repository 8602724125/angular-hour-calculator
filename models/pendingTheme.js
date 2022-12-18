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
const pendingThemeSchema = new Schema({
  status: { type: String, default: 'pending' },
  userID: { type: String, required: true },
  bg_Img: { type: String, default: '' },
  aheadImg: { type: String, default: '' },
  laggingImg: { type: String, default: '' },
  aheadText: { type: String, default: '' },
  laggingText: { type: String, default: '' },
  aheadEmojiCode: { type: String, default: '' },
  laggingEmojiCode: { type: String, default: '' },
  message: { type: String,  default: '' },
  date: { type: Date, default: Date.now }
})


module.exports = mongoose.model('pendingTheme', pendingThemeSchema);