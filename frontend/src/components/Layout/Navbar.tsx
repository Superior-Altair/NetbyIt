import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sistema de Inventarios
                </Typography>
                <Box>
                    <Button color="inherit" component={RouterLink} to="/">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/categories">
                        Categorías
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/products">
                        Productos
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/transactions">
                        Transacciones
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 