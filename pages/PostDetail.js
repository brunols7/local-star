import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';

const PostDetail = ({ route }) => {
  const { post } = route.params;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const storageKey = `comments_${post.id}`;

  useEffect(() => {
    const loadComments = async () => {
      try {
        const storedComments = await AsyncStorage.getItem(storageKey);
        if (storedComments) {
          setComments(JSON.parse(storedComments));
        }
      } catch (error) {
        console.log('Erro ao carregar comentários', error);
      }
    };
    loadComments();
  }, []);

  const saveComments = async (newComments) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newComments));
    } catch (error) {
      console.log('Erro ao salvar comentários', error);
    }
  };

  const handleDeleteComment = (index) => {
    const newComments = [...comments];
    newComments.splice(index, 1);
    setComments(newComments);
    saveComments(newComments);
  };

  let lastPress = 0;
  const handleCommentPress = (index) => {
    const time = new Date().getTime();
    const delta = time - lastPress;

    const DOUBLE_PRESS_DELAY = 300;

    if (delta < DOUBLE_PRESS_DELAY) {
      handleDeleteComment(index);
    }
    lastPress = time;
  };


  const handleSendComment = () => {
    if (commentText.trim() === '') return;
    const newComments = [...comments, commentText.trim()];
    setComments(newComments);
    saveComments(newComments);
    setCommentText('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={{ flex: 1, backgroundColor: '#EFEFEF' }}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {post.image && (
              <Image
                source={
                  typeof post.image === 'string'
                    ? { uri: post.image }
                    : post.image
                }
                style={styles.image}
              />
            )}
            <View style={styles.content}>
              <Text style={styles.title}>{post.title}</Text>
              {post.locationName && (
                <Text style={styles.locationName}>{post.locationName}</Text>
              )}
              <Text style={styles.description}>{post.description}</Text>
              <Text style={styles.accessibility}>
                Acessibilidade:{' '}
                {Array.isArray(post.accessibility)
                  ? post.accessibility.join(', ')
                  : post.accessibility || 'Não especificado'}
              </Text>
              <Text style={styles.rating}>
                Útil: {post.positive}% | Não útil: {post.negative}%
              </Text>
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
                  <Marker
                    coordinate={post.location}
                    title={post.locationName || post.title}
                  />
                </MapView>
              )}

              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comentários</Text>
                {comments.length === 0 ? (
                  <Text style={styles.noCommentsText}>
                    Nenhum comentário ainda.
                  </Text>
                ) : (
                  comments.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleCommentPress(index)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.commentItem}>
                        <Text style={styles.commentText}>{item}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.newCommentContainer}>
          <TextInput
            style={styles.newCommentInput}
            placeholder="Escreva um comentário..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendComment}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 8,
    lineHeight: 22,
  },
  accessibility: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 8,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  commentText: {
    color: '#333',
    fontSize: 14,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 10,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#DDD',
    elevation: 10,
  },
  newCommentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostDetail;