import { feathers } from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import auth from '@feathersjs/authentication-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;
const API_URL = `http://${API_HOST}:${API_PORT}`
console.log(API_URL);
const restClient = rest(API_URL);

const client = feathers();

client.configure(restClient.axios(axios));

client.configure(
  auth({
    storage: AsyncStorage,
    path: '/authentication',
  })
);

export default client;
