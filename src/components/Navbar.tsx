import React from 'react'
import { NavLink } from 'react-router-dom'

import gearboxLogo from '../assets/gearbox-logo.png'

const styles = {
  navbar:
    'md:flex md:flex-wrap md:items-center md:justify-between border-b border-solid border-gray-400 mb-4',
  navbarLogo: 'flex justify-center md:justify-start md:flex-1',
  navbarItems:
    'flex self-stretch justify-between md:flex-1 md:justify-end text-center uppercase',
  navbarItem:
    'flex flex-1 md:flex-initial self-strech items-center justify-center hover:text-black hover:bg-gray-400 p-4 border-l border-solid border-gray-400',
}

const navItems = [
  { name: 'Guide for Use', path: '/guide' },
  { name: 'Eligible Trials', path: '/trials' },
  { name: 'About GEARBOx', path: '/about' },
]

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLogo}>
        <NavLink to="/">
          <img
            src={gearboxLogo}
            alt="GEARBOx logo"
            style={{ maxHeight: '100px' }}
          />
        </NavLink>
      </div>

      <div className={styles.navbarItems}>
        {navItems.map(({ path, name }) => (
          <NavLink
            key={path}
            to={path}
            className={styles.navbarItem}
            activeClassName="bg-gray-700 text-white"
          >
            {name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navbar
