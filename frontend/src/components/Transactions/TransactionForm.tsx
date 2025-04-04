import React, { useState, useEffect } from 'react';
import {
    TextField,
    Stack,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    SelectChangeEvent,
    Typography,
    Alert,
} from '@mui/material';
import { Transaction } from '../../types/models';
import { ProductService } from '../../services/ProductService';
import { TransactionService, TransactionType } from '../../services/TransactionService';
import { Product } from '../../types/models';

interface TransactionFormProps {
    onSubmit: (transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'transactionType'>) => void;
    title: string;
    initialData?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
    onSubmit,
    title,
    initialData,
}) => {
    const [formData, setFormData] = useState<Omit<Transaction, 'transactionId' | 'createdAt' | 'transactionType'>>({
        transactionDate: new Date().toISOString().split('T')[0],
        transactionTypeId: initialData?.transactionTypeId || 0,
        productId: initialData?.productId || 0,
        quantity: initialData?.quantity || 1,
        unitPrice: initialData?.unitPrice || 0,
        totalPrice: initialData?.totalPrice || 0,
        details: initialData?.details || '',
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Inicializar tipos de transacción y cargar productos
                const [productsData, typesData] = await Promise.all([
                    ProductService.getAll(),
                    TransactionService.initializeTransactionTypes() // Cambiado de getTransactionTypes a initializeTransactionTypes
                ]);
                setProducts(productsData);
                setTransactionTypes(typesData);

                // Si hay productos y no hay un producto seleccionado, seleccionar el primero
                if (productsData.length > 0 && (!initialData || !initialData.productId)) {
                    const firstProduct = productsData[0];
                    setSelectedProduct(firstProduct);
                    setFormData(prev => ({
                        ...prev,
                        productId: firstProduct.productId,
                        unitPrice: firstProduct.price
                    }));
                }

                // Si hay tipos de transacción, seleccionar el tipo "Venta" por defecto
                if (typesData.length > 0) {
                    const ventaType = typesData.find(t => t.type === 'OUT') || typesData[0];
                    setSelectedType(ventaType);
                    setFormData(prev => ({
                        ...prev,
                        transactionTypeId: ventaType.transactionTypeId
                    }));
                }

                // Si hay datos iniciales, cargar el producto y tipo seleccionados
                if (initialData) {
                    const product = productsData.find(p => p.productId === initialData.productId);
                    const type = typesData.find(t => t.transactionTypeId === initialData.transactionTypeId);
                    if (product) setSelectedProduct(product);
                    if (type) setSelectedType(type);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProduct || !selectedType) {
            alert('Por favor, seleccione un producto y un tipo de transacción.');
            return;
        }

        // Validaciones básicas
        if (formData.quantity <= 0) {
            alert('La cantidad debe ser mayor a 0.');
            return;
        }
        if (formData.unitPrice < 0) {
            alert('El precio unitario no puede ser negativo.');
            return;
        }

        // Validaciones específicas según el tipo de transacción
        if (selectedType.type === 'OUT') { // Venta
            if (formData.quantity > selectedProduct.stock) {
                alert(`No hay suficiente stock disponible. Stock actual: ${selectedProduct.stock}`);
                return;
            }
            if (formData.unitPrice < selectedProduct.price) {
                const continuar = window.confirm(
                    `El precio de venta (${formData.unitPrice}) es menor al precio sugerido (${selectedProduct.price}). ¿Desea continuar?`
                );
                if (!continuar) return;
            }
        }

        // Procesar los datos
        const processedData = {
            ...formData,
            transactionTypeId: Number(formData.transactionTypeId),
            productId: Number(formData.productId),
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice),
            totalPrice: Number(formData.quantity) * Number(formData.unitPrice),
        };
        onSubmit(processedData);
    };

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Validar valores numéricos
        if ((name === 'quantity' || name === 'unitPrice') && value !== '') {
            const numValue = Number(value);
            if (numValue < 0) return; // No permitir valores negativos
        }

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: name === 'quantity' || name === 'unitPrice'
                    ? value === '' ? 0 : Number(value)
                    : value,
            };

            // Actualizar totalPrice cuando cambie quantity o unitPrice
            if (name === 'quantity' || name === 'unitPrice') {
                const quantity = name === 'quantity' ? Number(value) : prev.quantity;
                const unitPrice = name === 'unitPrice' ? Number(value) : prev.unitPrice;
                newData.totalPrice = quantity * unitPrice;
            }

            return newData;
        });
    };

    const handleSelectChange = (e: SelectChangeEvent<number>) => {
        const { name, value } = e.target;
        const numValue = Number(value);

        if (name === 'productId') {
            const product = products.find(p => p.productId === numValue);
            setSelectedProduct(product || null);
            // Actualizar el precio unitario al precio sugerido del producto
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue,
                    unitPrice: product.price
                }));
            }
        } else if (name === 'transactionTypeId') {
            const type = transactionTypes.find(t => t.transactionTypeId === numValue);
            setSelectedType(type || null);
            setFormData(prev => ({
                ...prev,
                [name]: numValue
            }));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (products.length === 0) {
        return (
            <Alert severity="warning" sx={{ mt: 2 }}>
                No hay productos disponibles. Por favor, cree un producto primero.
            </Alert>
        );
    }

    if (transactionTypes.length === 0) {
        return (
            <Alert severity="warning" sx={{ mt: 2 }}>
                No hay tipos de transacción disponibles.
            </Alert>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} id="transaction-form">
            <Stack spacing={2}>
                {selectedProduct && selectedType && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {selectedType.type === 'IN' ? 'Compra' : 'Venta'} de {selectedProduct.name}
                        {selectedType.type === 'OUT' && (
                            <Typography component="div" variant="body2">
                                Stock disponible: {selectedProduct.stock} unidades
                                <br />
                                Precio sugerido: ${selectedProduct.price}
                            </Typography>
                        )}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Fecha"
                    name="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={handleTextFieldChange}
                    required
                    InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth required>
                    <InputLabel id="transaction-type-label">Tipo de Transacción</InputLabel>
                    <Select
                        labelId="transaction-type-label"
                        name="transactionTypeId"
                        value={formData.transactionTypeId}
                        label="Tipo de Transacción"
                        onChange={handleSelectChange}
                    >
                        {transactionTypes.map((type) => (
                            <MenuItem key={type.transactionTypeId} value={type.transactionTypeId}>
                                {type.name} ({type.type === 'IN' ? 'Compra' : 'Venta'})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth required>
                    <InputLabel id="product-label">Producto</InputLabel>
                    <Select
                        labelId="product-label"
                        name="productId"
                        value={formData.productId}
                        label="Producto"
                        onChange={handleSelectChange}
                    >
                        {products.map((product) => (
                            <MenuItem key={product.productId} value={product.productId}>
                                {product.name} - Stock: {product.stock} - Precio: ${product.price}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Stack direction="row" spacing={2}>
                    <TextField
                        fullWidth
                        label="Cantidad"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleTextFieldChange}
                        required
                        inputProps={{ min: 1 }}
                        helperText={selectedType?.type === 'OUT' ? `Máximo disponible: ${selectedProduct?.stock || 0}` : ''}
                    />
                    <TextField
                        fullWidth
                        label="Precio Unitario"
                        name="unitPrice"
                        type="number"
                        value={formData.unitPrice}
                        onChange={handleTextFieldChange}
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                        helperText={selectedType?.type === 'OUT' ? `Precio sugerido: $${selectedProduct?.price || 0}` : ''}
                    />
                </Stack>

                <TextField
                    fullWidth
                    label="Precio Total"
                    type="number"
                    value={formData.totalPrice}
                    disabled
                    InputProps={{
                        readOnly: true,
                    }}
                />

                <TextField
                    fullWidth
                    label="Detalles"
                    name="details"
                    value={formData.details}
                    onChange={handleTextFieldChange}
                    multiline
                    rows={3}
                    placeholder={selectedType?.type === 'IN' ? 
                        "Detalles de la compra (proveedor, número de factura, etc.)" : 
                        "Detalles de la venta (cliente, número de factura, etc.)"
                    }
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

export default TransactionForm; 