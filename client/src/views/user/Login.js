import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Container, Typography, Paper, Alert, Box, LinearProgress, } from '@mui/material';

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

    if (loading) return <LinearProgress />;

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, }}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                    Log in to your account
                </Typography>
                <Typography sx={{ mb: 1 }}>
                    Don't have an account?{" "}
                    <Link 
                        to="/register" 
                        style={{ color: "#7cbedf" }} 
                        sx={{ 
                            "&:visited": { color: "secondary.main" }
                        }}
                    >
                        Create an account
                    </Link>
                </Typography>
                {error &&  <Alert sx={{mb:1}} severity="error">{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        color="secondary"
                        margin="normal"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        color="secondary"
                        margin="normal"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Box sx={{ position: 'relative', mt: 2 }}>
                        <Button 
                            fullWidth 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={loading}
                        >
                            Login
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;
