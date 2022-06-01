import React from 'react';
import Header from '../components/HeaderMain';
import Navigation from '../components/NavigationNotFound';
import Footer from '../components/FooterMain'

const Layout = ({ children }) => {
    return (
    <React.Fragment>
        <div className="grid-container gradient-background">
            <div className="grid-header section-horizontal-padding">
                <Header />
                <Navigation />
            </div>
            <main className="grid-body section-horizontal-padding section-vertical-padding section-horizontal-margin section-vertical-margin glass-morph">
                <div>
                    <h1>OOPS!</h1>
                    {children}
                </div>
            </main>
            <div className="grid-footer section-horizontal-padding">
                <Footer />
            </div>
        </div>
    </React.Fragment>
    );
};
export default Layout;