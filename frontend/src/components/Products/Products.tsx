import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Modal,
    Snackbar,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Product } from '../../types/models';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import { ProductService } from '../../services/ProductService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FilterBar from '../common/FilterBar';

export const Products: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Estados para los filtros
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [minStock, setMinStock] = useState<string>('');
    const [maxStock, setMaxStock] = useState<string>('');

    const queryClient = useQueryClient();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: ProductService.getAll,
    });

    // Obtener categorías únicas
    const categories = useMemo(() => {
        const uniqueCategories = new Set(products.map(p => p.category?.name || ''));
        return Array.from(uniqueCategories).map(category => ({
            value: category,
            label: category
        }));
    }, [products]);

    // Filtrar productos
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Filtro por texto (nombre o descripción)
            const searchMatch = 
                !searchText ||
                (product.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                (product.description?.toLowerCase() || '').includes(searchText.toLowerCase());

            // Filtro por categoría
            const categoryMatch = 
                !selectedCategory ||
                product.category?.name === selectedCategory;

            // Filtro por stock mínimo
            const minStockMatch = 
                !minStock ||
                (product.stock ?? 0) >= Number(minStock) || isNaN(Number(minStock));

            // Filtro por stock máximo
            const maxStockMatch = 
                !maxStock ||
                (product.stock ?? 0) <= Number(maxStock) || isNaN(Number(maxStock));

            return searchMatch && categoryMatch && minStockMatch && maxStockMatch;
        });
    }, [products, searchText, selectedCategory, minStock, maxStock]);

    const createMutation = useMutation({
        mutationFn: (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt' | 'category'>) => 
            ProductService.create(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSnackbar({
                open: true,
                message: 'Producto creado exitosamente',
                severity: 'success',
            });
            handleClose();
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: 'Error al crear el producto',
                severity: 'error',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, product }: { id: number, product: Partial<Product> }) =>
            ProductService.update(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSnackbar({
                open: true,
                message: 'Producto actualizado exitosamente',
                severity: 'success',
            });
            handleClose();
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: 'Error al actualizar el producto',
                severity: 'error',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: ProductService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setSnackbar({
                open: true,
                message: 'Producto eliminado exitosamente',
                severity: 'success',
            });
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: 'Error al eliminar el producto',
                severity: 'error',
            });
        },
    });

    const handleSubmit = async (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
        try {
            let response: Product;
            if (editingProduct) {
                response = await updateMutation.mutateAsync({
                    id: editingProduct.productId,
                    product: {
                        ...product,
                        productId: editingProduct.productId
                    }
                });
            } else {
                response = await createMutation.mutateAsync(product);
            }
            handleClose();
            return response;
        } catch (error) {
            console.error('Error al guardar el producto:', error);
            throw error;
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setEditingProduct(undefined);
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleClearFilters = () => {
        setSearchText('');
        setSelectedCategory('');
        setMinStock('');
        setMaxStock('');
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Productos</Typography>
                <Button variant="contained" color="primary" onClick={handleOpen}>
                    Nuevo Producto
                </Button>
            </Box>

            <FilterBar
                searchText={searchText}
                onSearchChange={setSearchText}
                filterOptions={[
                    {
                        value: selectedCategory,
                        options: categories,
                        label: 'Categoría',
                        onChange: (value) => setSelectedCategory(value.toString())
                    }
                ]}
                onClearFilters={handleClearFilters}
                customFilters={[
                    {
                        type: 'number',
                        label: 'Stock mínimo',
                        value: minStock,
                        onChange: setMinStock
                    },
                    {
                        type: 'number',
                        label: 'Stock máximo',
                        value: maxStock,
                        onChange: setMaxStock
                    }
                ]}
            />

            <ProductList 
                products={filteredProducts} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 1,
                }}>
                    <ProductForm
                        onSubmit={handleSubmit}
                        title={editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                        initialData={editingProduct}
                    />
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Products; 