import axios from 'axios';
import { getRecoil } from 'recoil-nexus';
import { token } from '../Recoil/user';

export const api = axios.create({
    baseURL: `http://${process.env.REACT_APP_IP_ADDR}:5555`,  // Your server's base URL
});

// Add a request interceptor to include the JWT token in the headers
api.interceptors.request.use(
    config => {
        const tkn = getRecoil(token)  // Assuming the token is stored in localStorage
        if (token) {
            config.headers['Authorization'] = tkn;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);