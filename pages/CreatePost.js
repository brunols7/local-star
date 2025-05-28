import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/FontAwesome';

const Maps_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

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
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const accessibilityOptions = ['Rampa', 'Banheiro Acessível', 'Elevador', 'Outro'];
  const keyboardVerticalOffsetValue = 0;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.LocationAccuracy.Balanced,
            timeout: 10000,
          });
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          await updateStreetName(loc.coords.latitude, loc.coords.longitude);
        } catch (error) {
          // Não mostra erro para localização inicial automática se falhar
        }
      }
    })();
  }, []);

  const showToast = (msg) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert('', msg);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permissão para acessar a galeria negada');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      } else {
        showToast('Nenhuma imagem foi selecionada ou ocorreu um erro.');
      }
    } catch (error) {
      showToast('Ocorreu um erro ao tentar abrir a galeria.');
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover a imagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', onPress: () => setImage(null) },
      ],
      { cancelable: true }
    );
  };

  const updateStreetName = async (latitude, longitude) => {
    try {
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const street = address[0].street || '';
        const city = address[0].city || '';
        setStreetName(`${street}, ${city}`);
      } else {
        setStreetName('Localização desconhecida');
      }
    } catch (error) {
      setStreetName('Erro ao carregar endereço');
    }
  };

  const toggleMap = async () => {
    if (isLocationLoading) return;
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permissão para acessar localização é necessária');
        setIsLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
        timeout: 15000, // 15 segundos de timeout
      });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      await updateStreetName(loc.coords.latitude, loc.coords.longitude);
      setShowMap(prev => !prev);
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes("timeout")) {
        showToast('Tempo esgotado ao obter localização. Tente novamente.');
      } else if (error.message && error.message.includes("Location request failed due to unsatisfied device settings")) {
        Alert.alert(
           "Serviço de Localização Desativado",
           "Por favor, ative os serviços de localização do seu dispositivo (modo de alta precisão) para registrar a localização.",
           [{ text: "OK" }]
         );
     } else {
       showToast('Erro ao obter ou processar localização.');
     }
    } finally {
      setIsLocationLoading(false);
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
    if (option === 'Outro' && !newList.includes('Outro')) setOtherAccessibility('');
    setAccessibility(newList);
    if (newList.length > 0 && errors.accessibility) setErrors(prev => ({ ...prev, accessibility: false }));
  };

  const handleCreatePost = async () => {
    const titleError = !title.trim();
    const descriptionError = !description.trim();
    const accessibilityError = accessibility.length === 0 || (accessibility.includes('Outro') && !otherAccessibility.trim());

    if (titleError || descriptionError || accessibilityError) {
      setErrors({ title: titleError, description: descriptionError, accessibility: accessibilityError });
      let errorMsg = 'Campos obrigatórios não preenchidos.';
      if (accessibilityError && accessibility.includes('Outro') && !otherAccessibility.trim()){
        errorMsg = 'Por favor, especifique o tipo de acessibilidade "Outro".';
      }
      showToast(errorMsg);
      return;
    }
    setErrors({ title: false, description: false, accessibility: false });
    try {
      const storedPosts = await AsyncStorage.getItem('posts');
      const posts = storedPosts ? JSON.parse(storedPosts) : [];
      const finalAccessibility = accessibility.includes('Outro')
        ? [...accessibility.filter(item => item !== 'Outro'), otherAccessibility.trim()]
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
      keyboardVerticalOffset={keyboardVerticalOffsetValue}
    >
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
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
              style={[styles.input, errors.accessibility && accessibility.includes('Outro') && !otherAccessibility.trim() && styles.errorInput]}
              placeholder="Especifique outro tipo"
              value={otherAccessibility}
              onChangeText={text => {
                setOtherAccessibility(text);
                if (errors.accessibility && text.trim()) setErrors(prev => ({ ...prev, accessibility: false }));
              }}
              placeholderTextColor="#999"
            />
          )}
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>
              {image ? "Alterar Imagem" : "Escolher Imagem (opcional)"}
            </Text>
          </TouchableOpacity>
          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <Icon name="trash" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={toggleMap}
            disabled={isLocationLoading}
          >
            {isLocationLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                Registrar Localização Atual (opcional)
              </Text>
            )}
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
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Text style={styles.buttonText}>Criar Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
    marginBottom: 20,
    minHeight: 40,
    justifyContent: 'center',
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
    marginBottom: 20,
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
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 300,
  },
  createButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorAccessibilityContainer: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom:10,
  },
});

export default CreatePost;