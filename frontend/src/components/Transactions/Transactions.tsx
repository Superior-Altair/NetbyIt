import React, { useState, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    Alert,
    Snackbar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '../../services/TransactionService';
import { Transaction } from '../../types/models';
import TransactionForm from './TransactionForm';
import FilterBar from '../common/FilterBar';

export const Transactions: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Estados para los filtros
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');

    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading, error } = useQuery({
        queryKey: ['transactions'],
        queryFn: TransactionService.getAll,
        retry: 1
    });

    // Obtener tipos de transacción únicos
    const transactionTypes = useMemo(() => {
        const types = new Set(transactions.map(t => t.transactionType?.name || ''));
        return Array.from(types).map(type => ({
            value: type,
            label: type
        }));
    }, [transactions]);

    // Filtrar transacciones
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // Filtro por texto (producto o detalles)
            const searchMatch = 
                searchText === '' ||
                transaction.product?.name.toLowerCase().includes(searchText.toLowerCase()) ||
                transaction.details?.toLowerCase().includes(searchText.toLowerCase());

            // Filtro por fecha desde
            const fromMatch = 
                !dateFrom ||
                new Date(transaction.transactionDate) >= new Date(dateFrom);

            // Filtro por fecha hasta
            const toMatch = 
                !dateTo ||
                new Date(transaction.transactionDate) <= new Date(dateTo);

            // Filtro por tipo
            const typeMatch = 
                !selectedType ||
                transaction.transactionType?.name === selectedType;

            return searchMatch && fromMatch && toMatch && typeMatch;
        });
    }, [transactions, searchText, dateFrom, dateTo, selectedType]);

    const createMutation = useMutation({
        mutationFn: TransactionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleClose();
            showSnackbar('Transacción creada exitosamente', 'success');
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || 'Error al crear la transacción', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, transaction }: { id: number, transaction: Partial<Transaction> }) =>
            TransactionService.update(id, transaction),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleClose();
            showSnackbar('Transacción actualizada exitosamente', 'success');
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || 'Error al actualizar la transacción', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: TransactionService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            showSnackbar('Transacción eliminada exitosamente', 'success');
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || 'Error al eliminar la transacción', 'error');
        }
    });

    const handleSubmit = async (transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'transactionType'>): Promise<Transaction> => {
        try {
            let response: Transaction;
            if (selectedTransaction) {
                response = await updateMutation.mutateAsync({
                    id: selectedTransaction.transactionId,
                    transaction: {
                        ...transaction,
                        transactionId: selectedTransaction.transactionId
                    }
                });
            } else {
                response = await createMutation.mutateAsync(transaction);
            }
            handleClose();
            return response;
        } catch (error) {
            console.error('Error en la operación:', error);
            throw error;
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta transacción?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Error al eliminar:', error);
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTransaction(undefined);
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleClearFilters = () => {
        setSearchText('');
        setDateFrom('');
        setDateTo('');
        setSelectedType('');
    };

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">
                    Error al cargar las transacciones. Por favor, intente más tarde.
                </Alert>
            </Container>
        );
    }

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
                    Transacciones
                </Typography>
                <TransactionForm
                    onSubmit={handleSubmit}
                    title="Nueva Transacción"
                />
            </Box>

            <FilterBar
                searchText={searchText}
                onSearchChange={setSearchText}
                dateFrom={dateFrom}
                onDateFromChange={setDateFrom}
                dateTo={dateTo}
                onDateToChange={setDateTo}
                filterOptions={[
                    {
                        value: selectedType,
                        options: transactionTypes,
                        label: 'Tipo',
                        onChange: (value) => setSelectedType(value.toString())
                    }
                ]}
                onClearFilters={handleClearFilters}
            />

            {filteredTransactions.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No hay transacciones que coincidan con los filtros.
                </Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Producto</TableCell>
                                <TableCell>Cantidad</TableCell>
                                <TableCell>Precio Unitario</TableCell>
                                <TableCell>Precio Total</TableCell>
                                <TableCell>Detalles</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.transactionId}>
                                    <TableCell>
                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.transactionType?.name}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.product?.name}
                                    </TableCell>
                                    <TableCell>{transaction.quantity}</TableCell>
                                    <TableCell>
                                        ${transaction.unitPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        ${transaction.totalPrice.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{transaction.details}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(transaction)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(transaction.transactionId)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Editar Transacción</DialogTitle>
                <DialogContent>
                    <TransactionForm
                        onSubmit={handleSubmit}
                        initialData={selectedTransaction}
                        title="Actualizar"
                    />
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}; 