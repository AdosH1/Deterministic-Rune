//Load express module with `require` directive
var express = require('express')
const path = require('path');

var app = express()
//app.use(express.static('public'))

//Define request response in root URL (/)
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/helper.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'helper.js'));
})

//Launch listening server on port 8081
app.listen(8081, function () {
  console.log('app listening on port 8081!')
})