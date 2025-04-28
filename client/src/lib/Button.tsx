import React from "react";
import { ImSpinner11 } from "react-icons/im";
import "./Button.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  text?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  loading = false,
  onClick,
  className = "",
  text = "",
  icon,
  children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button ${className}`}
      disabled={loading}
    >
      {children || text}
      {icon && icon}
      {loading && <ImSpinner11 className="spinner" />}
    </button>
  );
};

export default Button;