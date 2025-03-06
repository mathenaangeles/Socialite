import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

import { getProfile, updateProfile } from '../../slices/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    const updatedData = { first_name: firstName, last_name: lastName };

    try {
      await dispatch(updateProfile(updatedData)).unwrap();
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', mt: 5, p: 3 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {user?.email}
        </Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            fullWidth
            label="First Name"
            variant="outlined"
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Last Name"
            variant="outlined"
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Update Profile
          </Button>
        </form>
      </CardContent>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default Profile;
