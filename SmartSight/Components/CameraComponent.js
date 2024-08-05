import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import TextToSpeech from '../Utils/tts';

const CameraComponent = () => {
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
  const [label, setLabel] = useState('');

  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const intervalIdRef = useRef(null);

  const url = 'https://2caa-120-89-104-112.ngrok-free.app';
  

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    fetchData();
  }, []);

  useEffect(() => {
    if (uploadResponse) {
      const getHighestConfidenceLabel = () => {
        let highestConfidence = -1; // Initialize with a value lower than any possible confidence level
        let highestConfidenceLabel = null;
      
        // Check if currency label has higher confidence
        if (uploadResponse.currency && uploadResponse.currency.confidence !== null && uploadResponse.currency.confidence > highestConfidence) {
          highestConfidence = uploadResponse.currency.confidence;
          highestConfidenceLabel = uploadResponse.currency.label;
        }
      
        // Check if any object has higher confidence
        if (uploadResponse.object && uploadResponse.object.length > 0) {
          uploadResponse.object.forEach((obj) => {
            if (obj.confidence !== null && obj.confidence > highestConfidence) {
              highestConfidence = obj.confidence;
              highestConfidenceLabel = obj.class_name;
            }
          });
        }
      
        return highestConfidenceLabel;
      };
      
      setLabel(getHighestConfidenceLabel());
    }
    
  }, [uploadResponse]);

  useEffect(() => {
    if(label){
      readData();
    }
  }, [label]);

  useEffect(() => {
    let intervalId;
    if (isAutoCaptureActive) {
      // setCaptureNewimage(true);
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
      const Speak = label;
      console.log('Speak:', Speak);
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

  // const takePicture = async () => {
  //   if (cameraRef.current) {
  //     const startTime = new Date();
  //     console.log('Taking picture...');
  //     console.log('Start time:', startTime);
  //     const photo = await cameraRef.current.takePictureAsync();
  //     setImageUri(photo.uri);
  //     setShowYellowTick(true);
  //     savePicture(photo.uri);
  //     uploadImage(photo.uri, startTime);
  //   }
  // };
  const takePicture = async () => {
    if (cameraRef.current) {
      const startTime = new Date();
      console.log('Taking picture...');
      console.log('Start time:', startTime);
  
      // Define quality and aspect ratio
      const quality = 0.5; // Adjust the quality as needed
      const aspectRatio = [4, 3]; // Adjust the aspect ratio as needed
  
      const photo = await cameraRef.current.takePictureAsync({
        quality,
        // Set aspect ratio if necessary
        // This will crop the image to the specified aspect ratio
        // aspect: aspectRatio,
      });
  
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
    console.log('Uploading image...');
    console.log('Image URI:', uri);
    console.log('Start time:', startTime);
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
        url: 'https://2caa-120-89-104-112.ngrok-free.app/predict',
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
      const endTime = new Date();
      const responseTime = (endTime - startTime) / 1000;
      setResponseTime(responseTime.toFixed(2));


      const resetIndicators = setTimeout(() => {
        setIsImageUploaded(false);
        setIsResponseReceived(false);
        setShowYellowTick(false);
        setUploadResponse(null);
        setResponseTime(null);
        // setLabel('');
      }, 5000);

      return () => clearTimeout(resetIndicators);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const startAutoCapture = () => {
    setIsAutoCaptureActive(true);
    setTimer(captureInterval); 
  
    intervalIdRef.current = setInterval(() => {
      takePicture();
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : captureInterval));
    }, captureInterval * 1000);
  };
  
  const stopAutoCapture = () => {
    setIsAutoCaptureActive(false);
    clearInterval(intervalIdRef.current); 
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
              <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <TouchableOpacity onPress={takePicture}>
                  <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#dc3545', borderRadius: 5 }}>
                    <Text style={{ color: 'white' }}>Take Picture</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {isResponseReceived && (
                <View style={{ position: 'absolute', top: 0, right: 0, flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                <Text style={{ color: 'white', fontSize: 18, marginRight: 5 }}>
                  {label}
                </Text>
                {responseTime !==null && (
                  <View style={{ position: 'absolute', top: 15, right: 0, flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                <Text style={{ color: 'white', fontSize: 18, marginRight: 5 }}>Response Time: {responseTime}s</Text>
                </View>
                )}
                </View>
              )}
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

export default CameraComponent;
