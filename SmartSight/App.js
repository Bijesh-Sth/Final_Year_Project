import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import CameraComponent from './Components/CameraComponent';
import ApiComponent from './Components/ApiComponent';
const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };

  const navigateToApi = () => {
    navigation.navigate('Api');
  };


  return (
    <View style={styles.container}>
      <Text>Test App</Text>
      <TouchableOpacity onPress={navigateToCamera}>
        <Text style={styles.button}>Go to Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToApi}>
        <Text style={styles.button}>Go to API Component</Text>
      </TouchableOpacity>
    
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    color: 'white',
    borderRadius: 5,
  },
});

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraComponent} />
      <Stack.Screen name="Api" component={ApiComponent} />
    </Stack.Navigator>
  );
};

export default () => {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};
