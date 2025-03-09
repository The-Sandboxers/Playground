import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.module.css'
import { requestBackend } from '../utils';

export default function Login()
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e)
    {
        e.preventDefault();
        const userData = {
            username: username,
            password: password,
        };

        try {
            // Send POST request to the backend
            const data = await requestBackend("POST", "http://127.0.0.1:5000/login", "None", userData)
            
            setSuccess(true);  // Show success message
            setError("");      // Clear any previous error messages
            console.log("Login successful:", data);
            const access_token = data.access_token
            const refresh_token = data.refresh_token
            localStorage.setItem("access_token", access_token)
            localStorage.setItem("refresh_token", refresh_token)
            
            navigate("/profile");
        } catch (error) {
            setError("Login failed. Please try again.");
            setSuccess(false);  // Hide success message on failure
            console.error("Error logging in:", error.response ? error.response.data : error.message);
        }
    }

    function goToSignUp()
    {
        navigate("/signup");
    }

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: "yellow" }}>{error}</p>}
                {success && <p style={{ color: "lightgreen" }}>Registration successful!</p>}
                <label for="Username">Username</label>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required></input>
                <br/>
                <label for="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                <div className="button-container">
                    <button type="submit" className="login-button">Submit</button>
                    <br/><br/>
                    <h3>New to Playground?</h3>
                    <button className="login-button" onClick={goToSignUp}>Sign Up Now</button>
                </div>
            </form>
        </div>
      );
}
