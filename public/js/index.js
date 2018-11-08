const webcam = new Webcam(document.getElementById('webcam'))

init()

async function init() {
  try {
    await webcam.setup()
  } catch (e) {
    console.log(e)
  }
}
