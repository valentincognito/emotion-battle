//packages
const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
const io = require('socket.io')(https)

//global constant
const port = 3005
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}

//server init
https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})

//config
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})
