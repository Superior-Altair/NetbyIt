import axios from 'axios';
import { Transaction } from '../types/models';

const API_URL = process.env.REACT_APP_TRANSACTION_SERVICE_URL || 'http://localhost:5008';

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: `${API_URL}/api`
});

// Agregar interceptores para debugging
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

export interface TransactionType {
    transactionTypeId: number;
    name: string;
    type: 'IN' | 'OUT';
}

export const TransactionService = {
    getAll: async (): Promise<Transaction[]> => {
        const response = await api.get('/transactions');
        return response.data;
    },

    getById: async (id: number): Promise<Transaction> => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    getByProduct: async (productId: number): Promise<Transaction[]> => {
        const response = await api.get(`/transactions/product/${productId}`);
        return response.data;
    },

    create: async (transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'transactionType'>): Promise<Transaction> => {
        const response = await api.post('/transactions', {
            ...transaction,
            transactionDate: transaction.transactionDate ? new Date(transaction.transactionDate).toISOString() : new Date().toISOString()
        });
        return response.data;
    },

    update: async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
        if (transaction.transactionDate) {
            transaction.transactionDate = new Date(transaction.transactionDate).toISOString();
        }
        const response = await api.put(`/transactions/${id}`, transaction);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/transactions/${id}`);
    },

    // Métodos adicionales para tipos de transacción
    getTransactionTypes: async (): Promise<TransactionType[]> => {
        const response = await api.get('/transactiontypes');
        return response.data;
    },

    // Método para inicializar tipos de transacción
    initializeTransactionTypes: async (): Promise<TransactionType[]> => {
        const defaultTypes = [
            { name: 'Compra', type: 'IN' as const },
            { name: 'Venta', type: 'OUT' as const }
        ];

        try {
            // Intentar obtener los tipos existentes
            const existingTypes = await TransactionService.getTransactionTypes();
            if (existingTypes.length === 0) {
                // Si no hay tipos, crear los tipos por defecto
                const creationPromises = defaultTypes.map(type => 
                    api.post('/transactiontypes', type)
                );
                await Promise.all(creationPromises);
                return await TransactionService.getTransactionTypes();
            }
            return existingTypes;
        } catch (error) {
            console.error('Error al inicializar tipos de transacción:', error);
            throw error;
        }
    }
}; 