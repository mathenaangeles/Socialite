import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Close as CloseIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { IconButton, Card, Divider, Alert, LinearProgress, TextField, Button, Container, Typography, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

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
  const [sales, setSales] = useState(0);
  const [newImages, setNewImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]); 

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
      setSales(product.sales || 0);
      setExistingImages(product.images || []);
    }
  }, [id, product]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const handleRemoveImage = (index, isExisting) => {
    if (isExisting) {
      setDeletedImages([...deletedImages, existingImages[index]]);
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else {
      setNewImages(newImages.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    productData.append("name", name);
    productData.append("description", description);
    productData.append("price", price);
    productData.append("currency", currency);
    productData.append("category", category);
    productData.append("sales", sales);

    newImages.forEach((image) => productData.append("newImages", image));
    productData.append("deletedImages", JSON.stringify(deletedImages));

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
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
            >
              <Link 
                to="/products" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Products
              </Link> 
              <ChevronRightIcon sx={{ fontSize: 18, mx: 0.5 }} />
              Product Form
            </Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
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
                <TextField
                    fullWidth
                    label="Sales"
                    type="number"
                    value={sales}
                    margin="normal"
                    color="secondary"
                    variant="outlined"
                    onChange={(e) => setSales(e.target.value)}
                    required
                />
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" component="label" color="primary" sx={{ mt: 1 }}>
                    Upload Image
                    <input type="file" multiple hidden onChange={handleImageUpload} />
                    </Button>
                    <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
                      {existingImages.map((image, index) => (
                        <Box key={`existing-${index}`} sx={{ position: "relative", display: "inline-block" }}>
                          <img src={image} alt="Existing" width={100} height={100} style={{ borderRadius: 8, objectFit: "cover" }} />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              transform: "translate(50%, -50%)",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              color: "white",
                              padding: "4px",
                              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                            }}
                            onClick={() => handleRemoveImage(index, true)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}

                      {newImages.map((image, index) => (
                        <Box key={`new-${index}`} sx={{ position: "relative", display: "inline-block" }}>
                          <img src={URL.createObjectURL(image)} alt="New" width={100} height={100} style={{ borderRadius: 8, objectFit: "cover" }} />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              transform: "translate(50%, -50%)",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              color: "white",
                              padding: "4px",
                              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                            }}
                            onClick={() => handleRemoveImage(index, false)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                </Box>
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
