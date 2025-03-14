import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Delete } from "@mui/icons-material";
import { TextField, Button, Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";

import { createOrganization, updateOrganization, getOrganization, addMembers, deleteMembers } from "../../slices/organizationSlice";

const OrganizationForm = () => {
  const { id } = useParams(); 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { organization, loading } = useSelector((state) => state.organization);

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
    if (organization) {
      setName(organization.name || "");
      setName(organization.description || "");
      setMembers(organization.members || []);
    }
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await dispatch(updateOrganization( id, {
        "name": name,
        "description": description,
      }));
      navigate(`/organization/${id}/edit`);
    } else {
      const newOrg = await dispatch(createOrganization({ 
        "name": name,
        "description": description,
       }));
      if (newOrg.payload?.id) {
        navigate(`/organization/${newOrg.payload.id}/edit`);
      } else {
        navigate("/organization");
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

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {id ? "Edit Organization" : "Create Organization"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {id ? "Update" : "Create"}
          </Button>
        </form>

        {id && (
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>Manage Members</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                fullWidth
                label="Enter Email to Add"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <Button variant="contained" color="primary" onClick={handleAddMember}>
                Add
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell align="right"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.email}>
                      <TableCell>{member.email}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleRemoveMember(member.email)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Container>
  );
};

export default OrganizationForm;
