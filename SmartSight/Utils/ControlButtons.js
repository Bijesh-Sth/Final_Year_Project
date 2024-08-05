import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ControlButtons = ({ pickImage, startAutoCapture, stopAutoCapture }) => {
  return (
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
  );
};

export default ControlButtons;
