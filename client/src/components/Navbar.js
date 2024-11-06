import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';


import { logout } from '../slices/userSlice';

const Navbar = () => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div>
            <button>
                <Link to={'/login'}>Login</Link>
            </button>
            <button>
                <Link to={'/register'}>Register</Link>
            </button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Navbar;