/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: AccountPanel
   ========================================================================== */
import React, { useEffect, useState, useRef } from 'react'
import { findUserById, updateUser, uploadAvatar } from '../../../api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import AvatarEditor from 'react-avatar-editor'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { useDispatch } from 'react-redux'
import { setAuthData } from '../../../redux/auth/authSlice'

interface User {
  id: string
  firstName: string
  lastName: string
  gender: number
  age: string
  email: string
  username: string
  password?: string
  newPassword?: string
  groupName?: string
  currentPassword?: string
  googleId: string
  avatar?: string
}

interface PayloadType {
  firstName: string
  lastName: string
  gender: number
  age: string
  email: string
  username: string
  password?: string
  newPassword?: string
  currentPassword?: string
}

/**
 * AccountPanel component manages the user's account information.
 *
 * @component
 * @returns {JSX.Element} The rendered AccountPanel component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {User} user - The state for storing user data.
 * @property {User} originalUser - The state for storing the original user data.
 * @property {boolean} isEditing - The state for managing edit mode.
 * @property {boolean} isSettingNewPassword - The state for managing new password setting mode.
 * @property {object} objCheckInput - The state for managing input validation.
 * @property {string} errorField - The state for storing the error field.
 */
function AccountPanel () {
  const { t } = useTranslation()
  const [isAvatarEditing, setIsAvatarEditing] = useState(false)
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [avatarScale, setAvatarScale] = useState<number>(1)
  const [editor, setEditor] = useState<AvatarEditor | null>(null)
  const [avatarRotate, setAvatarRotate] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()
  const [user, setUser] = useState<User>({
    id: '',
    firstName: '',
    lastName: '',
    gender: -1,
    age: '',
    email: '',
    username: '',
    password: '',
    newPassword: '',
    currentPassword: '',
    googleId: ''
  })
  const [originalUser, setOriginalUser] = useState<User>(user)

  // Fetches the user data on component mount.
  useEffect(() => {
    const fetchUser = async () => {
      const tokens = getFromLocalStorage<any>('tokens')
      const userId = tokens?.id
      if (userId) {
        const response = await findUserById(userId)
        const userData = {
          ...response.data,
          groupName: response.data.Group?.name || '',
          googleId: response.data.googleId || ''
        }
        setUser(userData)
        setOriginalUser(userData)
      } else {
        console.error('User not found')
      }
    }
    fetchUser()
  }, [])

  const [isEditing, setIsEditing] = useState(false)

  // Handles enabling edit mode.
  const handleEditProfile = () => {
    setIsEditing(true) // chỉ cho phép edit 1 lần
    // setIsEditing(prevIsEditing => !prevIsEditing) // cho phép edit nhiều lần
  }

  //  Handles canceling edit mode.
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Preserve the current avatar while resetting other fields
    const currentAvatar = user.avatar
    setUser({
      ...originalUser,
      avatar: currentAvatar
    })
    setObjCheckInput({ ...defaultObjCheckInput })
    setIsSettingNewPassword(false)
    setErrorField('')
  }

  // Handles canceling new password setting mode.
  const handleCancelSet = () => {
    setObjCheckInput({ ...defaultObjCheckInput })
    setIsSettingNewPassword(false)
    setUser(prevUser => ({ ...prevUser, newPassword: '', currentPassword: '' }))
    setErrorField('')
  }

  // validate
  const defaultObjCheckInput = {
    isValidFirstName: true,
    isValidLastName: true,
    isValidAge: true,
    isValidEmail: true,
    isValidGender: true,
    isValidPassword: true,
    isValidCurrentPassword: true
  }
  const [objCheckInput, setObjCheckInput] = useState(defaultObjCheckInput)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const genderRef = useRef<HTMLSelectElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const currentPasswordRef = useRef<HTMLInputElement>(null)

  const [errorField, setErrorField] = useState<string>('')

  /**
   * Validates the input fields.
   *
   * @author Hien
   * @returns {boolean} True if all inputs are valid, otherwise false.
   */
  const isValidInputs = () => {
    setObjCheckInput(defaultObjCheckInput)
    if (user.firstName === '' || user.firstName === null) {
      toast.error(t('profile.toast.firstName_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidFirstName: false })
      if (firstNameRef.current) {
        firstNameRef.current.focus()
      }
      return false
    }
    const regxFirstName = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u024F\u1EA0-\u1EFF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]*$/
    if (!regxFirstName.test(user.firstName)) {
      toast.error(t('profile.toast.firstName_must_be_string'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidFirstName: false })
      if (firstNameRef.current) {
        firstNameRef.current.focus()
      }
      return false
    }
    const regxLastName = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u024F\u1EA0-\u1EFF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]*$/
    if (!regxLastName.test(user.lastName)) {
      toast.error(t('profile.toast.lastName_must_be_string'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidLastName: false })
      if (lastNameRef.current) {
        lastNameRef.current.focus()
      }
      return false
    }
    if (user.lastName === '' || user.lastName === null) {
      toast.error(t('profile.toast.lastName_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidLastName: false })
      if (lastNameRef.current) {
        lastNameRef.current.focus()
      }
      return false
    }
    if (user.gender === -1 || user.gender === null) {
      toast.error(t('profile.toast.gender_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidGender: false })
      if (genderRef.current) {
        genderRef.current.focus()
      }
      return false
    }
    if (user.age === '' || user.age === null) {
      toast.error(t('profile.toast.age_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    if (isNaN(Number(user.age))) {
      toast.error(t('profile.toast.age_must_be_number'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    if (Number(user.age) > 150) {
      toast.error(t('profile.toast.invalid_age'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    const regxs = /^[0-9]*$/
    if (!regxs.test(user.age)) {
      toast.error(t('profile.toast.age_must_be_positive_integer'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidAge: false })
      if (ageRef.current) {
        ageRef.current.focus()
      }
      return false
    }
    if (user.email === '' || user.email === null) {
      toast.error(t('profile.toast.email_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidEmail: false })
      if (emailRef.current) {
        emailRef.current.focus()
      }
      return false
    }
    const regx = /\S+@\S+\.\S+/
    if (!regx.test(user.email)) {
      toast.error(t('profile.toast.email_invalid'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidEmail: false })
      if (emailRef.current) {
        emailRef.current.focus()
      }
      return false
    }
    const regxPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (user.newPassword && !regxPassword.test(user.newPassword)) {
      toast.error(t('profile.toast.password_minimum_characters'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidPassword: false })
      if (passwordRef.current) {
        passwordRef.current.focus()
      }
      return false
    }
    if (isSettingNewPassword && (user.currentPassword === '' || user.currentPassword === null || user.currentPassword === undefined)) {
      toast.error(t('profile.toast.current_password_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidCurrentPassword: false })
      if (currentPasswordRef.current) {
        currentPasswordRef.current.focus()
      }
      return false
    }
    if (isSettingNewPassword && (user.newPassword === '' || user.newPassword === null || user.newPassword === undefined)) {
      toast.error(t('profile.toast.new_password_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidPassword: false })
      if (passwordRef.current) {
        passwordRef.current.focus()
      }
      return false
    }
    return true
  }

  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false)

  // Handles enabling new password setting mode.
  const handleSetNewPasswordClick = () => {
    if (user.googleId) {
      toast.warning(t('profile.toast.google_account_warning'))
      return
    }
    setIsSettingNewPassword(true)
  }

  const isUserChanged = () => {
    return JSON.stringify(user) !== JSON.stringify(originalUser)
  }

  /**
   * Handles saving changes to the user profile.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSaveChanges = async () => {
    try {
      if (!isUserChanged()) {
        toast.info(t('profile.toast.no_changes_detected'))
        return
      }
      if (isValidInputs()) {
        const { id, newPassword, password, ...payload } = user
        let finalPayload: PayloadType = payload
        if (newPassword) {
          finalPayload = { ...payload, password: newPassword }
        }
        const response = await updateUser(parseInt(id), finalPayload)
        if (response.status === 200) {
          toast.success(t('profile.toast.update_successfully'))
          setIsEditing(false)
          setIsSettingNewPassword(false)
          const tokens = getFromLocalStorage<any>('tokens')
          tokens.firstName = response.data.firstName
          tokens.lastName = response.data.lastName
          tokens.email = response.data.email
          localStorage.setItem('tokens', JSON.stringify(tokens))
          dispatch(setAuthData(tokens))
          window.dispatchEvent(new Event('storage'))
          setOriginalUser(user)
        } else {
          toast.error(t('profile.toast.update_failed'))
        }
      }
    } catch (error: any) {
      // toast.error(error.message)
      if (error.field) {
        setErrorField(error.field)
        if (error.field === 'currentPassword') {
          currentPasswordRef.current?.focus()
          toast.error(t('profile.toast.current_password_incorrect'))
        }
      } else {
        // toast.error(error.message)
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarImage(e.target.files[0])
      setIsAvatarEditing(true)

      // Reset the value of the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAvatarSave = async () => {
    setIsUploading(true)
    if (editor) {
      const canvasScaled = editor.getImageScaledToCanvas().toDataURL()
      // Convert data URL to Blob
      const blob = await fetch(canvasScaled).then(async (res) => await res.blob())
      const file = new File([blob], 'avatar.png', { type: 'image/png' })
      const formData = new FormData()
      formData.append('avatar', file)

      try {
        const response = await uploadAvatar(user.id, formData)
        if (response.status === 200) {
          toast.success(t('profile.toast.avatar_update_success'))
          const updatedAvatar = response.data.avatar
          setUser({ ...user, avatar: response.data.avatar })
          setIsAvatarEditing(false)
          setAvatarRotate(0)
          setAvatarScale(1)

          // Update avatar in localStorage
          const tokens = getFromLocalStorage<any>('tokens')
          tokens.avatar = updatedAvatar
          localStorage.setItem('tokens', JSON.stringify(tokens))
          dispatch(setAuthData(tokens))
          window.dispatchEvent(new Event('storage'))

          await findUserById(user.id)
        } else {
          toast.error(t('profile.toast.avatar_update_failed'))
        }
      } catch (error) {
        toast.error(t('profile.toast.avatar_update_error'))
      } finally {
        setIsUploading(false)
      }
    }
  }

  const setEditorRef = (editorInstance: AvatarEditor | null) => {
    setEditor(editorInstance)
  }
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
    <div className="bg-white shadow-lg rounded-sm border border-slate-200 w-full">
      <div className="relative">
        <img className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 object-cover" src='/assets/images/profiler/cover-image.png' alt="User cover" />
        <div className="absolute left-4 sm:left-8 md:left-10 -bottom-14 sm:-bottom-16 md:-bottom-20 flex items-center">
          <div className="relative">
            <div className="rounded-full border-4 border-teal-400 overflow-hidden w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 flex-shrink-0">
              <img
                className="w-full h-full object-cover"
                src={getAvatarUrl(user.avatar)}
                alt="User avatar"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `${process.env.REACT_APP_API}/uploads/avatars/avatardefault.png`
                }}
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-[10%] right-[10%] inline-flex items-center bg-gray-800 text-white p-1 rounded-full cursor-pointer"
            >
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                ref={fileInputRef}
              />
              <CameraAltIcon
                sx={{
                  fontSize: {
                    xs: 10,
                    sm: 12,
                    md: 14,
                    lg: 18,
                    xl: 20
                  }
                }}
              />
            </label>
          </div>
          <div className="mt-16 ml-4 sm:ml-6 flex flex-col justify-center w-36 sm:w-44 md:w-64 lg:w-72 xl:w-80">
            <p className='font-semibold text-base sm:text-lg md:text-xl overflow-hidden overflow-ellipsis whitespace-nowrap'>{`${originalUser?.firstName || ''} ${originalUser?.lastName || ''}`}</p>
            <p className='text-gray-500 text-xs sm:text-sm md:text-base overflow-hidden overflow-ellipsis whitespace-nowrap'>{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 sm:mt-12 md:mt-16 flex justify-end pr-4 sm:pr-8 md:pr-10 lg:pr-12">
        <button className="bg-gray-300 text-black rounded-md px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-400 hover:text-black flex items-center" onClick={handleEditProfile}>
          <ManageAccountsIcon className='mr-2 -mt-1' />
          <span className="hidden sm:inline">{t('profile.editProfile')}</span>
        </button>
      </div>

      <div className='p-5'>
        <div className="my-16 bg-white border border-gray-200 rounded-lg shadow p-5">
          <div>
            <h2 className="text-2xl text-slate-800 font-bold mb-6">{t('profile.myProfile')}</h2>
            <div className="grid gap-5 md:grid-cols-4">
              <div>
                {/* Start */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="firstName">
                    {t('profile.firstName')}
                  </label>
                  <input
                    ref={firstNameRef}
                    id="firstName"
                    className={objCheckInput.isValidFirstName ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                    type="text"
                    required
                    value={user?.firstName ?? ''}
                    onChange={(e) => {
                      setUser({ ...user, firstName: e.target.value })
                      setObjCheckInput({ ...objCheckInput, isValidFirstName: true })
                    }}
                    disabled={!isEditing}
                  />
                </div>
                {/* End */}
              </div>

              <div>
                {/* Start */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="lastName">
                    {t('profile.lastName')}
                  </label>
                  <input id="lastName"
                    className={objCheckInput.isValidLastName ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                    type="text"
                    required
                    value={user?.lastName ?? ''}
                    onChange={(e) => {
                      setUser({ ...user, lastName: e.target.value })
                      setObjCheckInput({ ...objCheckInput, isValidLastName: true })
                    }}
                    disabled={!isEditing}
                  />
                </div>
                {/* End */}
              </div>

              {/* Select */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="gender">
                  {t('profile.gender')}
                </label>
                <select
                  id="gender"
                  className={
                    objCheckInput.isValidGender
                      ? `form-select w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}`
                      : 'form-select w-full border p-2 rounded-md focus:outline-none border-red-500'
                  }
                  value={user?.gender ?? -1}
                  onChange={(e) => {
                    setUser({ ...user, gender: parseInt(e.target.value) })
                    setObjCheckInput({ ...objCheckInput, isValidGender: true })
                  }}
                  disabled={!isEditing}
                >
                  <option value={-1}>{t('profile.selectGender')}</option> {/* Default option */}
                  <option value={0}>{t('profile.male')}</option>
                  <option value={1}>{t('profile.female')}</option>
                  <option value={2}>{t('profile.other')}</option>
                </select>
              </div>

              <div>
                {/* Start */}
                <div className='w-1/2'>
                  <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="age">
                    {t('profile.age')}
                  </label>
                  <input id="age"
                    className={objCheckInput.isValidAge ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                    type="text"
                    required
                    value={user?.age ?? ''}
                    onChange={(e) => {
                      setUser({ ...user, age: e.target.value })
                      setObjCheckInput({ ...objCheckInput, isValidAge: true })
                    }}
                    disabled={!isEditing}
                  />
                </div>
                {/* End */}
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 mt-5">
              {/* Start */}
              {/* <div>
                <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="email">
                  {t('profile.email')}
                </label>
                <input id="email"
                  className={objCheckInput.isValidEmail ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                  type="email"
                  required
                  value={user?.email ?? ''}
                  onChange={(e) => {
                    setUser({ ...user, email: e.target.value })
                    setObjCheckInput({ ...objCheckInput, isValidEmail: true })
                  }}
                  disabled={!isEditing}
                />
              </div> */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`}>
                  {t('profile.email')}
                </label>
                <input
                  className='form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 disabled:opacity-50 cursor-not-allowed'
                  value={user?.email ?? ''}
                  disabled={true}
                />
              </div>
              {/* End */}
              {/* Start */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`}>
                  {t('profile.group')}
                </label>
                <input
                  className='form-input w-2/5 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 disabled:opacity-50 cursor-not-allowed'
                  value={user?.groupName ?? ''}
                  disabled={true}
                />
              </div>
              {/* End */}
            </div>
            <div className="grid gap-5 md:grid-cols-1 mt-5">
              {/* Start */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isEditing ? '' : 'text-neutral-400'}`} htmlFor="password">
                  {t('profile.password')}
                </label>
                {isSettingNewPassword && (
                  <>
                    <div className="grid gap-5 md:grid-cols-3 mb-4">
                      <input
                        className={`form-input w-full border p-2 rounded-md focus:outline-none ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'} ${objCheckInput.isValidCurrentPassword && errorField !== 'currentPassword' ? 'border-gray-300 focus:ring-1 focus:ring-teal-400' : 'border-red-500'}`}
                        type="password"
                        id="currentPassword"
                        placeholder={t('profile.enterCurrentPassword') ?? 'Defaultplaceholder'}
                        onChange={(e) => {
                          setUser({ ...user, currentPassword: e.target.value })
                          setObjCheckInput({ ...objCheckInput, isValidCurrentPassword: true })
                          setErrorField('')
                        }}
                      />
                    </div>
                    <div className="grid gap-5 md:grid-cols-3 mb-4">
                      <input
                        className={objCheckInput.isValidPassword ? `form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 ${isEditing ? '' : 'disabled:opacity-50 cursor-not-allowed'}` : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                        type="password"
                        id="newPassword"
                        placeholder={t('profile.enterNewPassword') ?? 'Defaultplaceholder'}
                        onChange={(e) => {
                          setUser({ ...user, newPassword: e.target.value })
                          setObjCheckInput({ ...objCheckInput, isValidPassword: true })
                        }}
                      />
                    </div>
                  </>
                )}
                {isSettingNewPassword && (
                  <div>
                    <button className="bg-white text-teal-400 px-2 py-2 rounded-md border border-gray-300 hover:bg-teal-400 hover:text-white" onClick={handleCancelSet}>{t('profile.cancelSetNewPassword')}</button>
                  </div>
                )}
                {!isSettingNewPassword && (
                  <div>
                    <p className={`text-gray-500 ${isEditing ? '' : 'text-neutral-400'}`}>{t('profile.title')}</p>
                    <button
                      className={`bg-white text-teal-400 px-2 py-2 rounded-md border border-gray-300 hover:bg-teal-400 hover:text-white ${isEditing ? '' : 'opacity-50 cursor-not-allowed text-neutral-400 hover:bg-white hover:text-neutral-400'}`}
                      disabled={!isEditing}
                      onClick={handleSetNewPasswordClick}
                    >
                      {t('profile.setNewPassword')}
                    </button>
                  </div>
                )}

              </div>
              {/* End */}
            </div>
            {isEditing
              ? (
                <div className="flex justify-end mt-6">
                  <button className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2  hover:bg-gray-400 hover:text-black" onClick={handleCancelEdit}>{t('profile.cancel')}</button>
                  <button className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white" onClick={handleSaveChanges}>{t('profile.saveChanges')}</button>
                </div>
                )
              : null}
          </div>
        </div>
      </div>
      {/* Modal edit Avatar */}
      {isAvatarEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">{t('profile.edit_avatar')}</h2>
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 mb-4 relative">
                <AvatarEditor
                  ref={setEditorRef}
                  image={avatarImage!}
                  width={250}
                  height={250}
                  border={0}
                  borderRadius={125}
                  color={[255, 255, 255, 0.6]} // RGBA
                  scale={avatarScale} // Zoom
                  rotate={avatarRotate} // Rotate
                  className="editor-canvas"
                />
                <div className="absolute inset-0 rounded-full border-4 border-teal-400 pointer-events-none"></div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-2">{t('profile.zoom')}</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={avatarScale}
                  onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#14b8a6' }}
                />
              </div>
              <div className="w-full mt-4">
                <label className="block text-sm font-medium mb-2">{t('profile.rotate')}: {avatarRotate}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={avatarRotate}
                  onChange={(e) => setAvatarRotate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#14b8a6' }}
                />
              </div>
              <div className="flex justify-end mt-6 w-full">
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition duration-200"
                  onClick={() => {
                    setIsAvatarEditing(false)
                    setAvatarImage(null)
                    setAvatarRotate(0)
                    setAvatarScale(1)
                  }}
                >
                  {t('profile.cancel')}
                </button>
                <button
                  className={`bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAvatarSave}
                  disabled={isUploading}
                >
                  {isUploading ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

export default AccountPanel
