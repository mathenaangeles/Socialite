import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getProfile, updateProfile } from '../../slices/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    } else {
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
  }, [dispatch, user]);

  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedData = { first_name: firstName, last_name: lastName };

    dispatch(updateProfile(updatedData))
      .then(() => {
        alert('Profile updated successfully');
      })
      .catch((err) => {
        console.error('Failed to update profile:', err);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <div>{user.email}</div>
      <div>{user.first_name}</div>
      <div>{user.last_name}</div>
      <form onSubmit={handleUpdate}>
        <div>
          <label htmlFor="first-name">First Name:</label>
          <input
            type="text"
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="last-name">Last Name:</label>
          <input
            type="text"
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
