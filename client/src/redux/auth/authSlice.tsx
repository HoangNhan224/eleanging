/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// filepath: client/src/redux/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import CryptoJS from 'crypto-js'
import axios from 'axios'
import { setToLocalStorage, removeAllLocalStorage, getFromLocalStorage } from 'utils/functions'
interface AuthState {
  tokens: any | null
  userRole: string | null
  isAuthenticated: boolean
}

const initialTokens = getFromLocalStorage<any>('tokens')
let initialRole: string | null = null
if (initialTokens?.key) {
  try {
    const bytes = CryptoJS.AES.decrypt(initialTokens.key, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
    const decryptedRole = bytes.toString(CryptoJS.enc.Utf8)
    initialRole = decryptedRole
  } catch (error) {
    console.error('Initial decryption error in authSlice:', error)
  }
}
const initialState: AuthState = {
  tokens: initialTokens,
  userRole: initialRole,
  isAuthenticated: !!initialTokens
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<any>) => {
      state.tokens = action.payload
      state.isAuthenticated = !!action.payload
      if (action.payload?.key) {
        try {
          const bytes = CryptoJS.AES.decrypt(action.payload.key, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
          const decryptedRole = bytes.toString(CryptoJS.enc.Utf8)
          state.userRole = decryptedRole
        } catch (error) {
          console.error('Decryption error in setAuthData:', error)
          state.userRole = null
        }
      } else {
        state.userRole = null
      }
    },
    clearAuthData: (state) => {
      state.tokens = null
      state.userRole = null
      state.isAuthenticated = false
    }
  },
  extraReducers: (builder) => {
    builder
      // refreshTokenThunk
      .addCase(refreshTokenThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.tokens = action.payload
        state.isAuthenticated = !!action.payload
        if (action.payload?.key) {
          try {
            const bytes = CryptoJS.AES.decrypt(action.payload.key, 'Access_Token_Secret_#$%_ExpressJS_Authentication')
            const decryptedRole = bytes.toString(CryptoJS.enc.Utf8)
            state.userRole = decryptedRole
          } catch (error) {
            state.userRole = null
          }
        } else {
          state.userRole = null
        }
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.tokens = null
        state.userRole = null
        state.isAuthenticated = false
      })
  }
})

export const { setAuthData, clearAuthData } = authSlice.actions

export const selectUserRole = (state: { auth: AuthState }) => state.auth.userRole
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthTokens = (state: { auth: AuthState }) => state.auth.tokens

export default authSlice.reducer

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      setToLocalStorage('tokens', JSON.stringify(response.data))
      return response.data
    } catch (error: any) {
      removeAllLocalStorage()
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to refresh token')
    }
  }
)
