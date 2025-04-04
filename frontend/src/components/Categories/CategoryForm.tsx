import React, { useState } from 'react';
import {
    TextField,
    Button,
    Stack,
    Box,
} from '@mui/material';
import { Category } from '../../services/CategoryService';

type CategoryFormData = {
    name: string;
    description: string;
};

interface CategoryFormProps {
    onSubmit: (category: CategoryFormData) => void;
    title?: string;
    initialData?: Category;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    onSubmit,
    title = 'Nueva Categoría',
    initialData,
}) => {
    const [formData, setFormData] = useState<CategoryFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
    });

    const [errors, setErrors] = useState({
        name: false,
    });

    const validateForm = (): boolean => {
        const newErrors = {
            name: formData.name.trim().length === 0,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim(),
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: false,
            }));
        }
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
                    error={errors.name}
                    helperText={errors.name ? 'El nombre es requerido' : ''}
                    autoFocus
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