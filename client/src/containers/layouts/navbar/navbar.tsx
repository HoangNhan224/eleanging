/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* LAYOUT NAVBAR COMPONENT
   ========================================================================== */

import React, { FC, useCallback, useEffect, useMemo } from 'react'
import Notifications from '../../../components/DropdownNotifications'
import UserMenu from '../../../components/DropdownProfile'
import { useLocation } from 'react-router-dom'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { useTheme } from 'services/styled-themes'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../../redux/auth/authSlice'
import Banner from '../../../components/Banner/index'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

/**
 * Navbar component displays the navigation bar of the application.
 *
 * @component
 * @param {HeaderProps} props - The props for the component.
 * @returns {JSX.Element} The rendered Navbar component.
 *
 * @property {boolean} sidebarOpen - The state for managing the sidebar's open/close state.
 * @property {function} setSidebarOpen - The function to set the sidebar's open/close state.
 */
const Navbar: FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { pathname } = location
  const { theme, setTheme } = useTheme()

  const userRoleFromRedux = useSelector(selectUserRole)
  // eslint-disable-next-line prefer-regex-literals
  const pathRegEx = new RegExp('^/lesson/edit/[^/]+$')
  const isPathMatch = pathRegEx.test(location.pathname)
  const isAdmin = userRoleFromRedux?.toUpperCase() === 'ADMIN'
  const alwaysShowHamburgerPaths = ['/permission', '/user', '/dashboard/enrollment_dashboard', '/lesson', '/lesson/add']
  const showHamburgerButton = (alwaysShowHamburgerPaths.includes(location.pathname) && isAdmin) || (isPathMatch && isAdmin)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  const handleThemeSwitch = useCallback(async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
    } catch (error) {
      console.log(error)
    }
  }, [setTheme, theme])

  const locationPath = 'delete.png'
  const renderThemeSwitcher = useMemo(() => {
    const icon = theme === 'dark'
      ? <div>  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="15" fill="#3A3A3A" />
        <path d="M25.0819 17.0821C24.4763 19.0593 23.2624 20.7951 21.6132 22.0424C20.1652 23.1322 18.4421 23.7969 16.6373 23.9618C14.8326 24.1268 13.0175 23.7854 11.396 22.9761C9.77446 22.1668 8.41057 20.9215 7.45743 19.3802C6.50428 17.8388 5.99961 16.0622 6.00004 14.2499C5.9936 12.1346 6.68126 10.0756 7.95755 8.38868C9.20492 6.73942 10.9407 5.5256 12.9179 4.91993C13.0482 4.8798 13.187 4.87596 13.3193 4.90882C13.4516 4.94167 13.5725 5.00998 13.6689 5.10639C13.7653 5.2028 13.8336 5.32367 13.8665 5.456C13.8993 5.58834 13.8955 5.72712 13.8554 5.85743C13.423 7.28752 13.3868 8.80811 13.7505 10.2572C14.1142 11.7062 14.8642 13.0295 15.9206 14.0859C16.977 15.1423 18.3003 15.8924 19.7494 16.2561C21.1984 16.6198 22.719 16.5835 24.1491 16.1512C24.2794 16.1111 24.4182 16.1072 24.5505 16.1401C24.6829 16.1729 24.8037 16.2412 24.9002 16.3376C24.9966 16.4341 25.0649 16.5549 25.0977 16.6873C25.1306 16.8196 25.1267 16.9584 25.0866 17.0887L25.0819 17.0821Z" fill="white" />
      </svg></div>
      : <div>  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="15" fill="#D9D9D9" />
        <path d="M25.0819 17.0821C24.4763 19.0593 23.2624 20.7951 21.6132 22.0424C20.1652 23.1322 18.4421 23.7969 16.6373 23.9618C14.8326 24.1268 13.0175 23.7854 11.396 22.9761C9.77446 22.1668 8.41057 20.9215 7.45743 19.3802C6.50428 17.8388 5.99961 16.0622 6.00004 14.2499C5.9936 12.1346 6.68126 10.0756 7.95755 8.38868C9.20492 6.73942 10.9407 5.5256 12.9179 4.91993C13.0482 4.8798 13.187 4.87596 13.3193 4.90882C13.4516 4.94167 13.5725 5.00998 13.6689 5.10639C13.7653 5.2028 13.8336 5.32367 13.8665 5.456C13.8993 5.58834 13.8955 5.72712 13.8554 5.85743C13.423 7.28752 13.3868 8.80811 13.7505 10.2572C14.1142 11.7062 14.8642 13.0295 15.9206 14.0859C16.977 15.1423 18.3003 15.8924 19.7494 16.2561C21.1984 16.6198 22.719 16.5835 24.1491 16.1512C24.2794 16.1111 24.4182 16.1072 24.5505 16.1401C24.6829 16.1729 24.8037 16.2412 24.9002 16.3376C24.9966 16.4341 25.0649 16.5549 25.0977 16.6873C25.1306 16.8196 25.1267 16.9584 25.0866 17.0887L25.0819 17.0821Z" fill="black" />
      </svg></div>

    return (
      <div className='cursor-pointer py-1 font-medium text-sm text-gray-500 hover:text-teal-600' onClick={handleThemeSwitch}>
        {icon}
      </div>
    )
  }, [handleThemeSwitch, theme])

  return (
    <>
    <div className="sticky top-0 z-30">
    {pathname === '/' && <Banner />}
      <header className={`border-b border-line-dark sticky top-0 z-30 shadow-bottom ${theme === 'light' ? 'bg-nav-light border-slate-200' : 'bg-nav-dark border-line-dark'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">

          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            {showHamburgerButton && (
              <button
                className="text-slate-500 hover:text-slate-600 lg:hidden"
                aria-controls="sidebar"
                aria-expanded={sidebarOpen}
                onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen) }}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="5" width="16" height="2" />
                  <rect x="4" y="11" width="16" height="2" />
                  <rect x="4" y="17" width="16" height="2" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <a href="/" className="flex-shrink-0 flex items-center">
              {/* <p className="sm:text-sm md:text-base lg:text-xl xl:text-xl text-teal-600 font-bold">E-Learning</p> */}
              <div className='flex space-x-3 justify-center items-center'>
                <img src='/assets/images/navbar/favicon.ico' className='w-10 h-10'></img>
                <p className="sm:text-sm md:text-base lg:text-xl xl:text-xl text-gradient font-bold">E-Learning</p>
              </div>
            </a>
          </div>
          {/* Header: Center */}
          {/* <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:space-x-2">
            <a
              href="/"
              className={`block ${pathname === '/' ? 'text-white bg-custom-button-control' : theme === 'dark' ? 'text-white' : 'text-gray-500'} hover:text-neutral-400 truncate transition duration-150 ${pathname === '/' && 'hover:text-slate-200'} rounded px-2`}
            >
              {t('homepage.home')}
            </a>
          </div> */}

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            {/* {renderThemeSwitcher} */}
            <Notifications align="right" />
            {/*  Divider */}
            <hr className="w-px h-6 bg-slate-200 mx-3" />
            <UserMenu align="right" />

          </div>

        </div>
      </div>
    </header>
    </div>
    </>
  )
}

export default Navbar
