import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Person, Business } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Toolbar, Box, Typography, Avatar, Button, Divider } from "@mui/material";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const navItems = [
    { text: "Profile", icon: <Person />, path: "/profile" },
    { text: "Organization", icon: <Business />, path: `/organization/${user?.organization.id}` },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          color: "#ffffff",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <Toolbar />
      <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar 
            sx={{ width: 36, height: 36 }} 
            src={""}
          />
          <Box display="flex" flexDirection="column" lineHeight={1.2}>
            <Typography variant="body2" fontWeight="bold">{user ? `${user.first_name} ${user.last_name}` : "Guest"}</Typography>
            {user?.organization ? 
            (<Typography variant="caption" color="grey.400">{user?.organization.name}</Typography>):
            (<Typography variant="caption" color="grey.400">No Organization</Typography>)}
            
          </Box>
        </Box>
      </Box>

      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                my: 0.5,
                color: "grey.300",
                "&.Mui-selected": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                },
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "grey.400" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;