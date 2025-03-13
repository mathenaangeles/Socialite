import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, LinearProgress, List, ListItem, ListItemText, Paper, useMediaQuery } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { getOrganization } from "../../slices/organizationSlice";

const Organization = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organization, loading } = useSelector((state) => state.organization);
  
  // Check if screen size is small
  const isSmallScreen = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    if (id) {
      dispatch(getOrganization(id));
    }
  }, [dispatch, id]);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row" }}>
      {!isSmallScreen && <Sidebar />} 
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          ml: isSmallScreen ? 0 : "260px", 
          mt: "64px",  // 🔥 Push content down to avoid overlap with Navbar
          p: 3, 
          boxShadow: 3, 
          borderRadius: 2, 
          maxWidth: isSmallScreen ? "100%" : "calc(100% - 260px)",
          mx: "auto"
        }}
      >
        {organization ? (
          <>
            <Typography variant="h5" gutterBottom>{organization.name}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>Members:</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <List>
                {organization.members.map((member) => (
                  <ListItem key={member.id}>
                    <ListItemText primary={member.email} />
                  </ListItem>
                ))}
              </List>
            </Paper>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              onClick={() => navigate(`/organization/form/${id}`)}
            >
              Edit Organization
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>You are not part of an organization.</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate("/organization/form")}
            >
              Create Organization
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Organization;
