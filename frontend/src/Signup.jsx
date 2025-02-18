import React, { useState, useEffect } from 'react';
import './Login.css';

export default function Signup()
{
    return (
        <div className="login-container">
            <form>
                <label for="Username">Username</label>
                <input type="text"></input>
                <br/>
                <label for="password">Password</label>
                <input type="password"></input>
                <br/>
                <label for="confirm password">Confirm Password</label>
                <input type="password"></input>
                <div className="button-container">
                    <button className="login-button">Submit</button>
                    <br/><br/>
                    <h3>Already have an account?</h3>
                    <button className="login-button">Log In Now</button>
                </div>
            </form>
        </div>
      );
}
