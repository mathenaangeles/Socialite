import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, Paper } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { getOrganization } from "../../slices/organizationSlice";

const Organization = () => {
  const { id } = useParams(); // Get ID from the URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organization, loading } = useSelector((state) => state.organization);

  useEffect(() => {
    if (id) {
      dispatch(getOrganization(id)); // Fetch organization with the ID
    }
  }, [dispatch, id]);

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Sidebar />
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
  );
};

export default Organization;
