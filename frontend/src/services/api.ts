import axios from 'axios';
import { Product, Transaction } from '../types/models';

const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:5007';
const TRANSACTION_SERVICE_URL = process.env.REACT_APP_TRANSACTION_SERVICE_URL || 'http://localhost:5008';

const productApi = axios.create({
    baseURL: PRODUCT_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const transactionApi = axios.create({
    baseURL: TRANSACTION_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const productService = {
    getAll: () => productApi.get<Product[]>('/api/products'),
    getById: (id: number) => productApi.get<Product>(`/api/products/${id}`),
    create: (data: any) => productApi.post<Product>('/api/products', data),
    update: (id: number, data: any) => productApi.put<Product>(`/api/products/${id}`, data),
    delete: (id: number) => productApi.delete(`/api/products/${id}`),
};

export const transactionService = {
    getAll: () => transactionApi.get<Transaction[]>('/api/transactions'),
    getById: (id: number) => transactionApi.get<Transaction>(`/api/transactions/${id}`),
    create: (data: any) => transactionApi.post<Transaction>('/api/transactions', data),
    getByProduct: (productId: number) => transactionApi.get<Transaction[]>(`/api/transactions/product/${productId}`),
}; 