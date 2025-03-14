import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button, LinearProgress, TableContainer, Table, TableHead, Paper, TableRow, TableCell, TableBody, Alert } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { getOrganization } from "../../slices/organizationSlice";

const Organization = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { organization, loading, error } = useSelector((state) => state.organization);
  

  useEffect(() => {
    if (id) {
      dispatch(getOrganization(id));
    }
  }, [dispatch, id]);

  if (loading) return <LinearProgress />;

  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 3 }}>
        {organization ? (
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {organization.name}
            </Typography>
            <Typography variant="body1">
              {organization.description}
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organization.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button 
              variant="contained" 
              sx={{ mt: 3, alignSelf: "flex-start" }} 
              onClick={() => navigate(`/organization/form/${organization.id}`)}
            >
              Edit Organization
            </Button>
            
          </Box>
        ) : (
          <Box textAlign="center">
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              You are not part of an organization.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }} 
              onClick={() => navigate("/organization/form")}
            >
              Create Organization
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  
  );
};

export default Organization;
