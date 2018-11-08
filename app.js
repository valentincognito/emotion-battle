//packages
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

//global constant
const port = 3003

//global variables


//server init
http.listen(port, "0.0.0.0", function(){
  console.log('listening on :', port)
})

//config
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})


io.on('connection', function (socket) {

})
