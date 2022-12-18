const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const port = process.env.PORT || 5000;
app.use(cors());


app.use(express.static(path.join(__dirname, 'hours-frontend')));

app.get('/', (req, res) => {
    console.log('__dirname', path.join(__dirname));
    res.sendFile(path.join(__dirname, 'hours-frontend', 'index.html'))
})

app.use('/images', express.static('images'));

app.use('/static', express.static(path.join(__dirname + '/../' + 'static')))


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', require("./routes/router"))
app.use('/user', require("./routes/user"))
app.use('/admin', require("./routes/admin"))



app.listen(port, () => {
  console.log(`Go to the server ${port}`)
})