import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Close } from "@mui/icons-material";
import { IconButton, Card, Divider, Alert, LinearProgress, TextField, Button, Container, Typography, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { createContent, updateContent, getContent } from "../../slices/contentSlice";

const ContentForm = () => {
  const { id } = useParams(); 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { content, loading, error } = useSelector((state) => state.content);

  const [title, setTitle] = useState("");
  const [media, setMedia] = useState([]);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMedia([...media, ...files]);
  };

  const handleRemoveMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (id) {
      dispatch(getContent(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && content) {
      setTitle(content.title || "");
    }
  }, [id, content]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentData = new FormData();
    contentData.append("title", title);
    media.forEach((med) => {
        contentData.append("media", med);
    });
    if (id) {
      await dispatch(updateContent({ id, contentData }));
      navigate(`/content/form/${id}`);
    } else {
      const newContent = await dispatch(createContent(contentData));
      if (newContent.payload?.id) {
        navigate(`/content/form/${newContent.payload.id}/`);
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
              {id ? "Edit Content" : "New Content"}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    margin="normal"
                    color="secondary"
                    variant="outlined"
                    onChange={(e) => setTitle(e.target.value)}
                    required
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

export default ContentForm;
