import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, AppBar, Toolbar, Button } from "@mui/material";

import { logout } from "../slices/userSlice";

const Navbar = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box>
      <AppBar position="fixed" sx={{ backgroundColor: "#000", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt="Logo"
              sx={{ height: 50, mr: 1 }}
            />
          </Box>
          {!user ? (
            <Box>
              <Button sx={{ mx: 1 }} variant="contained" color="primary"  component={Link} to="/login">
                Login
              </Button>
              <Button sx={{ mx: 1 }} variant="outlined" color="secondary" component={Link} to="/register">
                Register
              </Button>
            </Box>
          ) : (
            <Box>
              <Button sx={{ mx: 1 }} color="inherit" component={Link} to="/profile">
                Profile
              </Button>
              <Button sx={{ mx: 1 }} variant="outlined" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ height: "64px" }} />
    </Box>
  );
};

export default Navbar;
