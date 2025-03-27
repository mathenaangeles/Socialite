import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Grid, Card, CardContent, Alert, LinearProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import Sidebar from "../../components/Sidebar";
import { getContents, deleteContent } from '../../slices/contentSlice';

const ContentList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { contents, loading, error } = useSelector(state => state.content);

    const [open, setOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
  
    useEffect(() => {
        dispatch(getContents());
    }, [dispatch]);
  
    const handleDeleteClick = (id) => {
        setSelectedContent(id);
        setOpen(true);
    };
  
    const handleConfirmDelete = () => {
      dispatch(deleteContent(selectedContent));
      setOpen(false);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const graphData = contents.map(content => ({
      title: content.title,
      likes: content.likes,
      shares: content.shares,
      clicks: content.clicks,
      impressions: content.impressions,
    }));

    const barColors = {
      likes: "#ff4081",
      shares: "#2196f3",
      clicks: "#4caf50",
      impressions: "#ff9800"
    };

    const CustomTooltip = ({ active, payload, label }) => {
      const barColor = barColors[payload[0]?.name] || "#fff";
      if (active && payload && payload.length) {
        return (
          <div style={{ backgroundColor: "#212121", color: "#fff", padding: "10px", border: "1px solid #fff" }}>
            <p style={{ fontWeight: "bold", margin: 0 }}>{label}</p>
            <p style={{ margin: 0, color: barColor }}>{`${payload[0].name}: ${payload[0].value}`}</p>
          </div>
        );
      }
      return null;
    };

    if (loading) return <LinearProgress />;
  
    return (
      <Box sx={{ display: "flex", minHeight: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">Contents</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/content/form')} startIcon={<AddIcon />}>
              Create Content
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {error && <Alert severity="error">{error}</Alert>}
          {contents.length === 0 && <Typography>No content found.</Typography>}
          {contents.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contents.map(content => (
                    <TableRow key={content.id} sx={{
                      transition: "0.2s",
                      '&:hover': { bgcolor: "#424242" }
                    }}>
                      <TableCell>
                        <Link 
                            to={`/content/${content.id}`} 
                            style={{ color: "inherit", fontWeight: "bold" }}
                        >
                            {content.title}
                        </Link>
                      </TableCell>
                      <TableCell>{content.channel}</TableCell>
                      <TableCell>{content.type}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => navigate(`/content/form/${content.id}`)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteClick(content.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">Total Likes</Typography>
                  <Divider sx={{ mt: 1, mb: 2 }}/>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={false} />
                      <YAxis tick={{ fill: "#ffffff" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="likes" fill={barColors.likes} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">Total Shares</Typography>
                  <Divider sx={{ mt: 1, mb: 2 }}/>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={false} />
                      <YAxis tick={{ fill: "#ffffff" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="shares" fill={barColors.shares} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">Total Clicks</Typography>
                  <Divider sx={{ mt: 1, mb: 2 }}/>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={false}/>
                      <YAxis tick={{ fill: "#ffffff" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="clicks" fill={barColors.clicks} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">Total Impressions</Typography>
                  <Divider sx={{ mt: 1, mb: 2 }}/>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={false} />
                      <YAxis tick={{ fill: "#ffffff" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="impressions" fill={barColors.impressions} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle fontWeight="bold">Confirm Deletion</DialogTitle>
            <Divider/>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this content? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleClose} color="secondary" variant="outlined">Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  };
  
  export default ContentList;
  