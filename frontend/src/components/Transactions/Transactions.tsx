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
    Button,
    TablePagination,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '../../services/TransactionService';
import { Transaction } from '../../types/models';
import TransactionForm from './TransactionForm';
import FilterBar from '../common/FilterBar';
import { useSnackbar } from 'notistack';

export const Transactions: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const queryClient = useQueryClient();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const { data: transactions = [], isLoading, error } = useQuery({
        queryKey: ['transactions'],
        queryFn: TransactionService.getAll,
        retry: 1
    });

    const transactionTypesMemo = useMemo(() => {
        const types = new Set(transactions.map(t => t.transactionTypeName));
        return Array.from(types).map(type => ({
            value: type,
            label: type
        }));
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const searchMatch = 
                searchText === '' ||
                transaction.productName.toLowerCase().includes(searchText.toLowerCase()) ||
                transaction.details?.toLowerCase().includes(searchText.toLowerCase());

            const fromMatch = 
                !dateFrom ||
                new Date(transaction.transactionDate) >= new Date(dateFrom);

            const toMatch = 
                !dateTo ||
                new Date(transaction.transactionDate) <= new Date(dateTo);

            const typeMatch = 
                !selectedType ||
                transaction.transactionTypeName === selectedType;

            return searchMatch && fromMatch && toMatch && typeMatch;
        });
    }, [transactions, searchText, dateFrom, dateTo, selectedType]);

    const paginatedTransactions = filteredTransactions.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const createMutation = useMutation({
        mutationFn: TransactionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions', 'products'] });
            handleClose();
            enqueueSnackbar('Transacción creada exitosamente', { variant: 'success' });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al crear la transacción', { 
                variant: 'error',
                action: <Button color="inherit" size="small" onClick={() => closeSnackbar()}>Cerrar</Button>
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, transaction }: { id: number, transaction: Partial<Transaction> }) =>
            TransactionService.update(id, transaction),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions', 'products'] });
            handleClose();
            enqueueSnackbar('Transacción actualizada exitosamente', { variant: 'success' });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al actualizar la transacción', { 
                variant: 'error',
                action: <Button color="inherit" size="small" onClick={() => closeSnackbar()}>Cerrar</Button>
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: TransactionService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions', 'products'] });
            enqueueSnackbar('Transacción eliminada exitosamente', { variant: 'success' });
        },
        onError: (error: any) => {
            enqueueSnackbar(error.response?.data?.message || 'Error al eliminar la transacción', { 
                variant: 'error',
                action: <Button color="inherit" size="small" onClick={() => closeSnackbar()}>Cerrar</Button>
            });
        }
    });

    const handleSubmit = async (transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'transactionType'>): Promise<Transaction> => {
        try {
            if (selectedTransaction) {
                return await updateMutation.mutateAsync({
                    id: selectedTransaction.transactionId,
                    transaction: {
                        ...transaction,
                        transactionId: selectedTransaction.transactionId
                    }
                });
            }
            return await createMutation.mutateAsync(transaction);
        } catch (error) {
            console.error('Error en la operación:', error);
            throw error;
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setOpen(true);
    };

    const handleDelete = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;

        try {
            await deleteMutation.mutateAsync(transactionToDelete.transactionId);
        } catch (error) {
            console.error('Error al eliminar:', error);
        } finally {
            setDeleteConfirmOpen(false);
            setTransactionToDelete(null);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTransaction(undefined);
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
                <Typography variant="h4" gutterBottom>
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
                filterOptions={[{
                    value: selectedType,
                    options: transactionTypesMemo,
                    label: 'Tipo',
                    onChange: (value) => setSelectedType(value.toString())
                }]}
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
                            {paginatedTransactions.map((transaction) => (
                                <TableRow key={transaction.transactionId}>
                                    <TableCell>
                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{transaction.transactionTypeName}</TableCell>
                                    <TableCell>{transaction.productName}</TableCell>
                                    <TableCell>{transaction.quantity}</TableCell>
                                    <TableCell>${transaction.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell>${transaction.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>{transaction.details || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(transaction)} title="Editar transacción">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(transaction)} title="Eliminar transacción">
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
                        count={filteredTransactions.length}
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

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {transactionToDelete && (
                            <>
                                ¿Está seguro de que desea eliminar esta transacción?
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2">
                                        Detalles de la transacción:
                                    </Typography>
                                    <Typography variant="body2">
                                        • Tipo: {transactionToDelete.transactionTypeName}<br />
                                        • Producto: {transactionToDelete.productName}<br />
                                        • Cantidad: {transactionToDelete.quantity}<br />
                                        • Fecha: {new Date(transactionToDelete.transactionDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}; 