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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService, Category } from '../../services/CategoryService';
import CategoryForm from './CategoryForm';

export const Categories: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: CategoryService.getAll
    });

    const createMutation = useMutation({
        mutationFn: CategoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleClose();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, category }: { id: number, category: Partial<Category> }) =>
            CategoryService.update(id, category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleClose();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: CategoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    const handleSubmit = async (category: Omit<Category, 'categoryId'>) => {
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
            <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Categorías
                </Typography>
                <CategoryForm
                    onSubmit={handleSubmit}
                    title="Nueva Categoría"
                />
            </Box>

            <List>
                {categories.map((category) => (
                    <ListItem
                        key={category.categoryId}
                        secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(category)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(category.categoryId)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemText
                            primary={category.name}
                            secondary={category.description}
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Editar Categoría</DialogTitle>
                <DialogContent>
                    <CategoryForm
                        onSubmit={handleSubmit}
                        initialData={selectedCategory}
                        title="Actualizar"
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
}; 