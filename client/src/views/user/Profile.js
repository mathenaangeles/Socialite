import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit as EditIcon } from '@mui/icons-material';
import { Avatar, Box, Divider, Card, CardContent, Button, Container, IconButton, TextField, Typography, Snackbar, Alert, LinearProgress} from '@mui/material';

import Sidebar from '../../components/Sidebar';
import { getProfile, updateProfile } from '../../slices/userSlice';


const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    } else {
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
  }, [dispatch, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateProfile({
          first_name: firstName,
          last_name: lastName,
        })
      ).unwrap();
      setSnackbarOpen(true);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LinearProgress />;
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 500 }}>
        <Box sx={{ height: 100, bgcolor: 'primary.main', position: 'relative' }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              position: 'absolute',
              bottom: -60,
              left: 20,
              border: '1px solid white',
            }}
            src={""}
          />
        </Box>
        <Container sx={{ mt: 10 }}>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {user?.first_name || user?.last_name ? 
                (<Typography variant="h4">{user?.first_name} {user?.last_name}</Typography>) :
                <Typography variant="h4">Anonymous</Typography>
              }
            <IconButton onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <EditIcon color="primary" /> : <EditIcon />}
            </IconButton>
          </Box>
          <Typography variant="body1" color="text.secondary">{user?.email}</Typography>

          <Divider sx={{ my: 3 }} />

          <Card sx={{ mx: 'auto', p: 2 }}>
            <CardContent>
            <Typography variant="h5" sx={{ mb: 1 }}>Personal Information</Typography>
              {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleUpdate}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  margin="normal"
                  color="secondary"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  margin="normal"
                  color="secondary"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                />
                {isEditing && (
                  <Button type="submit" variant="contained" color="primary" sx={{ my: 2 }}>
                    Save Changes
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

        </Container>

        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
            Profile was updates successfully.
          </Alert>
        </Snackbar>

      </Box>
    </Box>
  );
};

export default Profile;