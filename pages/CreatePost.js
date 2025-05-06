import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/FontAwesome';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

const CreatePost = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [accessibility, setAccessibility] = useState([]);
  const [otherAccessibility, setOtherAccessibility] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [streetName, setStreetName] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState({ title: false, description: false, accessibility: false });

  const accessibilityOptions = ['Rampa', 'Banheiro Acessível', 'Elevador', 'Outro'];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        updateStreetName(loc.coords.latitude, loc.coords.longitude);
      }
    })();
  }, []);

  const showToast = (msg) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert('', msg);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Permissão para acessar a galeria negada');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.image],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover a imagem?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          onPress: () => setImage(null),
        },
      ],
      { cancelable: true }
    );
  };

  const toggleMap = async () => {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showToast('Permissão para acessar localização é necessária');
      return;
    }
    // Get current location before showing map
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      updateStreetName(loc.coords.latitude, loc.coords.longitude);
      setShowMap(prev => !prev);
    } catch (error) {
      showToast('Erro ao obter localização');
    }
  };

  const updateStreetName = async (latitude, longitude) => {
    try {
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        setStreetName(`${address[0].street || ''}, ${address[0].city || ''}`);
      } else {
        setStreetName('Localização desconhecida');
      }
    } catch (error) {
      setStreetName('Erro ao carregar endereço');
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    updateStreetName(latitude, longitude);
  };

  const toggleAccessibility = (option) => {
    const newList = accessibility.includes(option)
      ? accessibility.filter(item => item !== option)
      : [...accessibility, option];
    if (option === 'Outro' && accessibility.includes(option)) setOtherAccessibility('');
    setAccessibility(newList);
    if (newList.length > 0 && errors.accessibility) setErrors(prev => ({ ...prev, accessibility: false }));
  };

  const handleCreatePost = async () => {
    const titleError = !title.trim();
    const descriptionError = !description.trim();
    const accessibilityError = accessibility.length === 0;
    if (titleError || descriptionError || accessibilityError) {
      setErrors({ title: titleError, description: descriptionError, accessibility: accessibilityError });
      showToast('Campos obrigatórios não preenchidos');
      return;
    }
    setErrors({ title: false, description: false, accessibility: false });
    try {
      const storedPosts = await AsyncStorage.getItem('posts');
      const posts = storedPosts ? JSON.parse(storedPosts) : [];
      const finalAccessibility = accessibility.includes('Outro') 
        ? [...accessibility.filter(item => item !== 'Outro'), otherAccessibility] 
        : accessibility;
      const newPost = {
        id: Date.now().toString(),
        title,
        description,
        accessibility: finalAccessibility,
        image,
        location: location ? { latitude: location.latitude, longitude: location.longitude } : null,
        locationName,
        streetName,
        date: new Date().toISOString(),
        positive: 0,
        negative: 0,
        ratings: {},
      };
      const updatedPosts = [...posts, newPost];
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
      navigation.navigate('Home');
    } catch (error) {
      showToast('Erro ao criar post');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Criar Novo Post</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.title && styles.errorInput]}
            placeholder="Título"
            value={title}
            onChangeText={text => { setTitle(text); if (errors.title) setErrors(prev => ({ ...prev, title: false })); }}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Nome do Local"
            value={locationName}
            onChangeText={setLocationName}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, styles.descriptionInput, errors.description && styles.errorInput]}
            placeholder="Descrição"
            value={description}
            onChangeText={text => { setDescription(text); if (errors.description) setErrors(prev => ({ ...prev, description: false })); }}
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
          <Text style={styles.label}>Tipos de Acessibilidade</Text>
          <View style={[styles.accessibilityContainer, errors.accessibility && styles.errorAccessibilityContainer]}>  
            {accessibilityOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.accessibilityButton,
                  accessibility.includes(option) && styles.accessibilityButtonActive
                ]}
                onPress={() => toggleAccessibility(option)}
              >
                <Text style={[
                  styles.accessibilityText,
                  accessibility.includes(option) && styles.accessibilityTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {accessibility.includes('Outro') && (
            <TextInput
              style={styles.input}
              placeholder="Especifique outro tipo"
              value={otherAccessibility}
              onChangeText={setOtherAccessibility}
              placeholderTextColor="#999"
            />
          )}
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Escolher Imagem (opcional)</Text>
          </TouchableOpacity>
          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <Icon name="trash" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={toggleMap}>
            <Text style={styles.buttonText}>
              Registrar Localização Atual (opcional)
            </Text>
          </TouchableOpacity>
          {showMap && location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                provider="google"
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={location}
                  draggable
                  onDragEnd={(e) => handleMapPress(e)}
                />
              </MapView>
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
        <Text style={styles.buttonText}>Criar Post</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
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
  descriptionInput: {
    height: 80,
  },
  label: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 5,
  },
  accessibilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  accessibilityButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  accessibilityButtonActive: {
    backgroundColor: '#007BFF',
  },
  accessibilityText: {
    color: '#007BFF',
    fontSize: 14,
  },
  accessibilityTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 5,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 300,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorAccessibilityContainer: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
});

export default CreatePost;