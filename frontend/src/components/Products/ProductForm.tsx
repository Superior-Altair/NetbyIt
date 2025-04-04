import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    CircularProgress,
    SelectChangeEvent,
} from '@mui/material';
import { Product } from '../../types/models';
import { CategoryService } from '../../services/CategoryService';
import { ProductService } from '../../services/ProductService';

type ProductFormData = Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>;

interface ProductFormProps {
    onSubmit: (product: ProductFormData) => Promise<Product>;
    title: string;
    initialData?: Product;
}

interface Category {
    categoryId: number;
    name: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, title, initialData }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        categoryId: initialData?.categoryId || 0,
        imageUrl: initialData?.imageUrl || '',
        price: initialData?.price || 0,
        stock: initialData?.stock || 0,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await CategoryService.getAll();
                setCategories(data);
                if (data.length > 0 && !initialData) {
                    setFormData(prev => ({ ...prev, categoryId: data[0].categoryId }));
                }
            } catch (error) {
                console.error('Error al cargar categorías:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, [initialData]);

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? Number(value) : value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<number>) => {
        setFormData(prev => ({
            ...prev,
            categoryId: Number(e.target.value)
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await onSubmit(formData);
            if (selectedImage && response.productId) {
                const imageData = new FormData();
                imageData.append('image', selectedImage);
                await ProductService.uploadImage(response.productId, imageData);
            }
        } catch (error) {
            console.error('Error al guardar el producto:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label="Nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleTextFieldChange}
                    required
                />

                <TextField
                    fullWidth
                    label="Descripción"
                    name="description"
                    value={formData.description}
                    onChange={handleTextFieldChange}
                    multiline
                    rows={3}
                />

                <FormControl fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleSelectChange}
                        required
                    >
                        {categories.map((category) => (
                            <MenuItem key={category.categoryId} value={category.categoryId}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        type="file"
                        onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload">
                        <Button variant="contained" component="span">
                            Subir Imagen
                        </Button>
                    </label>
                    {imagePreview && (
                        <Box mt={2}>
                            <img
                                src={imagePreview}
                                alt="Vista previa"
                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                            />
                        </Box>
                    )}
                </Box>

                <TextField
                    fullWidth
                    label="Precio"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleTextFieldChange}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                />

                <TextField
                    fullWidth
                    label="Stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleTextFieldChange}
                    required
                    inputProps={{ min: 0 }}
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

export default ProductForm; 