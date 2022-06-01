import React, { useEffect } from 'react';
import { SITE_NAME, PAGE_NAME, PAGE_NAMES } from "../components/Constants";
import custom_bag from '../images/bagpack-custom-logo.png';
import student_girl from '../images/student-girl.png';
import student_boy from '../images/student-male.png';

const About = () => {
    useEffect(() => {
        document.title = SITE_NAME + ": " + PAGE_NAMES['about'];
    });
    return (
        <div className='section-horizontal-padding section-vertical-padding'>
            <div className='grid-about-page'>
                <div className='about-page-panel' style={{backgroundImage: `url(${student_girl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}>
                    <div className='about-page-panel-text'>
                        <h1>VISION</h1>
                        <p>
                            To attain the highest standard of excellence in spiritual, academics and morals, leading to total development of our students.
                        </p>
                    </div>
                    <div className='about-page-panel-overlay'></div>
                </div>
                <div className='about-page-panel' style={{backgroundImage: `url(${custom_bag})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}>
                    <div className='about-page-panel-text'>
                        <h1>MISSION</h1>
                        <p>
                            Working under God to provide an inclusive world -class education that develops students skills, knowledge and character, providing opportunities for them to become confident leaders, role models and globally relevant.
                        </p>
                    </div>
                    <div className='about-page-panel-overlay'></div>
                </div>
                <div className='about-page-panel' style={{backgroundImage: `url(${student_boy})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}>
                    <div className='about-page-panel-text'>
                        <h1>CORE VALUES</h1>
                        <p>
                        God first in our mission, Integrity and transparency, Value added life style, Commitment and Dedication, Grooming boys and girls for global impact.
                        </p>
                    </div>
                    <div className='about-page-panel-overlay'></div>
                </div>
            </div>
        </div>
    );
};
export default About;