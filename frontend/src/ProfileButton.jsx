import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileButton() {
  const navigate = useNavigate();

  return <button onClick={() => navigate('/profile')}>Profile</button>;
}

export default ProfileButton;