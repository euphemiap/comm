const SAMPLE_LIBRARY = {
  'Grand Piano': [
    { note: 'A',  octave: 4, file: 'Samples/Grand Piano/piano-f-a4.wav' },
    { note: 'C',  octave: 4, file: 'Samples/Grand Piano/piano-f-c4.wav' },
    { note: 'D#',  octave: 4, file: 'Samples/Grand Piano/piano-f-d#4.wav' },
    { note: 'F#',  octave: 4, file: 'Samples/Grand Piano/piano-f-f#4.wav' },
  ],
   'Flute': [
    { note: 'C',  octave: 5, file: 'Samples/Flute/flute_c5.wav' },
  ],
   'Cor Anglais': [
    { note: 'D',  octave: 5, file: 'Samples/Cor/cor_anglais-d5.wav' },
  ],
};
const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let audioContext = new AudioContext();

function fetchSample(path) {
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
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

function playSample(instrument, note, delaySeconds = 0) {
  getSample(instrument, note).then(({audioBuffer, distance}) => {
    let playbackRate = Math.pow(2, distance / 12)/3;
    let bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.playbackRate.value = playbackRate;
    bufferSource.connect(audioContext.destination);
    bufferSource.start(audioContext.currentTime + delaySeconds);
  });
}

function startLoop(instrument, note, loopLengthSeconds, delaySeconds) {
  playSample(instrument, note, delaySeconds);
  setInterval(
    () => playSample(instrument, note, delaySeconds),
    loopLengthSeconds * 125
  );
}

  //LOOP 1
  startLoop('Cor Anglais', 'D5',  2);
  startLoop('Cor Anglais', 'A5',  4);
  startLoop('Cor Anglais', 'G4', 6);
  startLoop('Cor Anglais', 'F5',  8);
  startLoop('Cor Anglais', 'F3', 6);
  startLoop('Cor Anglais', 'G4', 16);
  startLoop('Cor Anglais', 'C2', 32);


