import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { List, ListItemText, ListItem, Box, Typography, Card, CardContent, CardMedia, Grid, Chip, Divider, LinearProgress, Alert, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableRow, Paper} from '@mui/material';
import { Schedule as ScheduleIcon, Edit as EditIcon, ChevronRight as ChevronRightIcon, AccessTime as TimeIcon, Link as LinkIcon, PlayArrow as ChannelIcon, Category as TypeIcon, Mouse as MouseIcon, Share as ShareIcon, Visibility as ImpressionsIcon, Favorite as LikesIcon} from '@mui/icons-material';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Sidebar from "../../components/Sidebar";
import { getContent } from '../../slices/contentSlice';

const Content= () => {
  const { id } = useParams();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { content, loading, error } = useSelector((state) => state.content);

  useEffect(() => {
    if (id) {
      dispatch(getContent(id));
    }
  }, [id, dispatch]);

  const settings = {
    dots: true,
    infinite: content?.media?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const parseTags = () => {
    if (typeof content?.tags === 'string') {
        try {
            const firstParse = JSON.parse(content.tags); 
            return Array.isArray(firstParse) ? firstParse : JSON.parse(firstParse);
        } catch (error) {
            console.error("Error parsing tags:", error);
            return [];
        }
    }
    return Array.isArray(content?.tags) ? content.tags : [];
  };

  const parseMedia = () => {
    if (typeof content?.media === 'string') {
      try {
        return JSON.parse(content.media);
      } catch {
        return content.media?.split(',') || [];
      }
    }
    return Array.isArray(content?.media) ? content.media : [];
  };

  const parseRecommendations = () => {
    if (typeof content?.recommendations === 'string') {
      try {
        return JSON.parse(content.recommendations);
      } catch {
        return [];
      }
    }
    return Array.isArray(content?.recommendations) ? content.recommendations : [];
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const tags = parseTags();
  const media = parseMedia();
  const recommendations = parseRecommendations();

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
                  to="/contents" 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  Contents
                </Link> 
                <ChevronRightIcon sx={{ fontSize: 18, mx: 0.5 }} />
                {content?.title || 'Untitled'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ fontWeight: 'bold', color: (theme) => theme.palette.text.primary, flexGrow: 1 }}
                >
                  {content?.title || 'Untitled'}
                </Typography>
                <Tooltip title="Edit">
                  <IconButton color="secondary" onClick={() => navigate(`/content/form/${id}`)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
              >
                <TimeIcon sx={{ fontSize: 16, mr: 1 }} />
                Created At: {content?.created_at ? new Date(content.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Box>


          {media.length > 0 && (
            <Box sx={{ maxWidth: 600, margin: 'auto', mb: 2, p: 2 }}>
              <Slider {...settings}>
                {media.map((img, index) => (
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
                      alt={`Content ${index + 1}`}
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
            {content?.text && (
            <Grid item xs={12} sx={{ mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>{content.text}</Typography>
                  {Array.isArray(tags) && tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {(tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          color="secondary" 
                          variant="outlined" 
                        />
                      )))}
                  </Box>)}
                </Paper>
              </Grid>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 1 }}>General Information</Typography>
                <Divider sx={{ mb: 2 }}/>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                    <TableRow>
                        <TableCell>
                          <LinkIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Link
                        </TableCell>
                        <TableCell>
                          {content?.link ? (
                            <a 
                              href={content.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {content.link}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <ChannelIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Channel
                        </TableCell>
                        <TableCell>{content?.channel || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <TypeIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Type
                        </TableCell>
                        <TableCell>{content?.type || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <ScheduleIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Scheduled At
                        </TableCell>
                        <TableCell>{content?.scheduled_at ? new Date(content.scheduled_at).toLocaleDateString() : 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1 }}>Objective</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1">{content?.objective || 'N/A'}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1 }}>Audience</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1">{content?.audience || 'N/A'}</Typography>
                </Paper>
              </Grid>

                
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 1 }}>Performance Metrics</Typography>
                <Divider sx={{ mb: 2 }}/>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <ImpressionsIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Impressions
                        </TableCell>
                        <TableCell>{content?.impressions || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <MouseIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Clicks
                        </TableCell>
                        <TableCell>{content?.clicks || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <LikesIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Likes
                        </TableCell>
                        <TableCell>{content?.likes || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <ShareIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Shares
                        </TableCell>
                        <TableCell>{content?.shares || 0}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 1 }}>Evaluation</Typography>
                <Divider sx={{ mb: 2 }}/>
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Score: {content?.score}/10
                    </Typography>
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={content?.score * 10} 
                        color={content?.score < 5 ? "error" : content?.score < 7 ? "warning" : "success"}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                {content?.analysis && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body1">{content.analysis || 'N/A'}</Typography>
                    </Paper>
                  </Grid>
                )}
                {recommendations.length > 0 && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recommendations</Typography>
                    <List dense>
                      {recommendations.map((rec, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            py: 1 
                          }}
                        >
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>         
            </Grid>
          </CardContent>
        </Card>
      </Box>
  </Box>
  );
};

export default Content;