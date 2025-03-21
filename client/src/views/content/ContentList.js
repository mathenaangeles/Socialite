import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LinearProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

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

    if (loading) return <LinearProgress />;
  
    return (
      <Box sx={{ display: "flex", minHeight: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold">Contents</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/content/form')}>
              Add Content
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          {contents.length === 0 && <Typography>No content found.</Typography>}
          {contents.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contents.map(content => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <Link 
                            to={`/content/${content.id}`} 
                            style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
                        >
                            {content.title}
                        </Link>
                      </TableCell>
                      <TableCell flex>
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
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this content? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  };
  
  export default ContentList;
  