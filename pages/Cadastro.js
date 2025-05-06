import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cadastro = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [disability, setDisability] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateFields = () => {
    if (!name.trim()) {
      setErrorMessage('O nome é obrigatório');
      return false;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleCadastro = async () => {
    if (!validateFields()) return;
    try {
      const userData = { name, email, password, disability };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('Cadastro - Usuário salvo no AsyncStorage:', userData);
      navigation.navigate('Login');
    } catch (error) {
      console.log('Cadastro - Erro ao salvar:', error);
      setErrorMessage('Erro ao cadastrar, tente novamente');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Icon name="user-plus" size={100} color="#007BFF" />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Confirmação de Senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Tipo de Deficiência (opcional)"
            value={disability}
            onChangeText={setDisability}
            placeholderTextColor="#999"
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cadastroButton} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Já possui conta? Clique Aqui</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  cadastroButton: {
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
  loginLinkContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#007BFF',
    fontSize: 14,
  },
});

export default Cadastro;