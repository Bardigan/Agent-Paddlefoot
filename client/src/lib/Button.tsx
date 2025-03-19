import React from "react";
import { ImSpinner11 } from "react-icons/im";
import "./Button.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  text?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  loading = false,
  onClick,
  className = "",
  text = ""
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button ${className}`}
      disabled={loading}
    >
      {text}
      {loading && <ImSpinner11 className="spinner" />}
    </button>
  );
};

export default Button;