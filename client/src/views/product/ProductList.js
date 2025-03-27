import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Alert, LinearProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import Sidebar from "../../components/Sidebar";
import { getProducts, deleteProduct } from '../../slices/productSlice';

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading, error } = useSelector(state => state.product);

    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
  
    useEffect(() => {
      dispatch(getProducts());
    }, [dispatch]);
  
    const handleDeleteClick = (id) => {
      setSelectedProduct(id);
      setOpen(true);
    };
  
    const handleConfirmDelete = () => {
      dispatch(deleteProduct(selectedProduct));
      setOpen(false);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const chartData = products
    .filter(product => product.sales !== undefined)
    .map(product => ({
        name: product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name,
        sales: product.sales
    }));

    if (loading) return <LinearProgress />;
  
    return (
      <Box sx={{ display: "flex", minHeight: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">Products</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/product/form')} startIcon={<AddIcon />}>
              Add Product
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {error && <Alert severity="error">{error}</Alert>}
          {products.length === 0 && <Typography>No products found.</Typography>}
          {products.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: "bold"}}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id} sx={{
                        transition: "0.2s",
                        '&:hover': { bgcolor: "#424242" }
                    }}>
                      <TableCell>
                        <Link 
                            to={`/product/${product.id}`} 
                            style={{ color: "inherit", fontWeight: "bold" }}
                        >
                            {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price} {product.currency}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => navigate(`/product/form/${product.id}`)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(product.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {chartData.length > 0 && (
              <Paper elevation={2} sx={{ my: 2, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                      Total Sales
                  </Typography>
                  <Divider sx={{ mt: 1, mb: 2 }}/>
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" allowDecimals={false} stroke="#bdbdbd"/>
                          <YAxis dataKey="name" type="category" width={120} stroke="#bdbdbd" tick={{ fontSize: 14 }}/>
                          <Bar dataKey="sales" fill="#7cbedf" barSize={20}/>
                      </BarChart>
                  </ResponsiveContainer>
              </Paper>
          )}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle fontWeight="bold">Confirm Deletion</DialogTitle>
            <Divider/>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleClose} color="secondary" variant="outlined">Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  };
  
  export default ProductList;
  