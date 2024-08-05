import React from 'react';
import { View, Text } from 'react-native';

const CaptureIndicator = ({ showYellowTick, isImageUploaded, isResponseReceived, uploadResponse }) => {
  return (
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
  );
};

export default CaptureIndicator;
