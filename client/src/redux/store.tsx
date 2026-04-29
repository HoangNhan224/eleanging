import { configureStore } from '@reduxjs/toolkit'
import notificationReducer from '../redux/notification/notifySlice'
import authReducer from '../redux/auth/authSlice'
import progressDashboardReducer from '../redux/progressDashboard/progressDashboardSlice'

const store = configureStore({
  reducer: {
    notify: notificationReducer,
    auth: authReducer,
    progressDashboard: progressDashboardReducer
  }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export default store
