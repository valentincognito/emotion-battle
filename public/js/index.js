//globals
let socket = io()

//generate random room name
if (!location.hash) {
  location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16)
}
const roomHash = location.hash.substring(1)
const webcam = new Webcam(document.getElementById('webcam'))
let emotions = ["angry" ,"disgust","scared", "happy", "sad", "surprised", "neutral"]
let model


//socket events
socket.on('start rtc', function(isOfferer){ startWebRTC(isOfferer) })
socket.on('respond offer', function(message){ respondOffer(message)})
socket.on('add candidate', function(message){ addCandidate(message) })
//TODO improve the player disconnection
socket.on('player left', function(){ location.reload() })
socket.on('game start', function(){ startGame() })

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

    let count = 0
    for (pred of classId) {
      $('.emotion span').eq(count).html(Math.round(pred * 100))
      count++
    }

    predictedClass.dispose()

    await tf.nextFrame()
  }
}


function startGame(){
  //display emotion to mimic

  //get local emotion percentage

  //get romote emotion percentage

  //update gloabl score local and remote
}
