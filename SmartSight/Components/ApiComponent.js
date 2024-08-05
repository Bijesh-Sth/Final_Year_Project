import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import TextToSpeech from '../Utils/tts';

const ApiComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(10);
  const [timer, setTimer] = useState(captureInterval);
  const [responseTime, setResponseTime] = useState(null);
  const [isAutoCaptureActive, setIsAutoCaptureActive] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isResponseReceived, setIsResponseReceived] = useState(false);
  const [showYellowTick, setShowYellowTick] = useState(false);
  const [captureNewimage, setCaptureNewimage] = useState(false);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [freezeViewfinder, setFreezeViewfinder] = useState(false);
  const [lastFrameUri, setLastFrameUri] = useState(null); // State to store the last frame URI

  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const url = 'https://8e8d-27-34-65-222.ngrok-free.app';

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    fetchData();
  }, []);

  useEffect(() => {
    readData();
  }, [uploadResponse]);

  useEffect(() => {
    let intervalId;
    if (isAutoCaptureActive) {
      captureNewimage = true;
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
          // console.log('Text has been spoken.');
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
    if (cameraRef.current && !isTakingPicture) { // Check if not already taking a picture
      setIsTakingPicture(true); // Set flag to indicate picture taking
      setFreezeViewfinder(true); // Freeze the viewfinder

      const startTime = new Date();
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
      setShowYellowTick(true);
      savePicture(photo.uri);
      uploadImage(photo.uri, startTime);
    }
  };

  const savePicture = async (uri) => {
    try {
      await MediaLibrary.saveToLibraryAsync(uri);
    } catch (error) {
      console.error('Error saving picture:', error);
    }
  };

  const uploadImage = async (uri, startTime) => {
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
        url: 'https://8e8d-27-34-65-222.ngrok-free.app/predict',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const axiosResponse = await axios(axiosConfig);
      setUploadResponse(axiosResponse.data);
      setIsImageUploaded(true);
      setIsResponseReceived(true);
      const endTime = new Date();
      const responseTime = (endTime - startTime) / 1000;
      setResponseTime(responseTime.toFixed(2));
      setFreezeViewfinder(false); // Unfreeze the viewfinder after response

      const resetIndicators = setTimeout(() => {
        setIsImageUploaded(false);
        setIsResponseReceived(false);
        setShowYellowTick(false);
        setUploadResponse(null);
        setResponseTime(null);
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
      <Text>SmartSight</Text>
      
      <View style={{ flex: 0.8, width: '100%' }}>
        {hasPermission === null ? (
          <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color="#007BFF" />
        ) : hasPermission === false ? (
          <Text>No access to camera</Text>
        ) : (
          <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back} ref={cameraRef}>
              {freezeViewfinder && lastFrameUri && (
                <ImageBackground source={{ uri: lastFrameUri }} style={styles.overlay} />
              )}
              <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <TouchableOpacity onPress={takePicture}>
                  <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#dc3545', borderRadius: 5 }}>
                    <Text style={{ color: 'white' }}>Take Picture</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        )}
      </View>
      <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        {showYellowTick && (
          <View style={{ width: 20, height: 20, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'black' }}>✓</Text>
          </View>
        )}
        {isImageUploaded && (
          <View style={{ width: 20, height: 20, backgroundColor: 'green', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white' }}>✓</Text>
          </View>
        )}
        {isResponseReceived && (
          <View style={{ width: 20, height: 20, backgroundColor: 'blue', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
            <Text style={{ color: 'white' }}>✓</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
        <TouchableOpacity onPress={pickImage}>
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#28a745', borderRadius: 5 }}>
            <Text style={{ color: 'white' }}>Upload Image</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity onPress={startAutoCapture}>
            <View style={{ padding: 10, backgroundColor: '#007BFF', borderRadius: 5, marginRight: 10 }}>
              <Text style={{ color: 'white' }}>Start Auto Capture</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={stopAutoCapture}>
            <View style={{ padding: 10, backgroundColor: '#dc3545', borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>Stop Auto Capture</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
  },
});

export default ApiComponent;
