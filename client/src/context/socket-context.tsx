/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { createContext, useEffect, useCallback } from 'react'
import { getFromLocalStorage, setToLocalStorage } from 'utils/functions'
import Swal from 'sweetalert2'
import { refresh } from '../api/post/post.api'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from '../redux/notification/notifySlice'
import { setAuthData, clearAuthData, selectAuthTokens, selectUserRole, selectIsAuthenticated, refreshTokenThunk } from '../redux/auth/authSlice'
import { io, Socket } from 'socket.io-client'
import { AppDispatch } from '../redux/store'

const socketURL = process.env.REACT_APP_API_URL
const socket: Socket = io(socketURL, { autoConnect: false })

export const SocketContext = createContext(socket)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()

  const tokensFromRedux = useSelector(selectAuthTokens)
  const userRoleFromRedux = useSelector(selectUserRole)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const handleUpdate = useCallback((condition: boolean) => {
    if (!condition) return
    dispatch(refreshTokenThunk())
  }, [dispatch])
  const handleNewNotificationEvent = useCallback((data: { userId: string, notification: any }) => {
    if (data.userId === tokensFromRedux?.id) {
      dispatch(addNotification(data.notification))
    }
  }, [dispatch, tokensFromRedux])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'tokens' || event.key === null) {
        const tokensFromStorage = getFromLocalStorage<any>('tokens')
        if (!tokensFromStorage && isAuthenticated) {
          dispatch(clearAuthData())
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    if (!tokensFromRedux) {
      if (socket.connected) {
        socket.disconnect()
      }
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }

    if (!socket.connected) {
      socket.connect()
    }

    const onRoleUpdated = (data: any) => {
      const latestCurrentUserId = tokensFromRedux?.id
      const conditionMet = data.userId === latestCurrentUserId
      handleUpdate(conditionMet)
    }

    const onPermissionUpdated = (data: any) => {
      const conditionMet = data.roleDescription === userRoleFromRedux
      handleUpdate(conditionMet)
    }

    socket.on('roleUpdated', onRoleUpdated)
    socket.on('permissionUpdated', onPermissionUpdated)
    socket.on('newNotification', handleNewNotificationEvent)

    return () => {
      socket.off('roleUpdated', onRoleUpdated)
      socket.off('permissionUpdated', onPermissionUpdated)
      socket.off('newNotification', handleNewNotificationEvent)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [tokensFromRedux, userRoleFromRedux, dispatch, handleUpdate, handleNewNotificationEvent])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
