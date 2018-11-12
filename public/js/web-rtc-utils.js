const configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302'
  }]
}

let pc

function onSuccess() {}
function onError(error) {
  console.error(error)
}

function startWebRTC(isOfferer) {
  pc = new RTCPeerConnection(configuration)

  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  pc.onicecandidate = event => {
    if (event.candidate) {
      sendMessage({'candidate': event.candidate})
    }
  }

  // If user is offerer let the 'negotiationneeded' event create the offer
  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer().then(localDescCreated).catch(onError)
    }
  }

  // When a remote stream arrives display it in the #remoteVideo element
  pc.onaddstream = event => {
    remoteVideo.srcObject = event.stream
  }

  navigator.mediaDevices.getUserMedia({
    video: true,
  }).then(stream => {
    // Display your local video in #localVideo element
    //localVideo.srcObject = stream
    // Add your stream to be sent to the conneting peer
    pc.addStream(stream)
  }, onError)
}

function respondOffer(message) {
  // This is called after receiving an offer or answer from another peer
  pc.setRemoteDescription(new RTCSessionDescription(message), () => {
    // When receiving an offer lets answer it
    if (pc.remoteDescription.type === 'offer') {
      pc.createAnswer().then(localDescCreated).catch(onError);
    }
  }, onError);
}

function addCandidate(message) {
  // Add the new ICE candidate to our connections remote description
  pc.addIceCandidate(
    new RTCIceCandidate(message), onSuccess, onError
  );
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc.localDescription}),
    onError
  )
}

function sendMessage(message) {
  socket.emit('rtc message', roomHash, message);
}
