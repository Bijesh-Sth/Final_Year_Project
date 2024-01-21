import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

const CameraComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(10);
  const [timer, setTimer] = useState(captureInterval);
  const [isAutoCaptureActive, setIsAutoCaptureActive] = useState(false);

  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Send request to your API endpoint
      const response = await axios.get('http://127.0.0.1:8000/');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
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
        url: 'https://700e-27-34-65-203.ngrok-free.app/predict',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const axiosResponse = await axios(axiosConfig);
      console.log('Image upload response:', axiosResponse.data);

      setUploadResponse(axiosResponse.data);
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

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Camera Component</Text>
      <Text>Next capture in: {timer} seconds</Text>
      <TouchableOpacity onPress={pickImage}>
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#28a745', borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>Upload Image</Text>
        </View>
      </TouchableOpacity>
      {hasPermission === null ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007BFF" />
      ) : hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <View>
          <Camera style={{ width: 200, height: 200, marginTop: 20 }} type={Camera.Constants.Type.back} ref={cameraRef} />
          <TouchableOpacity onPress={takePicture}>
            <View style={{ marginTop: 20, padding: 10, backgroundColor: '#dc3545', borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>Take Picture</Text>
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
          {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 20 }} />}
          {uploadResponse && (
            <>
              <Text>Image upload response:</Text>
              <Text>{JSON.stringify(uploadResponse, null, 2)}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default CameraComponent;
