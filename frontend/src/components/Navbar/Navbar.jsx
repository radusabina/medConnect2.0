import React from 'react';
import './Navbar.css';

function Navbar() {
    return(
    <div className="navbar">
        <nav>
          <label className="logo">MedConnect</label>
          <ul className="nav-links">
            <li>
              <a href="/pdf-config">Patient Receipt</a>
            </li>
            <li>
              <a href="/live-chat">Live Chat</a>
            </li>
          </ul>
        </nav>
    </div>
    );

}

export default Navbar;