import React, { useState, ChangeEvent, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { FaInfoCircle } from "react-icons/fa";
import Input from "../lib/Input";
import Button from "../lib/Button";
import SwitchButton from "../lib/SwitchButton";
import "./Login.scss";

const API = import.meta.env.VITE_API_URL || "localhost";


interface FormData {
  username: string;
  password: string;
}

const sanitizeInput = (
  input: string,
  options?: { allowAlphanumericOnly?: boolean; maxLength?: number }
): string => {
  const { allowAlphanumericOnly = false, maxLength = 100 } = options || {};
  let sanitized = input.trim();
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/[\x00-\x1F\x7F]/g, "");
  if (allowAlphanumericOnly) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  }
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
};

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const context = useContext(GameContext);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: sanitizeInput(value, {
        allowAlphanumericOnly: false,
        maxLength: 50,
      }),
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const url = isLogin ? "/login" : "/register";

    // Reset error message
    setErrorMessage(null);
    setLoading(true); // Start loading spinner

    try {
      const response = await fetch(`${API}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (isLogin) {
          const expirationTime = new Date(new Date().getTime() + 28740 * 1000);
          context?.login(data.token, expirationTime.toISOString(), false);
        } else {
          const expirationTime = new Date(new Date().getTime() + 28740 * 1000);
          context?.login(data.token, expirationTime.toISOString(), false);
          setIsLogin(true);
        }
        navigate("/"); // Redirect to home page
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message ||
            errorData.errors[0].msg ||
            "An error occurred. Please try again."
        ); // Set error message
      }
    } catch (error: unknown) {
      setErrorMessage(
        (error as Error).message || "An unexpected error occurred."
      ); // Handle unexpected errors
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const toggleForm = (): void => {
    setIsLogin(!isLogin);
    setFormData({ username: "", password: "" });
    setErrorMessage(null); // Clear error message when toggling forms
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2 className="auth-form__header">
          {isLogin ? "Login" : "Register"}
          {!isLogin && (
            <div className="tooltip-container">
              <FaInfoCircle className="auth-form__icon" />
              <div className="tooltip">
                No special signs, the password should be at least 6 characters
                long
              </div>
            </div>
          )}
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            label="Username:"
            required
            pattern="[a-zA-Z0-9]{3,20}"
            placeholder="Enter your username"
          />
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            label="Password:"
            required
            placeholder="Enter your password"
          />
          <Button
            type="submit"
            text={isLogin ? "Login" : "Register"}
            loading={loading}
          />
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <SwitchButton
          description={isLogin ? "Don't have an account?" : "Already have an account?"}
          title={isLogin ? "Register" : "Login"}
          toggleForm={toggleForm}
        />
      </div>
    </div>
  );
};

export default AuthForm;
