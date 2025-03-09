import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

import { createOrganization, updateOrganization, getOrganization } from "../../slices/organizationSlice";

const OrganizationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { organization, loading } = useSelector((state) => state.organization);

  const [name, setName] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getOrganization(id));
    }
  }, [id, dispatch]);
  

  useEffect(() => {
    if (organization) {
      setName(organization.name || "");
    }
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await dispatch(updateOrganization({ id, name }));
      navigate(`/organization/${id}/edit`);
    } else {
      const newOrg = await dispatch(createOrganization({ name }));
      
      if (newOrg.payload?.id) {
        navigate(`/organization/${newOrg.payload.id}/edit`);
      } else {
        console.error("Failed to create organization:", newOrg);
        navigate("/organization");
      }
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
            label="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {id ? "Update" : "Create"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default OrganizationForm;
