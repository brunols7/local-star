import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const PostDetail = ({ route }) => {
  const { post } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {post.image && <Image source={{ uri: post.image }} style={styles.image} />}
      <Text style={styles.title}>{post.title}</Text>
      {post.locationName && <Text style={styles.locationName}>{post.locationName}</Text>}
      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.accessibility}>
        Acessibilidade: {Array.isArray(post.accessibility) ? post.accessibility.join(', ') : post.accessibility || 'Não especificado'}
      </Text>
      <Text style={styles.rating}>Útil: {post.positive}% | Não útil: {post.negative}%</Text>
      {post.location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: post.location.latitude,
            longitude: post.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          provider="google"
        >
          <Marker coordinate={post.location} title={post.locationName || post.title} />
        </MapView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 10,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  streetName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  accessibility: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 10,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  }
});

export default PostDetail;