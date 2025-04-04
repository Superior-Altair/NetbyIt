import axios from 'axios';

const API_URL = 'http://localhost:5007/api';

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: API_URL
});

export interface Category {
    categoryId: number;
    name: string;
    description?: string;
}

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get('/categories');
        return response.data;
    },

    create: async (category: Omit<Category, 'categoryId'>): Promise<Category> => {
        const response = await api.post('/categories', category);
        return response.data;
    },

    update: async (id: number, category: Partial<Category>): Promise<Category> => {
        const response = await api.put(`/categories/${id}`, category);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    }
}; 