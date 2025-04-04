import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { Product } from '../../types/models';
import ProductForm from './ProductForm';

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
    title: string;
    initialData?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({
    open,
    onClose,
    onSubmit,
    title,
    initialData,
}) => {
    const handleSubmit = async (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
        const response = await onSubmit(product);
        onClose();
        return response;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <ProductForm
                    onSubmit={handleSubmit}
                    initialData={initialData}
                    title={title}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button type="submit" form="product-form" color="primary">
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductModal; 