import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Profile" component={Profile} options={{ title: 'Perfil' }} />
        <Stack.Screen name="PostDetail" component={PostDetail} options={{ title: 'Detalhes do Post' }} />
        <Stack.Screen name="CreatePost" component={CreatePost} options={{ title: 'Criar Post' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;