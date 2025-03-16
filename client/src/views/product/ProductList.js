import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LinearProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';


import Sidebar from "../../components/Sidebar";
import { getProducts, deleteProduct } from '../../slices/productSlice';

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading, error } = useSelector(state => state.product);

    const [open, setOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
  
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

    if (loading) return <LinearProgress />;
  
    return (
      <Box sx={{ display: "flex", minHeight: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">Products</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/product/form')}>
              Add Product
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          {products.length === 0 && <Typography>No products found.</Typography>}
          {products.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
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
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  };
  
  export default ProductList;
  