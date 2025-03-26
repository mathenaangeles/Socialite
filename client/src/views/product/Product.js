import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { TableBody, Grid, Tooltip, IconButton, Box, Card, CardMedia, Typography, CardContent, LinearProgress, Alert, Divider, Paper, Table, TableRow, TableCell, TableContainer } from "@mui/material";
import { Edit as EditIcon, ChevronRight as ChevronRightIcon, Link as LinkIcon} from '@mui/icons-material';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  const settings = {
    dots: true,
    infinite: product?.images?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const parseImages = () => {
    if (typeof product?.images === 'string') {
      try {
        return JSON.parse(product.images);
      } catch {
        return product.images?.split(',') || [];
      }
    }
    return Array.isArray(product?.images) ? product.images : [];
  };

  const images = parseImages();

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 5 }}>
        <Card sx={{ maxWidth: 1200, margin: 'auto', borderRadius: 2, boxShadow: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 3 
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
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
                {product?.name || 'Untitled'}
              </Typography>
                    
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ fontWeight: 'bold', color: (theme) => theme.palette.text.primary, flexGrow: 1 }}
                >
                  {product?.name || 'Untitled'}
                </Typography>
                <Tooltip title="Edit">
                  <IconButton color="secondary" onClick={() => navigate(`/product/form/${id}`)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          {images.length > 0 && (
            <Box sx={{ maxWidth: 600, margin: 'auto', mb: 2, p: 2 }}>
              <Slider {...settings}>
                {images.map((img, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: 250,
                      overflow: 'hidden'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={`Image ${index + 1}`}
                      sx={{ 
                        maxHeight: "100%", 
                        maxWidth: "100%", 
                        objectFit: "contain",
                        borderRadius: 2
                      }}
                    />
                  </Box>
                ))}
              </Slider>
            </Box>
          )}
          <CardContent>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                  {product?.description && (
                    <Grid item xs={12} sx={{ mb: 1 }}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body1">{product?.description}</Typography>
                      </Paper>
                    </Grid>
                  )}
              </Grid>
              <Grid item xs={12}>
                  <Typography variant="h5" sx={{ mb: 1 }}>Product Information</Typography>
                  <Divider sx={{ mb: 2 }}/>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <LinkIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Price
                          </TableCell>
                          <TableCell>
                            {product?.price && product?.currency ? (
                              <>{product?.price?.toFixed(2) || "0.00"} {product?.currency}</>
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <LinkIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Category
                          </TableCell>
                          <TableCell>
                            {product?.category ? (
                              <>{product?.category || "0.00"}</>
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

    

    {/* <Box component="main" sx={{ flexGrow: 1, p: 3, display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: "90%", maxWidth: 900, p: 3 }}>

        <CardContent>
          <Typography variant="h6">Category: {product?.category || "N/A"}</Typography>
          <Typography variant="h6">Price: {product?.currency} {product?.price?.toFixed(2) || "0.00"}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => navigate(`/product/form/${id}`)}>
              Edit
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box> */}
  </Box>
  );
};

export default Product;
