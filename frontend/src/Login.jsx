import React, { useState, useEffect } from 'react';
import './Login.css';

export default function Login()
{
    return (
        <div className="login-container">
            <form>
                <label for="Username">Username</label>
                <input type="text"></input>
                <br/>
                <label for="password">Password</label>
                <input type="password"></input>
                <div className="button-container">
                    <button className="login-button">Submit</button>
                    <br/><br/>
                    <h3>New to Playground?</h3>
                    <button className="login-button">Sign Up Now</button>
                </div>
            </form>
        </div>
      );
}
