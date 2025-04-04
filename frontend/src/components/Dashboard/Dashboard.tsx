import React from 'react';
import { 
    Typography, 
    Box, 
    Container, 
    Paper,
    CircularProgress
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/CategoryService';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}> = ({ title, value, icon, color }) => (
    <Paper 
        elevation={3}
        sx={{ 
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                p: 2,
                color: color,
                opacity: 0.2,
                transform: 'scale(2)',
                transformOrigin: 'top right'
            }}
        >
            {icon}
        </Box>
        <Typography variant="h6" gutterBottom color="text.secondary">
            {title}
        </Typography>
        <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>
            {value}
        </Typography>
    </Paper>
);

const Dashboard: React.FC = () => {
    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: ProductService.getAll
    });

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: CategoryService.getAll
    });

    const totalProducts = products.length;
    const totalCategories = categories.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    if (isLoadingProducts || isLoadingCategories) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.main'
                    }}
                >
                    Dashboard
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 3,
                        mb: 3 
                    }}>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                            <StatCard
                                title="Total Productos"
                                value={totalProducts}
                                icon={<InventoryIcon />}
                                color="#2196f3"
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                            <StatCard
                                title="Total Categorías"
                                value={totalCategories}
                                icon={<CategoryIcon />}
                                color="#4caf50"
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                            <StatCard
                                title="Stock Bajo"
                                value={lowStockProducts}
                                icon={<WarningIcon />}
                                color="#f44336"
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                            <StatCard
                                title="Valor Total"
                                value={`$${totalValue.toFixed(2)}`}
                                icon={<AttachMoneyIcon />}
                                color="#ff9800"
                            />
                        </Box>
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: 3,
                        mt: 2 
                    }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                            <Paper 
                                elevation={3}
                                sx={{ 
                                    p: 3,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    Productos con Stock Bajo
                                </Typography>
                                {products
                                    .filter(p => p.stock < 10)
                                    .map(product => (
                                        <Box 
                                            key={product.productId} 
                                            sx={{ 
                                                mt: 2,
                                                p: 2,
                                                bgcolor: 'error.light',
                                                borderRadius: 1,
                                                color: 'error.contrastText'
                                            }}
                                        >
                                            <Typography variant="subtitle1">
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                Stock actual: {product.stock} unidades
                                            </Typography>
                                        </Box>
                                    ))
                                }
                                {products.filter(p => p.stock < 10).length === 0 && (
                                    <Typography variant="body1" color="text.secondary">
                                        No hay productos con stock bajo
                                    </Typography>
                                )}
                            </Paper>
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                            <Paper 
                                elevation={3}
                                sx={{ 
                                    p: 3,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="h6" gutterBottom color="text.secondary">
                                    Productos más Valiosos
                                </Typography>
                                {products
                                    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
                                    .slice(0, 5)
                                    .map(product => (
                                        <Box 
                                            key={product.productId} 
                                            sx={{ 
                                                mt: 2,
                                                p: 2,
                                                bgcolor: 'primary.light',
                                                borderRadius: 1,
                                                color: 'primary.contrastText'
                                            }}
                                        >
                                            <Typography variant="subtitle1">
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                Valor total: ${(product.price * product.stock).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))
                                }
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard; 