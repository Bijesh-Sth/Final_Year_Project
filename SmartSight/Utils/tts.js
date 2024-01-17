import * as Speech from 'expo-speech';

const TextToSpeech = (text) => {
    
    Speech.speak("Hello", {
        language: 'en',
      pitch: 1,
      rate: 1
    }, (status) => {
      console.log('Tts status:', status);
    });
  };

export default TextToSpeech;