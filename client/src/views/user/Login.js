import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Container, Typography, Paper, CircularProgress, Alert, Box } from '@mui/material';

import { login } from '../../slices/userSlice';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, loading, error } = useSelector((state) => state.user);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    useEffect(() => {
        if (user) {
            navigate('/profile');
        }
    }, [user, navigate]); 

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 4, mt: 8, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                    <Box sx={{ position: 'relative', mt: 2 }}>
                        <Button 
                            fullWidth 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        {loading && (
                            <CircularProgress 
                                size={24} 
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }} 
                            />
                        )}
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;
