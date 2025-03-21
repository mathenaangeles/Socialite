import Slider from "react-slick";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button, LinearProgress, Alert, Divider } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { getContent } from "../../slices/contentSlice";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Content = () => {
  const { id } = useParams();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { content, loading, error } = useSelector((state) => state.content);

  useEffect(() => {
    if (id) {
      dispatch(getContent(id));
    }
  }, [id, dispatch]);

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const settings = {
    dots: true,
    infinite: content.media.length > 1,
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
          {content?.media?.length > 0 ? (
            <Slider {...settings}>
              {content.images.map((img, index) => (
                <Box key={index} sx={{ display: "flex", justifyContent: "center" }}>
                  <img 
                    src={img} 
                    alt={`Content ${index + 1}`} 
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
            {content?.title || "No Title"}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => navigate(`/content/form/${id}`)}>
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

export default Content;
