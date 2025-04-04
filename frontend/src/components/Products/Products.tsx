import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Modal,
    Alert,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TablePagination,
    Paper,
    TableRow,
    TableCell,
    Avatar,
    IconButton,
} from '@mui/material';
import { Product } from '../../types/models';
import ProductForm from './ProductForm';
import { ProductService } from '../../services/ProductService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FilterBar from '../common/FilterBar';
import { useSnackbar } from 'notistack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const Products: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [minStock, setMinStock] = useState<string>('');
    const [maxStock, setMaxStock] = useState<string>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const queryClient = useQueryClient();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: ProductService.getAll,
    });

    const categories = useMemo(() => {
        const uniqueCategories = new Set(products.map(p => p.categoryName || ''));
        return Array.from(uniqueCategories).map(category => ({
            value: category,
            label: category
        }));
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const searchMatch = 
                searchText === '' ||
                product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchText.toLowerCase());

            const categoryMatch = 
                !selectedCategory ||
                product.categoryName === selectedCategory;

            const minStockMatch = 
                minStock === '' ||
                product.stock >= parseInt(minStock);

            const maxStockMatch = 
                maxStock === '' ||
                product.stock <= parseInt(maxStock);

            return searchMatch && categoryMatch && minStockMatch && maxStockMatch;
        });
    }, [products, searchText, selectedCategory, minStock, maxStock]);

    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const createMutation = useMutation({
        mutationFn: ProductService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleClose();
            enqueueSnackbar('Producto creado exitosamente', { 
                variant: 'success',
                autoHideDuration: 6000
            });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al crear el producto', { 
                variant: 'error',
                autoHideDuration: 6000,
                action: <Button color="inherit" size="small" onClick={() => closeSnackbar()}>Cerrar</Button>
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, product }: { id: number; product: Partial<Product> }) =>
            ProductService.update(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleClose();
            enqueueSnackbar('Producto actualizado exitosamente', { 
                variant: 'success',
                autoHideDuration: 6000
            });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al actualizar el producto', { 
                variant: 'error',
                autoHideDuration: 6000,
                action: <Button color="inherit" size="small" onClick={() => closeSnackbar()}>Cerrar</Button>
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ProductService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            enqueueSnackbar('Producto eliminado exitosamente', { 
                variant: 'success',
                autoHideDuration: 6000
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message?.includes('transacciones')
                ? 'No se puede eliminar el producto porque tiene transacciones asociadas.'
                : error.response?.data?.message || 'Error al eliminar el producto';

            enqueueSnackbar(errorMessage, { 
                variant: 'error',
                autoHideDuration: 6000,
                action: <Button color="inherit" size="small" onClick={() => closeSnackbar()}>Cerrar</Button>
            });
        }
    });

    const handleSubmit = async (product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
        try {
            if (editingProduct) {
                return await updateMutation.mutateAsync({
                    id: editingProduct.productId,
                    product: {
                        ...product,
                        productId: editingProduct.productId
                    }
                });
            }
            return await createMutation.mutateAsync(product);
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
                filterOptions={[{
                    value: selectedCategory,
                    options: categories,
                    label: 'Categoría',
                    onChange: (value) => setSelectedCategory(value.toString())
                }]}
                numericFilters={[
                    {
                        label: 'Stock mínimo',
                        value: minStock,
                        onChange: setMinStock
                    },
                    {
                        label: 'Stock máximo',
                        value: maxStock,
                        onChange: setMaxStock
                    }
                ]}
                onClearFilters={handleClearFilters}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Imagen</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Precio</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProducts.map((product) => (
                            <TableRow key={product.productId}>
                                <TableCell>
                                    <Avatar
                                        src={product.imageUrl}
                                        alt={product.name}
                                        variant="rounded"
                                        sx={{ width: 50, height: 50 }}
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>{product.categoryName || 'Sin categoría'}</TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(product)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(product.productId)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </TableContainer>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
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
        </Container>
    );
};

export default Products; 