import React, { useState } from 'react';
import {
    TextField,
    Button,
    Stack,
    Box,
} from '@mui/material';
import { Category } from '../../services/CategoryService';

interface CategoryFormProps {
    onSubmit: (category: Omit<Category, 'categoryId'>) => void;
    title?: string;
    initialData?: Category;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    onSubmit,
    title = 'Nueva Categoría',
    initialData,
}) => {
    const [formData, setFormData] = useState<Omit<Category, 'categoryId'>>({
        name: initialData?.name || '',
        description: initialData?.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label="Nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <TextField
                    fullWidth
                    label="Descripción"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                >
                    {title}
                </Button>
            </Stack>
        </Box>
    );
};

export default CategoryForm; 