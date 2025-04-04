export interface Product {
    productId: number;
    name: string;
    description?: string;
    categoryId: number;
    categoryName?: string;
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
    transactionTypeName: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    details?: string;
    createdAt: string;
} 