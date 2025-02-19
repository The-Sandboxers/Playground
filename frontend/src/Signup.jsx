import React, { useState, useEffect } from 'react';
import './Login.css';

export default function Signup()
{
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e)
    {
        e.preventDefault();
        if (password === confirmPassword)
        {
            const userData = {
                email: email,
                username: username,
                password: password,
            };
            console.log(userData);

            try {
                // Send POST request to the backend
                const response = await axios.post('http://127.0.0.1:5000/register', userData);
                
                if (response.status === 200) {
                    setSuccess(true);  // Show success message
                    setError("");      // Clear any previous error messages
                    console.log("Registration successful:", response.data);
                }
            } catch (error) {
                setError("Registration failed. Please try again. " + JSON.stringify(userData) + JSON.stringify(response.data));
                setSuccess(false);  // Hide success message on failure
                console.error("Error registering:", error.response ? error.response.data : error.message);
            }
        }
        else {
            setError("Passwords do not match");
            setSuccess(false);
        }
    }

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: "yellow" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>Registration successful!</p>}
                <label for="email">Email</label>
                <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required></input>
                <label for="Username">Username</label>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required></input>
                <br/>
                <label for="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                <br/>
                <label for="confirm password">Confirm Password</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required></input>
                <div className="button-container">
                    <button className="login-button" type="submit">Submit</button>
                    <br/><br/>
                    <h3>Already have an account?</h3>
                    <button className="login-button">Log In Now</button>
                </div>
            </form>
        </div>
      );
}
