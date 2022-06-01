import React from 'react'
import {
  BrowserRouter as Router,
  Routes as RoutGroup,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom'
import LayoutMain from './layouts/LayoutMain'
import LayoutNotFound from './layouts/LayoutNotFound'

import NotFound from './pages/NotFound'
import Home from './pages/Home'
import Results from './pages/Results'
import About from './pages/About'
import Contact from './pages/Contact'

// const pathname = window.location.pathname;
// <Navigate from="/:url*(/+)" to={pathname.slice(0, -1)} />
const Routes = () => {  
  // const { pathname } = useLocation();
  return (
    <Router>
      <RoutGroup>
        <Route path="/results" element= {<LayoutMain><Results /></LayoutMain>} />
        <Route path="/about" element= {<LayoutMain><About /></LayoutMain>} />
        <Route path="/contact" element= {<LayoutMain><Contact /></LayoutMain>} />
        <Route path="/" element= {<LayoutMain><Home /></LayoutMain>} />
        <Route element= {<LayoutNotFound><NotFound /></LayoutNotFound>} />
      </RoutGroup>
    </Router>
);
}

export default Routes;
