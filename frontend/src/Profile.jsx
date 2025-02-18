import React, { useState, useEffect } from 'react';
import './Profile.css';

export default function Profile()
{
    return (
        <div className="profile-container">
            <div className="horizontal-layout">
                <div className="pic-and-linked-accounts">
                    <h3>Profile Name</h3>
                    <img src="https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/420/420/Hat/Png" className="profile-pic"></img>
                    <h3>Linked Services:</h3>
                </div>
                <div className="vertical-layout">
                    <div className="played-games">
                        <h3>Played Games</h3>
                    </div>
                    <div className="liked-games">
                        <h3>Liked Games</h3>
                    </div>
                </div>
            </div>
        </div>
      );
}
