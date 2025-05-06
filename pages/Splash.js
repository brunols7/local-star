import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
        console.log('Splash - hasLoggedIn:', hasLoggedIn);
        const nextScreen = hasLoggedIn === 'true' ? 'Home' : 'Onboarding';
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: nextScreen }],
          });
        }, 2000);
      } catch (error) {
        console.log('Erro ao checar login:', error);
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }, 2000);
      }
    };
    checkLoginStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Icon name="home" size={100} color="#007BFF" />
      <Text style={styles.text}>Bem-vindo!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 20,
  },
});

export default Splash;