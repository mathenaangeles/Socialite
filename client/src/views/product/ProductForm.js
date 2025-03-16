import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Divider, Alert, LinearProgress, TextField, Button, Container, Typography, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { createProduct, updateProduct, getProduct } from "../../slices/productSlice";

const ProductForm = () => {
  const { id } = useParams(); 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.product);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("GBP");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getProduct(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || 0);
      setCurrency(product.currency || "GBP");
      setCategory(product.category || "");
    }
  }, [id, product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let productData = {
      name,
      description,
      price,
      currency,
      category,
    };
    if (id) {
      await dispatch(updateProduct({ id, productData }));
      navigate(`/product/form/${id}`);
    } else {
      const newProduct = await dispatch(createProduct(productData));
      if (newProduct.payload?.id) {
        navigate(`/product/form/${newProduct.payload.id}/`);
      }
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Container>
        <Box sx={{ my: 3, p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Card sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {id ? "Edit Product" : "New Product"}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                margin="normal"
                color="secondary"
                variant="outlined"
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                margin="normal"
                color="secondary"
                variant="outlined"
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={3}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={price}
                margin="normal"
                color="secondary"
                variant="outlined"
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel color="secondary">Currency</InputLabel>
                <Select
                  value={currency}
                  label="Currency"
                  color="secondary"
                  margin="normal"
                  variant="outlined"
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="PHP">PHP</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Category"
                value={category}
                margin="normal"
                color="secondary"
                variant="outlined"
                onChange={(e) => setCategory(e.target.value)}
              />
              <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  Submit
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductForm;
