import React from "react";

const MapEmbed = ({street}) => {
const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(street)}&output=embed`;
  return (
    <div className="map">
      <iframe 
      src={mapUrl} 
      width="600" 
      height="450" 
      style={{ border: 0, borderRadius: "10px" }} 
      allowFullScreen 
      loading="lazy"
    ></iframe>
    </div>
  );
};

export default MapEmbed;
