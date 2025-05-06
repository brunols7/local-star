import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateFields = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Todos os campos devem ser preenchidos');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        setErrorMessage('Email não cadastrado');
        return;
      }
      const user = JSON.parse(storedUser);
      if (user.email !== email) {
        setErrorMessage('Email não cadastrado');
        return;
      }
      if (user.password !== password) {
        setErrorMessage('Senha inválida');
        return;
      }
      await AsyncStorage.setItem('userEmail', user.email);
      await AsyncStorage.setItem('userName', user.name || 'Usuário');
      await AsyncStorage.setItem('userDisability', user.disability || '');
      await AsyncStorage.setItem('hasLoggedIn', 'true');
      console.log('Login - Dados salvos no AsyncStorage:', {
        userEmail: user.email,
        userName: user.name,
        userDisability: user.disability,
        hasLoggedIn: 'true',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.log('Login - Erro ao logar:', error);
      setErrorMessage('Erro ao fazer login, tente novamente');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Icon name="user" size={100} color="#007BFF" />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity
            style={[
              styles.cadastroButton,
              isButtonPressed && styles.cadastroButtonPressed,
            ]}
            onPress={() => navigation.navigate('Cadastro')}
            onPressIn={() => setIsButtonPressed(true)}
            onPressOut={() => setIsButtonPressed(false)}
          >
            <Text
              style={[
                styles.cadastroButtonText,
                isButtonPressed && styles.cadastroButtonTextPressed,
              ]}
            >
              Cadastrar
            </Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  iconContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007BFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cadastroButton: {
    borderWidth: 2,
    borderColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cadastroButtonPressed: {
    backgroundColor: '#007BFF',
  },
  cadastroButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cadastroButtonTextPressed: {
    color: '#FFF',
  },
  buttonSpacer: {
    height: 10,
  },
});

export default Login;