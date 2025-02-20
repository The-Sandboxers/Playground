import React, { useState, useEffect } from 'react';
import './Login.css';

export default function Login()
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit()
    {
        const userData = {
            username: username,
            password: password,
        };
    }

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
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
