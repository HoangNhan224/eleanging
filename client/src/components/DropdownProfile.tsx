/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
   ========================================================================== */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Transition from '../utils/Transition'
import { getFromLocalStorage, removeAllLocalStorage } from 'utils/functions'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import LayersIcon from '@mui/icons-material/Layers'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import ROUTES from 'routes/constant'
import { useTranslation } from 'services/i18n'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import CryptoJS from 'crypto-js'
import { logout } from 'api/post/post.api'
import { useDispatch, useSelector } from 'react-redux'
import ModalComponent from './Modal'
import { toast } from 'react-toastify'
import { removeAllNotificationsSlice } from '../redux/notification/notifySlice'
import { selectUserRole, selectAuthTokens, clearAuthData } from '../redux/auth/authSlice'
import TokenIcon from '@mui/icons-material/Token'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
interface DropdownProfileProps {
  align: string
}

function DropdownProfile ({ align }: DropdownProfileProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userRoleFromRedux = useSelector(selectUserRole)
  const tokensFromRedux = useSelector(selectAuthTokens)
  const userLastName = tokensFromRedux?.lastName
  const userFirstName = tokensFromRedux?.firstName
  const userEmail = tokensFromRedux?.email
  const userAvatar = tokensFromRedux?.avatar
  const { t, i18n } = useTranslation()
  // const { theme, setTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })
  const [choiceModalOpen, setChoiceModalOpen] = useState(false)
  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }) => {
      if (!dropdown.current) return
      if (!dropdownOpen || dropdown.current?.contains(target as Node) || trigger.current?.contains(target as Node)) return
      setDropdownOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (!dropdownOpen || keyCode !== 27) return
      setDropdownOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  const handleLogout = useCallback(async () => {
    try {
      setChoiceModalOpen(false)
      const response = await logout()
      if (response) {
        removeAllLocalStorage()
        navigate(ROUTES.login)
        dispatch(removeAllNotificationsSlice())
        dispatch(clearAuthData())
        toast.success(t('homepage.logout_success'), {
          toastId: 'logout-success'
        })
      }
    } catch (error) {
      console.error(error)
    }
  }, [dispatch, navigate])
  const handleOpenLogOutModal = useCallback(() => {
    setChoiceModalOpen(true)
  }, [])
  const languageOptions = useMemo(() => {
    return [
      { label: 'EN', value: 'en', flag: getUnicodeFlagIcon('GB') },
      { label: 'VN', value: 'vi', flag: getUnicodeFlagIcon('VN') }
    ]
  }, [])

  const handleChange = useCallback(
    async (e) => {
      try {
        const newLanguage = e.target.value
        await i18n.changeLanguage(newLanguage)
        setSelectedLanguage(newLanguage)
        localStorage.setItem('selectedLanguage', newLanguage)
      } catch (error) {
        console.log(error)
      }
    },
    [i18n]
  )
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])

  const data = userRoleFromRedux
  const activateLink = useCallback((isLastItem?: boolean) => {
    return ({ isActive }: { isActive: boolean }) => ({
      marginRight: (isLastItem ?? false) ? 0 : 20,
      color: isActive ? 'green' : ''
    })
  }, [])

  const getAvatarUrl = (avatarPath?: string) => {
    // Check if avatarPath starts with 'http'
    if (avatarPath?.startsWith('http')) {
      return avatarPath
    }
    // If not, replace '../../client/public' with an empty string or return a default URL
    return avatarPath
      ? `${process.env.REACT_APP_API}/uploads/avatars/${avatarPath}`
      : `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
  }

  return (
    <div className="relative inline-flex z-50">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img className="w-8 h-8 rounded-full" src={getAvatarUrl(userAvatar)} referrerPolicy="no-referrer" width="32" height="32" alt="User" onError={(e) => {
          e.currentTarget.src = `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
        }} />
      </button>

      <Transition
        className={`origin-top-right absolute top-full min-w-44 bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="flex items-center py-1 px-3">
            <img className="w-12 h-12 rounded-full -mt-2" src={getAvatarUrl(userAvatar)} referrerPolicy="no-referrer" width="44" height="44" alt="User" onError={(e) => {
              e.currentTarget.src = `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
            }} />
            <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-200 w-32">
              <p className='font-bold text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>
                {`${userFirstName || ''} ${userLastName || ''}`}
              </p>
              <p className='text-gray-500 text-xs overflow-hidden overflow-ellipsis whitespace-nowrap'>{userEmail}</p>
            </div>
          </div>
          <div className='px-2 py-1'>
            <select
              className="w-full px-4 py-2 rounded-lg font-bold text-gray-700 border border-gray-300 focus:border-indigo-500 focus:outline-none shadow"
              onChange={handleChange}
              value={selectedLanguage}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value} className="font-bold py-2">
                  {option.flag}&nbsp;&nbsp;&nbsp;{option.label}&nbsp;&nbsp;{option.value === selectedLanguage && '✔'}
                </option>
              ))}
            </select>
          </div>
          <ul>
            <li>
              <Link
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                to="/settings/profile"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <AccountCircleIcon className="mr-2" />
                {t('dropdown.profile')}
              </Link>
            </li>

            {/* {(data === 'ADMIN' || data === 'MANAGER') && (

              <li>
                <Link
                  className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                  to={ROUTES.userDashboard}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <QueryStatsRoundedIcon className="mr-2" />
                  {t('dropdown.userDashboard')}
                </Link>
              </li>
            )} */}
            <li>
              <Link
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                to="/mycourses"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <LayersIcon className="mr-2" />
                {t('dropdown.mycourse')}
              </Link>
            </li>
            {/* <li>
              <Link
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                to="/blog"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <NewspaperIcon className="mr-2" />
                {t('dropdown.blog')}
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                to="/settings"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <SettingsIcon className="mr-2" />
                {t('dropdown.setting')}
              </Link>
            </li> */}
            <li>
              <Link
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                to={ROUTES.group_exam_list}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <TokenIcon className="mr-2" />
                {t('dropdown.team_exam')}
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                to={ROUTES.exam_result}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <CreditScoreIcon className="mr-2" />
                {t('dropdown.exam_result')}
              </Link>
            </li>
            {/* {renderThemeSwitcher} */}
            <li>
              <button
                className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                onClick={handleOpenLogOutModal}
              >
                <LogoutIcon className="mr-2" />
                {t('dropdown.logout')}
              </button>
            </li>
            <hr className="bg-slate-200 my-2" />
            {(data === 'ADMIN' || data === 'MANAGER') && (
              <li>
                <Link
                  className="font-medium text-sm text-gray-500 hover:text-teal-600 flex items-center py-1 px-6"
                  to={ROUTES.userDashboard}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <AdminPanelSettingsIcon className="mr-2" />
                  {t('dropdown.gottoadmin')}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </Transition>
      <ModalComponent
        isOpen={choiceModalOpen}
        title={t('homepage.logout') as string}
        description={t('homepage.logout_confirm') as string}
        onCancel={() => setChoiceModalOpen(false)}
        onOk={handleLogout}
        onClose={() => setChoiceModalOpen(false)}
      />
    </div>
  )
}

export default DropdownProfile
