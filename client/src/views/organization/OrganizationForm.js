import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Card, Divider, Alert, LinearProgress, TextField, Button, Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";

import Sidebar from "../../components/Sidebar";
import { createOrganization, updateOrganization, getOrganization, addMembers, deleteMembers } from "../../slices/organizationSlice";

const OrganizationForm = () => {
  const { id } = useParams(); 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { organization, loading, error } = useSelector((state) => state.organization);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState(""); 
  
  useEffect(() => {
    if (id) {
      dispatch(getOrganization(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id) {
      setName(organization.name || "");
      setDescription(organization.description || "");
      setMembers(organization.members || []);
    }
  }, [id, organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let organizationData = {
      "name": name,
      "description": description,
    }
    if (id) {
      await dispatch(updateOrganization( {id, organizationData} ));
      navigate(`/organization/form/${id}`);
    } else {
      const newOrganization = await dispatch(createOrganization(organizationData));
      if (newOrganization.payload?.id) {
        navigate(`/organization/form/${newOrganization.payload.id}`);
      }
    }
  };

  const handleAddMember = async () => {
    if (memberEmail.trim() === "") return;
    const result = await dispatch(addMembers({ id, emails: [memberEmail] }));
    if (result.payload) {
      setMembers([...members, { email: memberEmail }]);
      setMemberEmail("");
    }
  };

  const handleRemoveMember = async (email) => {
    const result = await dispatch(deleteMembers({ id, emails: [email] }));
    if (result.payload) {
      setMembers(members.filter((member) => member.email !== email));
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Container>
        <Box sx={{ my: 3, p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Card sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {id ? "Edit Organization" : "Create Organization"}
            </Typography>
            <Divider sx={{ mb: 2 }}/>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                margin="normal"
                color="secondary"
                variant="outlined"
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                margin="normal"
                color="secondary"
                variant="outlined"
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={3}
              />
              <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  Submit
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Card>
  
          {id && (
            <Card sx={{ p: 3, my: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Manage Memberships
              </Typography>
              <Divider sx={{ mb: 2 }}/>

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Enter Email Address"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Button variant="contained" color="primary" onClick={handleAddMember}>
                  Add
                </Button>
              </Box>
  
              <TableContainer component={Paper} sx={{  mt: 2, borderRadius: 2, boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.length > 0 ? (
                      members.map((member) => (
                        <TableRow key={member.email}>
                          <TableCell>{member.email}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleRemoveMember(member.email)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <i>No members added yet.</i>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

        </Box>
      </Container>
    </Box>
  );
};

export default OrganizationForm;
