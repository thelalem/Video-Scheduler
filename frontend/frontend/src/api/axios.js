import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const normalizedApiUrl = rawApiUrl.replace(/\/$/, '');

const api = axios.create({
    baseURL: normalizedApiUrl,
});
export default  api