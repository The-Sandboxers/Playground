import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/application/profile')}
      className="rounded-lg border border-red-500 text-lg font-medium bg-[#1a1a1a] cursor-pointer transition-colors duration-200 w-28 h-16 ml-8 mt-5 text-white py-2.5 px-5"
    >
      Profile
    </button>
  );
}

export default ProfileButton;
