import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Camera } from 'expo-camera';

const CameraView = ({ onCapture, isResponseReceived, uploadResponse }) => {
  const cameraRef = useRef(null);

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back} ref={cameraRef}>
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <TouchableOpacity onPress={onCapture}>
            <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#dc3545', borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>Take Picture</Text>
            </View>
          </TouchableOpacity>
        </View>
        {isResponseReceived && (
          <View style={{ position: 'absolute', top: 0, right: 0, flexDirection: 'row', alignItems: 'center', margin: 10 }}>
            <Text style={{ color: 'white', fontSize: 18, marginRight: 5 }}>
              {uploadResponse?.currency?.label || (uploadResponse?.object.length > 0 ? uploadResponse.object[0].class_name : null)}
            </Text>
          </View>
        )}
      </Camera>
    </View>
  );
};

export default CameraView;
