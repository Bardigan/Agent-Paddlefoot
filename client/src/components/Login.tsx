import React, { useState, ChangeEvent, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from '../context/GameContext';
import { FaInfoCircle } from "react-icons/fa";
import { ImSpinner11 } from "react-icons/im";
import "./Login.scss";

const API = import.meta.env.VITE_API_URL || "localhost";

interface FormData {
  username: string;
  password: string;
}

const sanitizeInput = (input: string, options?: { allowAlphanumericOnly?: boolean; maxLength?: number }): string => {
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
  const [formData, setFormData] = useState<FormData>({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages
  const [loading, setLoading] = useState<boolean>(false); // State for loading spinner
  const context = useContext(GameContext);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: sanitizeInput(value, { allowAlphanumericOnly: false, maxLength: 50 }),
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
          const expirationTime = new Date(new Date().getTime() + (28740 * 1000));
          context?.login(data.token, expirationTime.toISOString(), false);
        } else {
          const expirationTime = new Date(new Date().getTime() + (28740 * 1000));
          context?.login(data.token, expirationTime.toISOString(), false);
          setIsLogin(true);
        }
        navigate("/"); // Redirect to home page
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || errorData.errors[0].msg || "An error occurred. Please try again."); // Set error message
      }
    } catch (error: unknown) {
      setErrorMessage((error as Error).message || "An unexpected error occurred."); // Handle unexpected errors
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
              <div className="tooltip">No special signs, the password should be at least 6 characters long</div>
            </div>
          )}
        </h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="off"
              pattern="[a-zA-Z0-9]{3,20}"
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">{isLogin ? "Login" : "Register"}{loading && <ImSpinner11 className="spinner" />}</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="auth-form__switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <div>
            <span className="login-switch" onClick={toggleForm}>{isLogin ? "Register" : "Login"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
