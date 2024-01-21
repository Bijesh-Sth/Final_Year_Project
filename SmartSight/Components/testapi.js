import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const TestApi = () => {
  const [email, setEmail] = useState('');
  const [responseData, setResponseData] = useState({}); // Initialize with an empty object

  const makeRequest = () => {
    const data = {
      email: email,
    };

    axios
      .post('https://700e-27-34-65-203.ngrok-free.app/email', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        console.log(response.data);
        setResponseData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <View>
      <TextInput
        placeholder="email"
        onChangeText={(value) => setEmail(value)}
      />
      <Button title="Submit" onPress={makeRequest} />

      {responseData.message ? (
        <Text style={{ marginTop: 20 }}>Response: {responseData.message}</Text>
      ) : null}
    </View>
  );
};

export default TestApi;
