import { feathers } from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import auth from "@feathersjs/authentication-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_HOST = process.env.API_HOST;
const API_PORT = process.env.API_PORT;
const API_URL = `http://${API_HOST}:${API_PORT}`

const restClient = rest(API_URL);

const client = feathers();

client.configure(restClient.axios({ axios }));

client.configure(
  auth({
    storage: AsyncStorage,
  })
);

export default client;