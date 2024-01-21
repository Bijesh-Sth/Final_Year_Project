import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import TextToSpeech from '../Utils/tts';
import CameraComponent from './CameraComponent'; // Import your CameraComponent

const ApiComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [showCamera, setShowCamera] = useState(false); // State to control camera visibility

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://700e-27-34-65-203.ngrok-free.app');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };
  const text = "Hello, I'm a text-to-speech robot.";
  const readData = () => {
    if (text) {
      TextToSpeech(text, () => {
        console.log('Text has been spoken.');
      });
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
        const selectedAsset = result.assets[0];
        const imageUri = selectedAsset.uri;
        setImageUri(imageUri);
        uploadImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error.message);
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
  
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up the request:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>API Component</Text>
      <TouchableOpacity onPress={readData}>
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#007BFF', borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>Read Data with Text-to-Speech</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage}>
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#28a745', borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>Upload Image</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowCamera(!showCamera)}>
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#dc3545', borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>Toggle Camera</Text>
        </View>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007BFF" />
      ) : (
        <View>
          <Text>Data from API:</Text>
          {data && (
            <>
              <Text>{JSON.stringify(data, null, 2)}</Text>
              <Text>Class Label: {data.class_label}</Text>
            </>
          )}
          {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 20 }} />}
          {uploadResponse && (
            <>
              <Text>Image upload response:</Text>
              <Text>{JSON.stringify(uploadResponse, null, 2)}</Text>
            </>
          )}
          {/* Render CameraComponent conditionally */}
          {showCamera && <CameraComponent />} 
        </View>
      )}
    </View>
  );
};

export default ApiComponent;
