import axios from 'axios';

const API_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:5007';

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
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

export interface Category {
    categoryId: number;
    name: string;
    description?: string;
}

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        try {
            const response = await api.get('/categories');
            
            const categoriesWithoutName = response.data.filter(
                (category: Category) => !category.name || category.name === ''
            );
            
            if (categoriesWithoutName.length > 0) {
                console.warn('Categorías sin nombre:', categoriesWithoutName);
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
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
        try {
            await api.delete(`/categories/${id}`);
        } catch (error: any) {
            throw error;
        }
    }
}; 