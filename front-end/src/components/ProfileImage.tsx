import React from 'react';

interface ProfileImageProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ firstName, lastName, imageUrl }) => {
  return (
    <div className="profile-img-container">
      <img
        src={imageUrl || "https://via.placeholder.com/200"}
        alt={`${firstName} ${lastName}`}
        className="profile-img"
        onError={(e) => {
          console.error("Image failed to load");
          e.currentTarget.src = "https://via.placeholder.com/200";
        }}
      />
    </div>
  );
};

export default ProfileImage; 