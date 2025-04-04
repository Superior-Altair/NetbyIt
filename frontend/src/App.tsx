import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, Container, CssBaseline } from '@mui/material';
import Layout from './components/Layout/Layout';
import ProductList from './components/Products/ProductList';
import TransactionList from './components/Transactions/TransactionList';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import { Product } from './types/models';
import { Categories } from './components/Categories/Categories';
import { Transactions } from './components/Transactions/Transactions';

// Crear el cliente de React Query
const queryClient = new QueryClient();

// Crear el tema de Material-UI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const handleEdit = (product: Product) => {
    // Lógica para editar el producto
  };

  const handleDelete = (id: number) => {
    // Lógica para eliminar el producto
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg">
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/transactions" element={<Transactions />} />
              </Routes>
            </Layout>
          </Router>
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 