import React from "react";
import "./Input.scss";

interface InputProps {
  type: "text" | "password" | "email" | "number";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  name,
  value,
  onChange,
  label,
  required = false,
  autoComplete = "off",
  pattern,
  placeholder,
}) => {
  return (
    <div className="input-wrapper">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;