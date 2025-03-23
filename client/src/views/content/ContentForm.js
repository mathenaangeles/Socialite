import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Close } from "@mui/icons-material";
import { 
  IconButton, Card, Divider, Alert, LinearProgress, TextField, Button, 
  Container, Typography, Box, MenuItem, Select, FormControl, InputLabel,
  Grid, Chip, FormHelperText, Tab, Tabs, Paper
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

import Sidebar from "../../components/Sidebar";
import { createContent, updateContent, getContent } from "../../slices/contentSlice";
import { getProducts } from "../../slices/productSlice";

const ContentForm = () => {
  const { id } = useParams(); 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { content, loading, error } = useSelector((state) => state.content);
  const { products } = useSelector((state) => state.product);

  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [type, setType] = useState("");
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [status, setStatus] = useState("Draft");
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [impressions, setImpressions] = useState(0);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [publishedAt, setPublishedAt] = useState(null);
  const [productId, setProductId] = useState("");
  
  // AI generation fields
  const [mode, setMode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [style, setStyle] = useState("");
  const [dimensions, setDimensions] = useState("1024x1024");
  const [keyElements, setKeyElements] = useState("");
  const [numberOfImages, setNumberOfImages] = useState(1);
  
  // Content analytics and feedback
  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    dispatch(getProducts());
    
    if (id) {
      dispatch(getContent(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && content) {
      setTitle(content.title || "");
      setChannel(content.channel || "");
      setType(content.type || "");
      setObjective(content.objective || "");
      setAudience(content.audience || "");
      setStatus(content.status || "Draft");
      setLink(content.link || "");
      setText(content.text || "");
      setTags(content.tags || []);
      setLikes(content.likes || 0);
      setShares(content.shares || 0);
      setClicks(content.clicks || 0);
      setImpressions(content.impressions || 0);
      setScheduledAt(content.scheduled_at ? new Date(content.scheduled_at) : null);
      setPublishedAt(content.published_at ? new Date(content.published_at) : null);
      setProductId(content.product_id || "");
      
      // Set media previews for existing content
      if (content.media && content.media.length > 0) {
        setMediaPreview(content.media.map(url => ({ url })));
      }
      
      // Set analytics data if available
      setScore(content.score || 0);
      setAnalysis(content.analysis || "");
      setRecommendations(content.recommendations || []);
    }
  }, [id, content]);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMedia([...media, ...files]);
    
    // Create previews for uploaded files
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setMediaPreview([...mediaPreview, ...newPreviews]);
  };

  const handleRemoveMedia = (index) => {
    // Remove the file from media array
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setMedia(updatedMedia);
    
    // Remove the preview
    const updatedPreviews = [...mediaPreview];
    updatedPreviews.splice(index, 1);
    setMediaPreview(updatedPreviews);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
      e.preventDefault();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const contentData = new FormData();
    contentData.append("title", title);
    contentData.append("channel", channel);
    contentData.append("type", type);
    contentData.append("objective", objective);
    contentData.append("audience", audience);
    contentData.append("status", status);
    contentData.append("link", link);
    contentData.append("caption", text);
    contentData.append("tags", JSON.stringify(tags));
    contentData.append("likes", likes);
    contentData.append("shares", shares);
    contentData.append("clicks", clicks);
    contentData.append("impressions", impressions);
    
    if (scheduledAt) {
      contentData.append("scheduled_at", scheduledAt.toISOString());
    }
    
    if (publishedAt) {
      contentData.append("published_at", publishedAt.toISOString());
    }
    
    if (productId) {
      contentData.append("productId", productId);
    }
    
    // If a mode is selected, add AI generation parameters
    if (mode) {
      contentData.append("mode", mode);
      contentData.append("instructions", instructions);
      contentData.append("style", style);
      contentData.append("dimensions", dimensions);
      contentData.append("key_elements", keyElements);
      contentData.append("number_of_images", numberOfImages);
    }
    
    // Add media files if any
    media.forEach((med) => {
      contentData.append("media", med);
    });

    if (id) {
      await dispatch(updateContent({ id, contentData }));
      navigate(`/content/${id}`);
    } else {
      const newContent = await dispatch(createContent(contentData));
      if (newContent.payload?.id) {
        navigate(`/content/${newContent.payload.id}`);
      }
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Container maxWidth="lg">
        <Box sx={{ my: 3, p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {id ? "Edit Content" : "New Content"}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Basic Info" />
              <Tab label="Content" />
              <Tab label="Media" />
              <Tab label="AI Generation" />
              {id && <Tab label="Analytics" />}
            </Tabs>

            <Box component="form" onSubmit={handleSubmit}>
              {/* Basic Info Tab */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={title}
                      margin="normal"
                      variant="outlined"
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Channel</InputLabel>
                      <Select
                        value={channel}
                        label="Channel"
                        onChange={(e) => setChannel(e.target.value)}
                        required
                      >
                        <MenuItem value="Instagram">Instagram</MenuItem>
                        <MenuItem value="Facebook">Facebook</MenuItem>
                        <MenuItem value="Twitter">Twitter</MenuItem>
                        <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                        <MenuItem value="TikTok">TikTok</MenuItem>
                        <MenuItem value="YouTube">YouTube</MenuItem>
                        <MenuItem value="Blog">Blog</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Content Type</InputLabel>
                      <Select
                        value={type}
                        label="Content Type"
                        onChange={(e) => setType(e.target.value)}
                        required
                      >
                        <MenuItem value="Post">Post</MenuItem>
                        <MenuItem value="Story">Story</MenuItem>
                        <MenuItem value="Reel">Reel</MenuItem>
                        <MenuItem value="Video">Video</MenuItem>
                        <MenuItem value="Article">Article</MenuItem>
                        <MenuItem value="Carousel">Carousel</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Objective"
                      value={objective}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={2}
                      onChange={(e) => setObjective(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Audience"
                      value={audience}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={2}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Product</InputLabel>
                      <Select
                        value={productId}
                        label="Product"
                        onChange={(e) => setProductId(e.target.value)}
                      >
                        <MenuItem value="">None</MenuItem>
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                        <MenuItem value="Published">Published</MenuItem>
                        <MenuItem value="Archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Scheduled For"
                        value={scheduledAt}
                        onChange={setScheduledAt}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth margin="normal" />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Link"
                      value={link}
                      margin="normal"
                      variant="outlined"
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Content Tab */}
              {activeTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Text/Caption"
                      value={text}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={6}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Add Tags"
                      value={tagInput}
                      margin="normal"
                      variant="outlined"
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      helperText="Press Enter to add a tag"
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Media Tab */}
              {activeTab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      component="label"
                      color="primary"
                      sx={{ mb: 2 }}
                    >
                      Upload Media
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleMediaUpload}
                        accept="image/*,video/*"
                      />
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {mediaPreview.map((item, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            position: 'relative', 
                            width: 150, 
                            height: 150, 
                            border: '1px solid #ddd',
                            borderRadius: 1
                          }}
                        >
                          <img 
                            src={item.url} 
                            alt={`Media ${index}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}
                            onClick={() => handleRemoveMedia(index)}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* AI Generation Tab */}
              {activeTab === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Generation Mode</InputLabel>
                      <Select
                        value={mode}
                        label="Generation Mode"
                        onChange={(e) => setMode(e.target.value)}
                      >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="full">Full Generation (Text & Media)</MenuItem>
                        <MenuItem value="content_only">Text Only</MenuItem>
                        <MenuItem value="media_only">Media Only</MenuItem>
                        <MenuItem value="evaluation_only">Evaluate Current Content</MenuItem>
                      </Select>
                      <FormHelperText>Select AI generation mode</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Instructions"
                      value={instructions}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={3}
                      onChange={(e) => setInstructions(e.target.value)}
                      helperText="Additional instructions for AI content generation"
                    />
                  </Grid>

                  {(mode === "full" || mode === "media_only") && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Style"
                          value={style}
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => setStyle(e.target.value)}
                          helperText="Image style description (e.g., minimalist, vibrant, vintage)"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Dimensions</InputLabel>
                          <Select
                            value={dimensions}
                            label="Dimensions"
                            onChange={(e) => setDimensions(e.target.value)}
                          >
                            <MenuItem value="1024x1024">1024x1024 (Square)</MenuItem>
                            <MenuItem value="1024x1792">1024x1792 (Portrait)</MenuItem>
                            <MenuItem value="1792x1024">1792x1024 (Landscape)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Key Elements"
                          value={keyElements}
                          margin="normal"
                          variant="outlined"
                          multiline
                          rows={2}
                          onChange={(e) => setKeyElements(e.target.value)}
                          helperText="Key elements to include in generated images (comma-separated)"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Number of Images"
                          value={numberOfImages}
                          margin="normal"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 1, max: 4 } }}
                          onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              {/* Analytics Tab (only for edit) */}
              {activeTab === 4 && id && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">Performance Metrics</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Likes"
                            value={likes}
                            margin="normal"
                            variant="outlined"
                            onChange={(e) => setLikes(parseInt(e.target.value))}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Shares"
                            value={shares}
                            margin="normal"
                            variant="outlined"
                            onChange={(e) => setShares(parseInt(e.target.value))}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Clicks"
                            value={clicks}
                            margin="normal"
                            variant="outlined"
                            onChange={(e) => setClicks(parseInt(e.target.value))}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Impressions"
                            value={impressions}
                            margin="normal"
                            variant="outlined"
                            onChange={(e) => setImpressions(parseInt(e.target.value))}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        AI Content Score: {score}/10
                      </Typography>
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={score * 10} 
                          color={score < 5 ? "error" : score < 7 ? "warning" : "success"}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">Content Analysis</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {analysis || "No analysis available"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">Recommendations</Typography>
                      <Divider sx={{ my: 1 }} />
                      {recommendations && recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                          <Box key={index} sx={{ py: 0.5 }}>
                            • {rec}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2">No recommendations available</Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                >
                  {id ? "Update" : "Create"} {mode ? "& Generate" : ""}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate(-1)}
                >
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

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { Close } from "@mui/icons-material";
// import { IconButton, Card, Divider, Alert, LinearProgress, TextField, Button, Container, Typography, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

// import Sidebar from "../../components/Sidebar";
// import { createContent, updateContent, getContent } from "../../slices/contentSlice";

// const ContentForm = () => {
//   const { id } = useParams(); 

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { content, loading, error } = useSelector((state) => state.content);

//   const [title, setTitle] = useState("");
//   const [channel, setChannel] = useState("");
//   const [type, setType] = useState("");
//   const [objective, setObjective] = useState("");
//   const [audience, setAudience] = useState("");
//   const [status, setStatus] = useState("");
//   const [link, setLink] = useState("");
//   const [text, setText] = useState("");
//   const [media, setMedia] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [likes, setLikes] = useState(0);
//   const [shares, setShares] = useState(0);
//   const [clicks, setClicks] = useState(0);
//   const [impressions, setImpressions] = useState(0);
//   const [scheduledAt, setScheduledAt] = useState(new Date());
//   const [publishedAt, setPublishedAt] = useState(new Date());
//   const [mode, setMode] = useState("");

//   const handleMediaUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setMedia([...media, ...files]);
//   };

//   const handleRemoveMedia = (index) => {
//     setMedia(media.filter((_, i) => i !== index));
//   };

//   useEffect(() => {
//     if (id) {
//       dispatch(getContent(id));
//     }
//   }, [id, dispatch]);

//   useEffect(() => {
//     if (id && content) {
//       setTitle(content.title || "");
//     }
//   }, [id, content]);


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const contentData = new FormData();
//     contentData.append("title", title);
//     media.forEach((med) => {
//         contentData.append("media", med);
//     });
//     if (id) {
//       await dispatch(updateContent({ id, contentData }));
//       navigate(`/content/form/${id}`);
//     } else {
//       const newContent = await dispatch(createContent(contentData));
//       if (newContent.payload?.id) {
//         navigate(`/content/form/${newContent.payload.id}/`);
//       }
//     }
//   };

//   if (loading) return <LinearProgress />;

//   return (
//     <Box sx={{ display: "flex", minHeight: "100vh" }}>
//       <Sidebar />
//       <Container>
//         <Box sx={{ my: 3, p: 3 }}>
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//           <Card sx={{ p: 3 }}>
//             <Typography variant="h5" sx={{ mb: 2 }}>
//               {id ? "Edit Content" : "New Content"}
//             </Typography>
//             <Divider sx={{ mb: 2 }} />

//             <Box component="form" onSubmit={handleSubmit}>
//                 <TextField
//                     fullWidth
//                     label="Title"
//                     value={title}
//                     margin="normal"
//                     color="secondary"
//                     variant="outlined"
//                     onChange={(e) => setTitle(e.target.value)}
//                     required
//                 />
//                 <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
//                 <Button type="submit" variant="contained" color="primary" disabled={loading}>
//                     Submit
//                 </Button>
//                 <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
//                     Cancel
//                 </Button>
//                 </Box>
//             </Box>
//           </Card>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default ContentForm;
