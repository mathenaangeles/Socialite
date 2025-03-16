import React, { useEffect } from "react";
import { Edit as EditIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Divider, Typography, Button, LinearProgress, TableContainer, Table, TableHead, Paper, TableRow, TableCell, TableBody, Alert } from "@mui/material";

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
    <Box sx={{ display: "flex", minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 500 }}>
        <Box sx={{ p: 3 }}>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h4" fontWeight="bold">
              {organization.name}
            </Typography>
            <IconButton onClick={() => navigate(`/organization/form/${organization.id}`)} color="primary">
              <EditIcon sx={{ color: "white" }}/>
            </IconButton>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {organization.description || "No description provided."}
          </Typography>
          <Divider sx={{ my: 3 }} />

          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.900" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organization.members.length > 0 ? (
                  organization.members.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.first_name}</TableCell>
                      <TableCell>{member.last_name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <i>No members found.</i>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
        </Box>
      </Box>
    </Box>
  
  );
};

export default Organization;
