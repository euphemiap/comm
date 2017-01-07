//HARDWARE CONTROLLER VARIABLES
var srDivision = 1;
var tempo = 500;

//ROUTINE FUNCTIONS
function coroutine(f) {
    var o = f(); // instantiate the coroutine
    o.next(); // execute until the first yield
    return function(x) {
        o.next(x);
    }
}

function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}


const SAMPLE_LIBRARY = {
  'Grand Piano': [
    { note: 'C',  octave: 4, file: 'Samples/Grand Piano/piano-f-c4.wav' },
  ],
   'Flute': [
    { note: 'C',  octave: 5, file: 'Samples/Flute/flute_c5.wav' },
  ],
   'Cor Anglais': [
    { note: 'D',  octave: 5, file: 'Samples/Cor/cor_anglais-d5.wav' },
  ],
  'Percussion': [
    { note: 'D',  octave: 5, file: 'Samples/Percussion/Percussion.wav' },
  ],
};

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let audioContext = new AudioContext();

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function flatToSharp(note) {
  switch (note) {
    case 'Bb': return 'A#';
    case 'Db': return 'C#';
    case 'Eb': return 'D#';
    case 'Gb': return 'F#';
    case 'Ab': return 'G#';
    default:   return note;
  }
}

/*SAMPLING FUNCTIONS*/
function fetchSample(path) {
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function getNearestSample(sampleBank, note, octave) {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA =
      Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
    let distanceToB =
      Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function getSample(instrument, noteAndOctave) {
  let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);
  let sampleBank = SAMPLE_LIBRARY[instrument];
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  let distance =
    getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave);
  return fetchSample(sample.file).then(audioBuffer => ({
    audioBuffer: audioBuffer,
    distance: distance
  }));
}

function playSample(instrument, note) {
  getSample(instrument, note).then(({audioBuffer, distance}) => {
    let playbackRate = Math.pow(2, distance / 12)/srDivision;
    let bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.playbackRate.value = playbackRate;
    bufferSource.connect(audioContext.destination);
    bufferSource.start(audioContext.currentTime);
  });
}

function startLoop(instrument, note, loopLengthSeconds) {
  playSample(instrument, note);
  setIntervalX(
    () => playSample(instrument, note),
    loopLengthSeconds * 25, 20
  );
}


//MOTIF BANK
var M_00 = coroutine(function*() {
    while (true) {
      yield;
      playSample("Grand Piano", "G3");
      yield;
      playSample("Grand Piano", "G4");
      yield;
      playSample("Grand Piano", "G5");
      yield;
      playSample("Flute", "G6");
    }
});

var M_01 = coroutine(function*() {
    while (true) {
      yield;
      playSample("Grand Piano", "G4");
      yield;
      playSample("Grand Piano", "G4");
      yield;
      playSample("Flute", "G5");
      yield;
      playSample("Grand Piano", "G6");
    }
});

//PATTERN BANK
var P_00 = coroutine(function*() {
    while (true) {
      yield;
      srDivision = 2;
      setIntervalX(M_00, tempo/2.5, 5);
      yield;
      srDivision = 2;
      setIntervalX(M_00, tempo/2.5, 5);
      yield;
      srDivision = 1;
      setIntervalX(M_01, tempo/2.5, 5);
      yield;
    }
});

function P_01(){
  srDivision = 1.5;
  startLoop('Grand Piano', 'G4',  25);
  startLoop('Grand Piano', 'E4',  75);

  startLoop('Grand Piano', 'A5',  12.5*2);
  startLoop('Grand Piano', 'A5',  62.5);
  
  startLoop('Grand Piano', 'B5',  25);
  startLoop('Grand Piano', 'E6',  75);
  
  startLoop('Grand Piano', 'F4',  12.5*2);
  startLoop('Grand Piano', 'C4',  62.5);
}

//CHANNEL BANK
function CH_1(status){
if(status == true){
  //setIntervalX(P_00, tempo, 64);
  P_01();
  }
}

function CH_2(status){
if(status == true){

  }
}

function CH_3(status){
if(status == true){

  }
}

function CH_4(status){
if(status == true){

  }
}

//CHANNEL SYSTEMS
var CH_1_ACTIVE = true;
var CH_2_ACTIVE = false;
var CH_3_ACTIVE = false;
var CH_4_ACTIVE = false;

//RUNTIME FUNCTIONS
CH_1(CH_1_ACTIVE);
CH_2(CH_2_ACTIVE);
CH_3(CH_3_ACTIVE);
CH_4(CH_4_ACTIVE);

//ADD IN OLD LOOPING SYSTEM
