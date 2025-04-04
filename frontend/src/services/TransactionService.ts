import axios from 'axios';
import { Transaction } from '../types/models';

const API_URL = process.env.REACT_APP_TRANSACTION_SERVICE_URL || 'http://localhost:5008';

const api = axios.create({
    baseURL: `${API_URL}/api`
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

export interface TransactionType {
    transactionTypeId: number;
    name: string;
    type: 'IN' | 'OUT';
}

export const TransactionService = {
    getAll: async (): Promise<Transaction[]> => {
        try {
            const response = await api.get('/transactions');
            
            const transactionsWithoutProduct = response.data.filter(
                (transaction: Transaction) => !transaction.productName
            );
            
            const transactionsWithoutType = response.data.filter(
                (transaction: Transaction) => !transaction.transactionTypeName
            );
            
            if (transactionsWithoutProduct.length > 0) {
                console.warn('Algunas transacciones no tienen nombre de producto:', transactionsWithoutProduct);
            }
            
            if (transactionsWithoutType.length > 0) {
                console.warn('Algunas transacciones no tienen nombre de tipo:', transactionsWithoutType);
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener transacciones:', error);
            if (error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    getById: async (id: number): Promise<Transaction> => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    getByProduct: async (productId: number): Promise<Transaction[]> => {
        const response = await api.get(`/transactions/product/${productId}`);
        return response.data;
    },

    create: async (transaction: Omit<Transaction, 'transactionId' | 'createdAt'>): Promise<Transaction> => {
        const createData = {
            transactionDate: transaction.transactionDate ? new Date(transaction.transactionDate).toISOString() : new Date().toISOString(),
            transactionTypeId: transaction.transactionTypeId,
            productId: transaction.productId,
            quantity: transaction.quantity,
            unitPrice: transaction.unitPrice,
            totalPrice: transaction.totalPrice,
            details: transaction.details
        };
        const response = await api.post('/transactions', createData);
        return response.data;
    },

    update: async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
        const updateData = {
            transactionDate: transaction.transactionDate ? new Date(transaction.transactionDate).toISOString() : undefined,
            transactionTypeId: transaction.transactionTypeId,
            productId: transaction.productId,
            quantity: transaction.quantity,
            unitPrice: transaction.unitPrice,
            totalPrice: transaction.totalPrice,
            details: transaction.details
        };
        const response = await api.put(`/transactions/${id}`, updateData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/transactions/${id}`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('La transacción no existe o ya fue eliminada');
            }
            throw error;
        }
    },

    getTransactionTypes: async (): Promise<TransactionType[]> => {
        const response = await api.get('/transactiontypes');
        return response.data;
    },

    initializeTransactionTypes: async (): Promise<TransactionType[]> => {
        const defaultTypes = [
            { name: 'Compra', type: 'IN' as const },
            { name: 'Venta', type: 'OUT' as const }
        ];

        try {
            const existingTypes = await TransactionService.getTransactionTypes();
            if (existingTypes.length === 0) {
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