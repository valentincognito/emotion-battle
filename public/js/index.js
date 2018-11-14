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
socket.on('room ready', function(){ nextEmotion() })
socket.on('next level', function(){ displayStep02() })

//on click events
$('.bu-ready').click(function(){
  socket.emit('player ready')
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

    // let count = 0
    // for (pred of predictions) {
    //   $('.emotion span').eq(count).html(Math.round(pred * 100))
    //   count++
    // }

    let index = emotions.indexOf(g_emotionsList[g_emotionIndex])
    $('.current-emotion-level').html( Math.round(predictions[index] * 100) )

    predictedClass.dispose()

    await tf.nextFrame()
  }
}

let g_emotionsList = ["happy","sad","angry","scared","disgust"]
let g_emotionIndex = 0

let g_emotionLabel = $('.current-emotion .label')

let countdown = {
  interval: null,
  duration : 5,
  Start : function() {
    var timer = this.duration, minutes, seconds
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

    socket.emit('player ready')
    g_emotionIndex++
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

function nextEmotion(){
  //display emotion label
  g_emotionLabel.html( g_emotionsList[g_emotionIndex] )


  //start the timer
  countdown.Start()



  //update gloabl score local and remote


}
