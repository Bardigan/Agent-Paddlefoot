import React from "react";
import ReactDOM from "react-dom";
import "./Popup.scss";

interface PopupProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ show, onClose, title = "Popup", children }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="popup">
      <div className="popup-content">
        <h1>{title}</h1>
        <div className="popup-children-content">
          {children}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
};

export default Popup;