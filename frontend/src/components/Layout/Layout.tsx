import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            bgcolor: 'background.default'
        }}>
            <Navbar />
            <Container 
                component="main" 
                sx={{ 
                    mt: 4, 
                    mb: 4, 
                    flex: 1,
                    position: 'relative'
                }}
            >
                {children}
            </Container>
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: 'primary.main',
                    color: 'white'
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" align="center">
                        © {new Date().getFullYear()} Sistema de Gestión de Inventario
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout; 