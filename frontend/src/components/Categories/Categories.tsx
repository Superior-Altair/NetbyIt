import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService, Category } from '../../services/CategoryService';
import { useSnackbar } from 'notistack';
import CategoryForm from './CategoryForm';

export const Categories: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: CategoryService.getAll
    });

    const createMutation = useMutation({
        mutationFn: CategoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleClose();
            enqueueSnackbar('Categoría creada exitosamente', { variant: 'success' });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al crear la categoría', { 
                variant: 'error' 
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, category }: { id: number, category: Partial<Category> }) =>
            CategoryService.update(id, category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleClose();
            enqueueSnackbar('Categoría actualizada exitosamente', { variant: 'success' });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al actualizar la categoría', { 
                variant: 'error' 
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: CategoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            enqueueSnackbar('Categoría eliminada exitosamente', { variant: 'success' });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message?.includes('productos')
                ? 'No se puede eliminar la categoría porque tiene productos asociados'
                : error.response?.data?.message || 'Error al eliminar la categoría';
            
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    });

    const handleSubmit = async (category: Omit<Category, 'categoryId'>) => {
        try {
            if (selectedCategory) {
                await updateMutation.mutateAsync({
                    id: selectedCategory.categoryId,
                    category: {
                        ...category,
                        categoryId: selectedCategory.categoryId
                    }
                });
            } else {
                await createMutation.mutateAsync(category);
            }
        } catch (error) {
            console.error('Error al guardar la categoría:', error);
        }
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta categoría?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCategory(undefined);
    };

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    Categorías
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Nueva Categoría
                </Button>
            </Box>

            <List>
                {categories.map((category) => (
                    <ListItem
                        key={category.categoryId}
                        sx={{
                            bgcolor: 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                        secondaryAction={
                            <Box>
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => handleEdit(category)}
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDelete(category.categoryId)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemText
                            primary={category.name}
                            secondary={category.description}
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <CategoryForm
                            onSubmit={handleSubmit}
                            initialData={selectedCategory}
                            title={selectedCategory ? 'Actualizar' : 'Crear'}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Container>
    );
}; 