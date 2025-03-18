import Slider from "react-slick";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, LinearProgress, Alert, Divider } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { getProduct } from "../../slices/productSlice";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  const settings = {
    dots: true,
    infinite: product.images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3, display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: "90%", maxWidth: 900, p: 3 }}>
        <Box sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
          {product?.images?.length > 0 ? (
            <Slider {...settings}>
              {product.images.map((img, index) => (
                <Box key={index} sx={{ display: "flex", justifyContent: "center" }}>
                  <img 
                    src={img} 
                    alt={`Product ${index + 1}`} 
                    style={{ width: "100%", maxHeight: 400, objectFit: "contain", borderRadius: "8px" }} 
                  />
                </Box>
              ))}
            </Slider>
          ) : (
            <Typography align="center" color="text.secondary">
              No images available
            </Typography>
          )}
        </Box>
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
            <Button variant="contained" color="primary" onClick={() => navigate(`/edit-product/${id}`)}>
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
