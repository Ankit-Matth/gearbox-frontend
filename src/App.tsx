import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Home from './Pages/Home'
import About from './Pages/About'
import Guide from './Pages/Guide'
import Login from './Pages/Login'
import Results from './Pages/Results'
import Trials from './Pages/Trials'

import Navbar from './Components/Navbar'
import Footer from './Components/Footer'

import gearboxLogo from './assets/gearbox-logo.png'
import uchicagoBSDlogo from './assets/uchicago-BSD-logo.jpg'
import volchenboumLabLogo from './assets/volchenboum-lab-logo.png'
import pedalLogo from './assets/pedal-logo.png'

const styles = {
  main: 'flex-1 max-w-screen-lg w-full mx-auto my-8',
  footer: 'flex-shrink-0',
}

const routes = [
  { component: Home, name: 'Home', path: '/', exact: true, nav: false },
  { component: Results, name: 'Results', path: '/results', nav: false },
  { component: Login, name: 'Login', path: '/login', nav: false },
  { component: Guide, name: 'Guide for Use', path: '/guide', nav: true },
  { component: Trials, name: 'Eligible Trials', path: '/trials', nav: true },
  { component: About, name: 'About GEARBOx', path: '/about', nav: true },
]

const navbarProps = {
  logo: <img src={gearboxLogo} alt="logo" style={{ height: '100px' }} />,
  items: routes.filter(({ nav }) => nav),
}

const footerProps = {
  children: [
    <img src={uchicagoBSDlogo} alt="logo" style={{ height: '100px' }} />,
    <img src={volchenboumLabLogo} alt="logo" style={{ height: '100px' }} />,
    <img src={pedalLogo} alt="logo" style={{ height: '100px' }} />,
  ],
}

function App() {
  const isLogin = window.location.pathname === '/login'

  return (
    <Router>
      <header>{!isLogin && <Navbar {...navbarProps} />}</header>

      <main className={styles.main}>
        <Switch>
          {routes.map(({ exact, path, component }) => (
            <Route exact={exact} path={path}>
              {component}
            </Route>
          ))}
        </Switch>
      </main>

      <footer className={styles.footer}>
        <Footer showExtra={isLogin} {...footerProps} />
      </footer>
    </Router>
  )
}

export default App
