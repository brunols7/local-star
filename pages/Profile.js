import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [name, setName] = useState('');
  const [disability, setDisability] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        const storedDisability = await AsyncStorage.getItem('userDisability');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedName) setName(storedName);
        if (storedDisability) setDisability(storedDisability);
        if (storedEmail) setEmail(storedEmail);
      } catch (error) {
        setErrorMessage('Erro ao carregar perfil');
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      if (!name.trim()) {
        setErrorMessage('O nome é obrigatório');
        return;
      }
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userDisability', disability || '');
      setErrorMessage('Alterações salvas com sucesso');
    } catch (error) {
      setErrorMessage('Erro ao salvar alterações');
    }
  };

  const handleLogout = async () => {
    try {
      //await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      setErrorMessage('Erro ao fazer logout');
    }
  };

  const handleClearPosts = async () => {
    try {
      await AsyncStorage.removeItem('posts');
      setErrorMessage('Posts limpos com sucesso. Volte à tela inicial para atualizar.');
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage('Erro ao limpar posts');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false}
          placeholder="Email"
          placeholderTextColor="#999"
        />
        <Text style={styles.label}>Tipo de Deficiência (opcional)</Text>
        <TextInput
          style={styles.input}
          value={disability}
          onChangeText={setDisability}
          placeholder="Digite sua deficiência"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.buttonText}>Salvar alterações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.clearPostsButton} onPress={handleClearPosts}>
          <Text style={styles.buttonTextClearPosts}>Limpar posts</Text>
        </TouchableOpacity> */}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007BFF',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '100%',
    color: '#000',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  // clearPostsButton: {
  //   backgroundColor: 'transparent',
  //   padding: 15,
  //   borderRadius: 5,
  //   alignItems: 'center',
  //   marginBottom: 15,
  //   borderColor: '#007BFF',
  //   borderWidth: 1,
  // },
  // buttonTextClearPosts: {
  //   color: '#007BFF',
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Profile;