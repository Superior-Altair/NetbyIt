import axios from 'axios';
import { Product } from '../types/models';

const API_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:5007';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Agregar interceptor para ver los datos de las peticiones
api.interceptors.request.use(request => {
    console.log('Request:', JSON.stringify({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers
    }, null, 2));
    return request;
});

// Agregar interceptor para ver las respuestas
api.interceptors.response.use(
    response => {
        console.log('Response:', JSON.stringify({
            status: response.status,
            data: response.data,
            headers: response.headers
        }, null, 2));
        return response;
    },
    error => {
        console.error('Error:', JSON.stringify({
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            details: error.response?.data?.error
        }, null, 2));
        return Promise.reject(error);
    }
);

export const ProductService = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get('/api/products');
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get(`/api/products/${id}`);
        return response.data;
    },

    create: async (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt' | 'category'>): Promise<Product> => {
        console.log('Creating product with data:', JSON.stringify(product, null, 2));
        const response = await api.post('/api/products', product);
        return response.data;
    },

    update: async (id: number, product: Partial<Product>): Promise<Product> => {
        const response = await api.put(`/api/products/${id}`, product);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/products/${id}`);
    },

    uploadImage: async (productId: number, formData: FormData): Promise<{ imageUrl: string }> => {
        const response = await api.post(`/api/products/${productId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}; 