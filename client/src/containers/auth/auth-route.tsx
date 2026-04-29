/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PRIVATE ROUTE: AUTHENTICATION
   ========================================================================== */

import { Navigate, useLocation } from 'react-router-dom'
import ROUTES from 'routes/constant'
import { useSelector } from 'react-redux'
import { selectUserRole, selectIsAuthenticated } from '../../redux/auth/authSlice'

interface IAuthRouteProps {
  children: JSX.Element
  allowedRoles?: string[]
}

const AuthRoute = ({ children, allowedRoles }: IAuthRouteProps) => {
  const location = useLocation()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userRole = useSelector(selectUserRole)
  if (isAuthenticated && (location.pathname === ROUTES.login || location.pathname === ROUTES.signup)) {
    return <Navigate to={ROUTES.homePage} replace />
  }
  if (!isAuthenticated && location.pathname !== ROUTES.login && location.pathname !== ROUTES.signup && location.pathname !== ROUTES.forgotpassword) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }
  if (allowedRoles && isAuthenticated && userRole && !allowedRoles.includes(userRole.toUpperCase())) {
    return <Navigate to={ROUTES.notfound} replace />
  }

  return (
          <>
            {children}
          </>
  )
}
export default AuthRoute
