import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Tts from 'react-native-tts';
import TextToSpeech from '../Utils/tts';


const ApiComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const readData = () => {
    if (data && data.title) {
      TextToSpeech(data.title);
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
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007BFF" />
      ) : (
        <View>
          {data && (
            <>
              <Text>Data from API:</Text>
              <Text>{JSON.stringify(data, null, 2)}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default ApiComponent;
