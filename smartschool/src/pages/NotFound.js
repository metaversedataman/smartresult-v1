import React, { useEffect } from 'react';
import { SITE_NAME, PAGE_NAME, PAGE_NAMES } from "../components/Constants";

const Page3 = () => {
    useEffect(() => {
        document.title = SITE_NAME + ": " + PAGE_NAMES['notfound'];
    });
    return (
        <div className='section-horizontal-padding section-vertical-padding '>
            <p>This Page is Not Found</p>
        </div>
    );
};
export default Page3;