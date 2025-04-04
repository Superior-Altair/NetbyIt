export interface Product {
    productId: number;
    name: string;
    description?: string;
    categoryId: number;
    category?: {
        categoryId: number;
        name: string;
        description?: string;
    };
    imageUrl?: string;
    price: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    transactionId: number;
    transactionDate: string;
    transactionTypeId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    details?: string;
    createdAt: string;
    transactionType?: {
        transactionTypeId: number;
        name: string;
        type: 'IN' | 'OUT';
    };
    product?: {
        productId: number;
        name: string;
        description?: string;
        price: number;
    };
} 