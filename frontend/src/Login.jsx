import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

export default function Login()
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e)
    {
        e.preventDefault();
        const userData = {
            username: username,
            password: password,
        };

        try {
            // Send POST request to the backend
            const response = await axios.post('http://127.0.0.1:5000/login', userData);
            
            if (response.status === 200) {
                setSuccess(true);  // Show success message
                setError("");      // Clear any previous error messages
                console.log("Login successful:", response.data);
                // navigate to login page eventually
            }
        } catch (error) {
            setError("Login failed. Please try again.");
            setSuccess(false);  // Hide success message on failure
            console.error("Error logging in:", error.response ? error.response.data : error.message);
        }
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
                    <button className="login-button">Sign Up Now</button>
                </div>
            </form>
        </div>
      );
}
