import React from 'react';

const Avatar = ({ src, alt, size = 50 }) => {
  const defaultAvatar = 'http://localhost:5000/uploads/def_icon.jpg';
  const avatarSrc = src ? `http://localhost:5000/uploads/${src}` : defaultAvatar;

  return (
    <img
      src={avatarSrc}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
};

export default Avatar;
