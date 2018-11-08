const webcam = new Webcam(document.getElementById('webcam'))
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
      console.log(img)

      // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = model.predict(img)

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions.as1D().argMax()
    })

    const classId = (await predictedClass.data())[0];
    predictedClass.dispose();

    console.log(classId)

    await tf.nextFrame()
  }
}
