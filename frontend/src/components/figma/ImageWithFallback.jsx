import React, { useState } from 'react';

export const ImageWithFallback = ({ src, alt, ...props }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className="image-fallback">
        <span>☕</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};