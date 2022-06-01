import React from 'react';
import { Link } from 'react-router-dom';
const Navigation = () => {
    return (
        <nav style={{fontSize: 24}}>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/results">Results</Link>
                </li>
                <li>
                    <Link to="/contact">Contact</Link>
                </li>
            </ul>
        </nav>
    );
};
export default Navigation;