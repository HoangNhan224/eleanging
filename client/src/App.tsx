/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* APP
   ========================================================================== */

import 'assets/styles/reset.css'
import 'assets/styles/global.css'
import 'services/i18n'

import { BrowserRouter, useRoutes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ErrorBoundary from 'containers/error-boundary/error-boundary'
import { ThemesProvider } from 'services/styled-themes'
import { reload } from 'utils/functions'
import routes from 'routes'
import React from 'react'
import { Provider } from 'react-redux'
import store from './redux/store'
import 'react-toastify/dist/ReactToastify.css'
import { SocketProvider } from './context/socket-context'
/**
       * Entry point for route component
       * @returns JSX Element represents for route components
       */
const Main = () => {
  const element = useRoutes(routes)
  return element
}

/**
       * Entry point for App
       * @returns JSX Element represents for app
       */
const App = () => {
  return (
    <React.StrictMode>
      <Provider store={store}>
       <SocketProvider>
         <ErrorBoundary onReset={reload}>
           <BrowserRouter>
             <ThemesProvider>
               <Main />
             </ThemesProvider>
           </BrowserRouter>
         </ErrorBoundary>
         <ToastContainer
           position="top-right"
           autoClose={3000}
           hideProgressBar={false}
           newestOnTop={true}
           closeOnClick
           rtl={false}
           pauseOnFocusLoss
           draggable
           pauseOnHover
         />
       </SocketProvider>
      </Provider>
    </React.StrictMode>
  )
}

export default App
