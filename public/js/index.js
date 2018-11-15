//globals
let socket = io()

//generate random room name
if (!location.hash) {
  location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16)
}
const roomHash = location.hash.substring(1)
const webcam = new Webcam(document.getElementById('webcam'))
let emotions = ["angry","disgust","scared","happy","sad","surprised","neutral"]
let model


//socket events
socket.on('start rtc', function(isOfferer){ startWebRTC(isOfferer) })
socket.on('respond offer', function(message){ respondOffer(message)})
socket.on('add candidate', function(message){ addCandidate(message) })
//TODO improve the player disconnection
socket.on('player left', function(){ location.reload() })
socket.on('room ready', function(){ displayStep02() })
socket.on('next level', function(){ nextEmotion() })
socket.on('player score', function(score){ updateOpponentScore(score) })

//on click events
$('.bu-ready').click(function(){
  $(this).addClass('ready')
  socket.emit('player ready')
})

$('.bu-play-again').click(function(){
  location.reload()
})


init()

async function init() {
  try {
    await webcam.setup()
  } catch (e) {
    console.log(e)
  }

  model = await tf.loadModel('models/model.json')

  displayStep01()

  socket.emit('room join', roomHash)

  isPredicting = true
  predict()
}

async function predict() {
  while (isPredicting) {
    const predictedClass = tf.tidy(() => {
      //capture image from webcam
      const img = webcam.capture()
      //predict
      return model.predict(img)
      //return predictions.as1D().argMax()
    })

    const predictions = await predictedClass.data()

    if (g_isGameStarted) {
      let index = emotions.indexOf(g_emotionsList[g_emotionIndex])
      g_emotionLevel.css('width', Math.round(predictions[index] * 100))

      g_myScore = g_myScore + (predictions[index] * 0.2)
      g_myScoreLevel.css('width', g_myScore+'%')
      g_myScoreLabel.html(Math.round(g_myScore))

      //send score to server
      socket.emit('player score', g_myScore)
    }

    predictedClass.dispose()

    await tf.nextFrame()
  }
}

let g_emotionsList = ["happy","sad","angry","scared","disgust"]
let g_emotionIndex = 0
let g_myScore = 0
let g_isGameStarted = false

let g_emotionIcon = $('.current-emotion .icon')
let g_emotionLevel = $('.feed-info .jauge .level')
let g_myScoreLevel = $('.scores .me .level')
let g_myScoreLabel = $('.scores .me .label')
let g_oppScoreLevel = $('.scores .opponent .level')
let g_oppScoreLabel = $('.scores .opponent .label')

let countdown = {
  interval: null,
  duration : 5,
  Start : function() {
    g_isGameStarted = true

    let timer = this.duration, minutes, seconds
    this.interval = setInterval(function () {
      minutes = parseInt(timer / 60, 10)
      seconds = parseInt(timer % 60, 10)

      $('.timer .seconds').html(seconds)

      if (--timer < 0) countdown.Stop()

    }, 1000);
  },
  Stop: function(){
    clearInterval(this.interval)
    timer = this.duration
    g_isGameStarted = false

    g_emotionIndex++

    console.log('index', g_emotionIndex);

    if (g_emotionIndex <= g_emotionsList.length - 1) {
      socket.emit('player ready')
    }else{
      displayFinalScore()
    }
  }
}

function displayStep01(){
  $('.step-01').show()
  $('.step-01 .room-link .link').html(location.href)
}
function displayStep02(){
  $('.step-01').hide()
  $('.step-02').show()
}
function displayFinalScore(){
  let me = Number(g_myScoreLabel.html())
  let opponent = Number(g_oppScoreLabel.html())

  $('.timer').hide()
  $('.video-feed').addClass('timeout')
  $('.feed-info').hide()
  $('.current-emotion').hide()

  if (me >= opponent) { //I won
    $('.scores-result img').attr('src', '/images/win-message.png')
  }
  $('.scores-result').show()
}

function nextEmotion(){
  //display emotion icon
  g_emotionIcon.attr('src', '/images/emotion-'+g_emotionsList[g_emotionIndex]+'.png')

  //start the timer
  countdown.Start()

  //hide ready button and display timer
  $('.bu-ready').hide()
  $('.timer').show()
}

function updateOpponentScore(score){
  g_oppScoreLevel.css('width', score+'%')
  g_oppScoreLabel.html(Math.round(score))
}





//fix the zoom of the camera
navigator.mediaDevices.getUserMedia({video: true})
.then(async mediaStream => {
  document.querySelector('video').srcObject = mediaStream
  await sleep(1000)

  const track = mediaStream.getVideoTracks()[0]
  const capabilities = track.getCapabilities()
  const settings = track.getSettings()

  track.applyConstraints({advanced: [ {zoom: 2} ]})
}).catch(error => console.log(error))

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms))
}
