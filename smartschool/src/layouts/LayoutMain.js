import React from 'react'
import Header from '../components/HeaderMain'
import Navigation from '../components/NavigationMain'
import Footer from '../components/FooterMain'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorPage from './ErrorBoundaryPage'
const Layout = ({ children }) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorPage}
          onReset={() => {
            // reset the state of your app so the error doesn't happen again
          }}>
        <div className="grid-container gradient-background">
            <div className="grid-header section-horizontal-padding">
                <Header />
                <Navigation />
            </div>
            <main className="grid-body section-horizontal-margin glass-morph">
                {children}
            </main>
            <div className="grid-footer section-horizontal-padding">
                <Footer />
            </div>
        </div>
  </ErrorBoundary>
    );
};
export default Layout;