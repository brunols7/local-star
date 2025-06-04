import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import metro from '../assets/metro.jpg';
import praca from '../assets/praca.jpg';
import senac from '../assets/senac.jpg';

const Home = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('todos');

  const initialPosts = [
  {
    id: "post1",
    title: "Acessibilidade na Biblioteca do Senac Santo Amaro",
    date: "2025-06-01T10:00:00Z",
    locationName: "Biblioteca Senac Santo Amaro",
    streetName: "Rua Dr. Álvaro Alvim, 123",
    image: senac,
    description:
      "A biblioteca do Senac Santo Amaro possui excelente acessibilidade: elevadores amplos, piso tátil para orientação, banheiros adaptados para cadeirantes, e sinalização visual clara em todo o espaço. Ideal para pessoas com deficiência e mobilidade reduzida.",
    accessibility: ["Elevador", "Piso Tátil", "Banheiro Adaptado"],
    ratings: {
      "user1@example.com": 1,
      "user2@example.com": 1,
      "user3@example.com": 1,
    },
    positive: 100,
    negative: 0,
    comments: [
      {
        id: "c1",
        user: "Ana Silva",
        text: "Lugar muito acessível e confortável para estudo.",
        date: "2025-06-02T12:00:00Z",
      },
      {
        id: "c2",
        user: "João Pereira",
        text: "Adorei o piso tátil que facilita a mobilidade.",
        date: "2025-06-02T15:30:00Z",
      },
    ],
  },
  {
    id: "post2",
    title: "Praça Central com Acessibilidade Limitada",
    date: "2025-05-28T09:30:00Z",
    locationName: "Praça Central",
    streetName: "Av. Principal, 500",
    image:
      praca,
    description:
      "Praça com calçadas irregulares e pouca sinalização tátil. Falta banheiro adaptado e rampas adequadas, dificultando o acesso para cadeirantes e pessoas com deficiência visual.",
    accessibility: ["Sem Banheiro Adaptado", "Calçadas Irregulares"],
    ratings: {
      "user1@example.com": 0,
      "user4@example.com": 0,
    },
    positive: 0,
    negative: 100,
    comments: [
      {
        id: "c3",
        user: "Carlos Souza",
        text: "Precisa melhorar muito para ser acessível.",
        date: "2025-05-29T10:00:00Z",
      },
    ],
  },
  {
    id: "post3",
    title: "Estação de Metrô com Acessibilidade Básica",
    date: "2025-06-02T14:00:00Z",
    locationName: "Estação Central de Metrô",
    streetName: "Rua da Estação, 77",
    image:
      metro,
    description:
      "Estação com elevadores e rampas, mas com sinalização visual confusa e ausência de mapas em braile. Banheiros adaptados disponíveis, porém precisam de manutenção.",
    accessibility: ["Elevador", "Rampa", "Banheiro Adaptado"],
    ratings: {
      "user2@example.com": 1,
      "user3@example.com": 0,
    },
    positive: 50,
    negative: 50,
    comments: [],
  },
];


  useEffect(() => {
  const loadInitialPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('posts');
      if (!storedPosts) {
        await AsyncStorage.setItem('posts', JSON.stringify(initialPosts));
      }
    } catch (error) {
      console.log('Erro ao setar posts iniciais:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('posts');
      const parsedPosts = storedPosts
        ? JSON.parse(storedPosts).map(post => ({
            ...post,
            accessibility: Array.isArray(post.accessibility)
              ? post.accessibility
              : post.accessibility
              ? [post.accessibility]
              : [],
          }))
        : [];
      setPosts(parsedPosts);
    } catch (error) {
      console.log('Erro ao carregar posts:', error);
    }
  };

  const init = async () => {
    await loadInitialPosts();
    await loadPosts();
  };

  init();

  const unsubscribe = navigation.addListener('focus', loadPosts);
  return unsubscribe;
}, [navigation]);

  const handleRating = async (postId, rating) => {
    const userEmail = await AsyncStorage.getItem('userEmail');
    if (!userEmail) return;
    const updatedPosts = posts.map(post => {
      if (post.id !== postId) return post;
      const ratingsObj = post.ratings && !Array.isArray(post.ratings) ? { ...post.ratings } : {};
      const newRatingValue = rating === 'useful' ? 1 : 0;
      if (ratingsObj[userEmail] === newRatingValue) return post;
      ratingsObj[userEmail] = newRatingValue;
      const totalRatings = Object.keys(ratingsObj).length;
      const positiveCount = Object.values(ratingsObj).filter(v => v === 1).length;
      const positive = Math.round((positiveCount / totalRatings) * 100);
      const negative = 100 - positive;
      return { ...post, ratings: ratingsObj, positive, negative };
    });
    setPosts(updatedPosts);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const filteredPosts = (filter === 'todos' ? [...posts] : posts.filter(post => post.accessibility.includes(filter))).sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderPost = ({ item }) => (

    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
      activeOpacity={0.9}
    >
      {item.image && (
        <Image
          source={typeof item.image === 'string' ? { uri: item.image } : item.image}
          style={styles.postImage}
        />
      )}

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>

        {item.locationName && (
          <Text style={styles.postLocation}>{item.locationName}</Text>
        )}
        {item.streetName && (
          <Text style={styles.postStreet}>{item.streetName}</Text>
        )}

        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>👍 {item.positive ?? 0}%</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>👎 {item.negative ?? 0}%</Text>
          </View>
          {item.accessibility && item.accessibility.length > 0 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                ♿ {item.accessibility.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <TouchableOpacity
            style={styles.ratingButton}
            onPress={() => handleRating(item.id, 'useful')}
          >
            <Text style={styles.ratingText}>Útil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ratingButton}
            onPress={() => handleRating(item.id, 'notUseful')}
          >
            <Text style={styles.ratingText}>Não útil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="user-circle" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>
      {filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="plus-circle" size={60} color="#007BFF" />
          <Text style={styles.emptyText}>Nenhum post cadastrado ainda!</Text>
          <Text style={styles.emptySubText}>Seja o primeiro a publicar um post!</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.emptyButtonText}>Criar Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          style={styles.postList}
        />
      )}
      {filteredPosts.length > 0 && (
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createPostText}>+ Novo Post</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    height: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  profileIcon: {
    padding: 10,
  },

  postList: {
    flex: 1,
  },

  // 🔥 Card do Post
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  postImage: {
    width: '100%',
    height: 180,
  },

  postContent: {
    padding: 16,
  },

  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  postLocation: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 2,
    fontWeight: '600',
  },

  postStreet: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },

  postDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },

  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  tagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },

  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  ratingButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },

  ratingText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // 🔘 Botão flutuante
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  createPostText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 🚫 Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },

  emptySubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },

  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default Home;