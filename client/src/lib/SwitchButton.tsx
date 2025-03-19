import React from 'react';
import "./SwitchButton.scss";

interface SwitchButtonProps {
  toggleForm: () => void;        
  description: string;
  title: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({ description, title, toggleForm }) => {
  return (
    <div className="auth-form__switch">
      {description}
      <div>
        <span className="login-switch" onClick={toggleForm}>
          {title}
        </span>
      </div>
    </div>
  );
};

export default SwitchButton;