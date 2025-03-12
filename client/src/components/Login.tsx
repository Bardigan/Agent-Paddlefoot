import React, { useState, ChangeEvent, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from '../context/GameContext';
import "./Login.scss";

const API = import.meta.env.VITE_API_URL || "localhost";

interface FormData {
  username: string;
  password: string;
}

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const context = useContext(GameContext);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const url = isLogin ? "/login" : "/register";

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
          // Handle successful login, e.g., store token
          console.log("Login successful:", data);
          context?.setToken(data.token);
          localStorage.setItem("token", data.token);
        } else {
          // Handle successful registration
          console.log("Registration successful:", data);
          // Optionally, switch to login form after successful registration
          context?.setToken(data.token);
          localStorage.setItem("token", data.token);
          setIsLogin(true);
        }
        navigate("/"); // Redirect to home page
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.message || "An error occurred");
      }
    } catch (error: unknown) {
      console.error("Error:", (error as Error).message);
    }
  };

  const toggleForm = (): void => {
    setIsLogin(!isLogin);
    setFormData({ username: "", password: "" });
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
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
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <div>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <div className="login-switch" onClick={toggleForm}>
            {isLogin ? "Register" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
