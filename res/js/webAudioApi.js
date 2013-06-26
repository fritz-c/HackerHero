var BGM_SOUND = null;
var EVIL_LAUGH_SOUND = null;
var ACCESS_GRANTED_SOUND = null;
var ALARM_SOUND = null;
var BLIP_SOUND = null;

window.onload = initSound;
var context;
var bufferLoader;

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

function initSound() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      'res/audio/Rising.mp3',
      'res/audio/laugh_slow.wav',
      'res/audio/access_granted.wav',
      'res/audio/alarm.wav',
      'res/audio/blip.wav',
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
  // Create sources and play them together.
  BGM_SOUND = context.createBufferSource();
  BGM_SOUND.buffer = bufferList[0];
  BGM_SOUND.connect(context.destination);

  EVIL_LAUGH_SOUND = context.createBufferSource();
  EVIL_LAUGH_SOUND.buffer = bufferList[1];
  EVIL_LAUGH_SOUND.connect(context.destination);

  ACCESS_GRANTED_SOUND = context.createBufferSource();
  ACCESS_GRANTED_SOUND = bufferList[2];
  ACCESS_GRANTED_SOUND.connect(context.destination);

  ALARM_SOUND = context.createBufferSource();
  ALARM_SOUND = bufferList[3];
  ALARM_SOUND.connect(context.destination);

  BLIP_SOUND = context.createBufferSource();
  BLIP_SOUND = bufferList[4];
  BLIP_SOUND.connect(context.destination);
}