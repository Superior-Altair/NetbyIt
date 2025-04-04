import axios from 'axios';
import { Product } from '../types/models';

const API_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:5007';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(request => {
    console.log('Request:', JSON.stringify({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers
    }, null, 2));
    return request;
});

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
        try {
            const response = await api.get('/api/products');
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get(`/api/products/${id}`);
        return response.data;
    },

    create: async (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
        const response = await api.post('/api/products', {
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
            price: product.price,
            stock: product.stock
        });
        return response.data;
    },

    update: async (id: number, product: Partial<Product>): Promise<Product> => {
        const updateData = {
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
            price: product.price,
            stock: product.stock
        };
        const response = await api.put(`/api/products/${id}`, updateData);
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