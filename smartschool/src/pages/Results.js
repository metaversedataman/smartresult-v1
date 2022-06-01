import React, { useEffect } from 'react';
const RemoteButton = React.lazy(() => import("smartresult/Button"));
import { SITE_NAME, PAGE_NAMES } from "../components/Constants";


const Results = () => {
    useEffect(() => {
        document.title = SITE_NAME + ": " + PAGE_NAMES['results'];
    });
    return (
            <React.Suspense fallback="Loading...">
                <RemoteButton />
            </React.Suspense>
    );
};
export default Results;
