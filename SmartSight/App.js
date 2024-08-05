import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ImageBackground, Text, Image, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CameraComponent from './Components/CameraComponent';
import ApiComponent from './Components/ApiComponent';
import TestApi from './Components/testapi';

const Stack = createStackNavigator();
const HomeScreen = ({ navigation }) => {
  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };
  const navigateToApi = () => {
    navigation.navigate('Api');
  };

  const navigateToTest=()=>{
    navigation.navigate('test')
  }


  return (
    <View style={styles.container}>

        <Image source={require('./assets/Logo.png')} style={styles.logo} />
        <Text style={{ color: 'white', marginRight: 8,
        position: 'absolute',
        top: 35,  
        left: 90, 
         fontSize:20,
         fontFamily: 'Roboto'}}>SmartSight</Text>
      <Text style={{ color: 'white', marginRight: 8, 
      textAlign: 'center',
      paddingBottom: 20, fontFamily: 'Roboto', 
    fontSize: 50, }}>Detect Objects Around You!</Text>
      <TouchableOpacity onPress={navigateToCamera}>
      <Text style={styles.buttonContainer}>
      <Text style={styles.buttonText}>  START </Text>
    <Icon name="play-circle" size={20} style={styles.icon} />      </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={navigateToApi}>
      <Text style={styles.buttonContainer}>
      <Text style={styles.buttonText}>  API </Text>
    <Icon name="cogs" size={20} style={styles.icon} />      </Text>
      </TouchableOpacity> */}
      
    
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2181C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Roboto', 
    fontSize: 16,
  },

  logo: {
    position: 'absolute',
    top: 20,  
    left: 20,
    width: 60, 
    height: 60,
  },
  buttonContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2181C6',
  },
  buttonText: {
    color: 'black',
    marginRight: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    color: '#2181C6',
    fontSize: 20,
  },
 
  
});

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraComponent} />
      <Stack.Screen name="Api" component={ApiComponent} />
      <Stack.Screen name="test" component={TestApi}/>
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
