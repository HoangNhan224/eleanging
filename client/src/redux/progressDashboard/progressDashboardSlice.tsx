/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getProgressSummary } from 'api/post/post.api'

interface SummaryStats {
  totalUsers: number
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  avgProgress: number
}

interface ProgressDashboardState {
  summary: SummaryStats
  summaryLoading: boolean
  summaryError: string | null
}

const initialState: ProgressDashboardState = {
  summary: {
    totalUsers: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
    avgProgress: 0
  },
  summaryLoading: false,
  summaryError: null
}

export const fetchSummaryStats = createAsyncThunk(
  'progressDashboard/fetchSummary',
  async (courseId: string | undefined, thunkAPI) => {
    try {
      const params = courseId !== undefined && courseId !== '' ? { courseId } : undefined
      const response = await getProgressSummary(params)
      return response.data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return thunkAPI.rejectWithValue(error.response?.data?.message ?? 'Failed to fetch summary')
    }
  }
)

const progressDashboardSlice = createSlice({
  name: 'progressDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummaryStats.pending, (state) => {
        state.summaryLoading = true
        state.summaryError = null
      })
      .addCase(fetchSummaryStats.fulfilled, (state, action) => {
        state.summaryLoading = false
        state.summary = action.payload
      })
      .addCase(fetchSummaryStats.rejected, (state, action) => {
        state.summaryLoading = false
        state.summaryError = action.payload as string
      })
  }
})

export const selectSummary = (state: { progressDashboard: ProgressDashboardState }) =>
  state.progressDashboard.summary
export const selectSummaryLoading = (state: { progressDashboard: ProgressDashboardState }) =>
  state.progressDashboard.summaryLoading

export default progressDashboardSlice.reducer
