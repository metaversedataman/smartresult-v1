import React, { useEffect } from 'react';
import { SITE_NAME, PAGE_NAME, PAGE_NAMES } from "../components/Constants";
import location_icon from '../images/location.png';
import mail_icon from '../images/email.png';
import phone_icon from '../images/telephone black.png';


const Contact = () => {
    useEffect(() => {
        document.title = SITE_NAME + ": " + PAGE_NAMES['contact'];
    });
    return (
        <div className='section-horizontal-padding section-vertical-padding bg-parent'>
            <div className="bg"></div>
            <div className="bg bg2"></div>
            <div className="bg bg3"></div>
            <div className="bg-content">
                <h1 style={{textAlign: 'center'}}>Contact Us Today</h1>

                <div className='section-vertical-margin' style={{fontSize: 24, paddingLeft: 10}}>
                    <img src={phone_icon} alt='phone number' height={18} style={{marginRight: 10}} /> 
                    <a className='clickable' href='tel:08111114334' title='Call us today' style={{textDecoration: 'none', color: 'black'}}>
                        0811 111 4334
                    </a>
                </div>
                <div className='section-vertical-margin' style={{fontSize: 24}}>
                    <img src={mail_icon} alt='email address' height={18} style={{marginRight: 10}} /> 
                    <a href='mailto:samueladegbiteanglicacollege@gmail.com' title='Email us today' style={{textDecoration: 'none', color: 'black'}}>
                        samueladegbiteanglicacollege@gmail.com
                    </a>
                </div>
                <div style={{fontSize: 24, paddingLeft: 10}}>
                    <img src={location_icon} alt='location/address' height={18} style={{marginRight: 10}} /> St. Peter's Anglican Church, Isheri-Idimu, Lagos.
                </div>
            </div>
        </div>
    );
};
export default Contact;