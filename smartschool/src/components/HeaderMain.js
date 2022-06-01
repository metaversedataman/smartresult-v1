import React from 'react';
import {Link} from 'react-router-dom';
import logo from '../images/logo_app.png';
const Header = () => {
return (
    <header>
    <Link to='/'>
        <img src={logo} alt="emexrevolarter Logo" height="60" />
    </Link>
        <div style={{fontSize: 24}}>
            SAAC Hub
        </div>
    </header>
    );
};
export default Header;