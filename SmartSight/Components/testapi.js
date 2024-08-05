// TestApi.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import CameraView from '../Utils/CameraView';
import CaptureIndicator from '../Utils/Indicators';
import ControlButtons from '../Utils/ControlButtons';
import TextToSpeech from '../Utils/tts';

const TestApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(10);
  const [timer, setTimer] = useState(captureInterval);
  const [isAutoCaptureActive, setIsAutoCaptureActive] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isResponseReceived, setIsResponseReceived] = useState(false);
  const [showYellowTick, setShowYellowTick] = useState(false);

  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const url = 'https://cd28-27-34-65-231.ngrok-free.app';

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    readData();
  }, [uploadResponse]);

  useEffect(() => {
    let intervalId;
    if (isAutoCaptureActive) {
      intervalId = setInterval(() => {
        takePicture();
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : captureInterval));
      }, captureInterval * 1000);
    }

    return () => clearInterval(intervalId);
  }, [isAutoCaptureActive, captureInterval]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const readData = () => {
    if (uploadResponse) {
      const Speak = uploadResponse.currency.label || (uploadResponse.object.length > 0 ? uploadResponse.object[0].class_name : null);

      if (Speak) {
        TextToSpeech(Speak, () => {
          console.log('Text has been spoken.');
        }, (error) => {
          console.error('Error while trying to speak:', error);
        });
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const imageUri = result.uri;
        setImageUri(imageUri);
        setShowYellowTick(true);
        uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error.message);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
      setShowYellowTick(true);
      savePicture(photo.uri);
      uploadImage(photo.uri);
    }
  };

  const savePicture = async (uri) => {
    try {
      await MediaLibrary.saveToLibraryAsync(uri);
    } catch (error) {
      console.error('Error saving picture:', error);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const formData = new FormData();
      if (Platform.OS === 'web') {
        formData.append('file', new File([await fetch(uri).then(response => response.blob())], 'image.jpg'));
      } else {
        formData.append('file', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          type: 'image/jpeg',
          name: 'image.jpg',
        });
      }

      const axiosConfig = {
        method: 'post',
        url: 'https://bedd-27-34-65-246.ngrok-free.app/predict',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const axiosResponse = await axios(axiosConfig);
      console.log('Image upload response:', axiosResponse.data);

      setUploadResponse(axiosResponse.data);
      setIsImageUploaded(true);

      setIsResponseReceived(true);

      const resetIndicators = setTimeout(() => {
        setIsImageUploaded(false);
        setIsResponseReceived(false);
        setShowYellowTick(false);
      }, 5000);

      return () => clearTimeout(resetIndicators);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  const startAutoCapture = () => {
    setIsAutoCaptureActive(true);
    const intervalId = setInterval(() => {
      takePicture();
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : captureInterval));
    }, captureInterval * 1000);

    setTimer(captureInterval);
  };

  const stopAutoCapture = () => {
    setIsAutoCaptureActive(false);
    setTimer(captureInterval);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Camera Component</Text>
      <Text>Next capture in: {timer} seconds</Text>
      <View style={{ flex: 0.8, width: '100%' }}>
        {hasPermission === null ? (
          <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color="#007BFF" />
        ) : hasPermission === false ? (
          <Text>No access to camera</Text>
        ) : (
          <CameraView cameraRef={cameraRef} onCapture={takePicture} isResponseReceived={isResponseReceived} uploadResponse={uploadResponse} />
        )}
      </View>
      <CaptureIndicator showYellowTick={showYellowTick} isImageUploaded={isImageUploaded} isResponseReceived={isResponseReceived} uploadResponse={uploadResponse} />
      <ControlButtons pickImage={pickImage} startAutoCapture={startAutoCapture} stopAutoCapture={stopAutoCapture} />
    </View>
  );
};

export default TestApi;
