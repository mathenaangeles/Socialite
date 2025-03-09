import React from "react";
import { Link } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Toolbar, Box, Typography, Avatar, Button } from "@mui/material";
import { useSelector } from "react-redux";

const Sidebar = () => {
    const { user } = useSelector((state) => state.user);
    const organization = user?.organization || { name: "No Organization" };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          padding: 2,
        },
      }}
    >
      <Toolbar />
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Avatar sx={{ width: 64, height: 64 }}> {/* Placeholder Avatar */}
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </Avatar>
        <Typography variant="h6" align="center">
          {user ? `${user.first_name} ${user.last_name}` : "Guest"}
        </Typography>
      </Box>
      <Box my={2} p={1} bgcolor="grey.200" borderRadius={2} textAlign="center">
        <Typography variant="body1" fontWeight="bold" >
          {organization.name}
        </Typography>
      </Box>
      <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/organization/form"
          >
            Create Organization
        </Button>
      <List>
        <ListItem component={Link} to="/profile">
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem component={Link} to={`/organization/${organization.id}`}>
          <ListItemText primary="Organization" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
