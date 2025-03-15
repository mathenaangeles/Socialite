import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Container, Typography, Paper, LinearProgress, Alert, Box } from '@mui/material';

import { register } from '../../slices/userSlice';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, loading, error } = useSelector((state) => state.user); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register({ email, password }));
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
                    Create an account
                </Typography>
                <Typography sx={{ mb: 1 }}>
                    Already have an account?{" "}
                    <Link 
                        to="/login" 
                        style={{ color: "#7cbedf" }} 
                        sx={{ 
                            "&:visited": { color: "secondary.main" }
                        }}
                    >
                        Log in
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        color="secondary"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Box sx={{ position: 'relative', mt: 2 }}>
                        <Button 
                            fullWidth 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={loading}
                        >
                            Register
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Register;
