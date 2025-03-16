import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, LinearProgress, Alert, Divider } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { getProduct } from "../../slices/productSlice";

const Product = () => {
  const { id } = useParams();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    if (id) {
      dispatch(getProduct(id));
    }
  }, [id, dispatch]);

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Card sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {product?.name || "Product Name"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {product?.description || "No description available."}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Category: {product?.category || "N/A"}</Typography>
            <Typography variant="h6">Price: {product?.currency} {product?.price?.toFixed(2) || "0.00"}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/edit-product/${id}`)}
              >
                Edit
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
                Back
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Product;
