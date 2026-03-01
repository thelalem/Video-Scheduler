import axios from 'axios';
import { getToken } from '../utils/auth';   

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});
export default  api