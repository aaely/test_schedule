import axios from 'axios';
import { getRecoil } from 'recoil-nexus';
import { token } from '../Recoil/user';

export const api = axios.create({
    baseURL: `https://${process.env.REACT_APP_IP_ADDR}:${process.env.REACT_APP_PORT}`,  // Your server's base URL
});

// Add a request interceptor to include the JWT token in the headers
api.interceptors.request.use(
    config => {
        const tkn = getRecoil(token)  // Assuming the token is stored in localStorage
        if (tkn) {
            config.headers['Authorization'] = `Bearer ${tkn}`;
        }
        if (config.method === 'post') {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);