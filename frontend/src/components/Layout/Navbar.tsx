import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const Navbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string): boolean => {
        return location.pathname === path;
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/categories', label: 'Categorías', icon: <CategoryIcon /> },
        { path: '/products', label: 'Productos', icon: <InventoryIcon /> },
        { path: '/transactions', label: 'Transacciones', icon: <SwapHorizIcon /> },
    ];

    return (
        <AppBar position="static" elevation={2}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1,
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        Sistema de Inventarios
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {navItems.map(({ path, label, icon }) => (
                            <Button
                                key={path}
                                color="inherit"
                                component={RouterLink}
                                to={path}
                                startIcon={icon}
                                sx={{
                                    backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    display: { xs: 'none', sm: 'flex' }
                                }}
                            >
                                {label}
                            </Button>
                        ))}
                        {navItems.map(({ path, icon }) => (
                            <Button
                                key={`mobile-${path}`}
                                color="inherit"
                                component={RouterLink}
                                to={path}
                                sx={{
                                    minWidth: 'unset',
                                    backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    display: { xs: 'flex', sm: 'none' }
                                }}
                            >
                                {icon}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 