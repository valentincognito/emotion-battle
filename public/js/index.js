const webcam = new Webcam(document.getElementById('webcam'))
let emotions = ["angry" ,"disgust","scared", "happy", "sad", "surprised", "neutral"]
let model

init()

async function init() {
  try {
    await webcam.setup()
  } catch (e) {
    console.log(e)
  }

  model = await tf.loadModel('models/model.json')

  isPredicting = true
  predict()
}



async function predict() {
  //ui.isPredicting()
  while (isPredicting) {
    const predictedClass = tf.tidy(() => {
      // Capture the frame from the webcam.
      const img = webcam.capture()

      // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = model.predict(img)

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions
      //.as1D().argMax()
    })

    const classId = await predictedClass.data()

    let count = 0
    for (pred of classId) {
      $('.emotion span').eq(count).html(Math.round(pred * 100))
      count++
    }


    //console.log(classId)

    predictedClass.dispose()


    //console.log(emotions[classId])

    await tf.nextFrame()
  }
}
