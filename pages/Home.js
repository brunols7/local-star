import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const Home = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem('posts');
        const parsedPosts = storedPosts ? JSON.parse(storedPosts).map(post => ({
          ...post,
          accessibility: Array.isArray(post.accessibility) ? post.accessibility : post.accessibility ? [post.accessibility] : [],
        })) : [];
        setPosts(parsedPosts);
      } catch (error) {
        console.log('Erro ao carregar posts:', error);
      }
    };
    loadPosts();
  
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
      style={styles.postContainer}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postDate}>{new Date(item.date).toLocaleDateString()}</Text>
      {item.locationName && <Text style={styles.postLocation}>{item.locationName}</Text>}
      {item.streetName && <Text style={styles.postStreet}>{item.streetName}</Text>}
      <Text style={styles.postDescription}>{item.description}</Text>
      <Text style={styles.postAccessibility}>
        Acessibilidade: {Array.isArray(item.accessibility) ? item.accessibility.join(', ') : item.accessibility || 'Não especificado'}
      </Text>
      <Text style={styles.postRating}>Útil: {item.positive}% | Não útil: {item.negative}%</Text>
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
  postContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 5,
  },
  postDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  postLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postStreet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  postAccessibility: {
    fontSize: 14,
    color: '#007BFF',
    marginBottom: 5,
  },
  postRating: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 5,
  },
  ratingText: {
    color: '#007BFF',
    fontSize: 14,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
  },
  createPostText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
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