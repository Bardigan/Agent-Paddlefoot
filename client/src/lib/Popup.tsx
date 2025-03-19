import React from "react";
import "./Popup.scss";

interface PopupProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ show, onClose, title = "Popup", children }) => {
  if (!show) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <h1>{title}</h1>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;