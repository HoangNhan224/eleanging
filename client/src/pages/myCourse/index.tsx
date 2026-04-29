/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: COURSE
   ========================================================================== */

// TODO: remove later
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { Pagination } from '@mui/material'
import MyCourseCard from 'components/MyCourseCard'
import { DataListCourse, ListCourseParams } from 'api/post/post.interface'
import { getListMyCourses, getCategoryCourseData, getListMyCoursesActive, getListMyCoursesDone } from 'api/post/post.api'
import { getFromLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { styled } from '@mui/system'
import { PacmanLoader } from 'react-spinners'
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import { useTheme } from 'services/styled-themes'
import DatePicker from 'react-datepicker'
import { useDatePickerLocale } from '../../hooks/useDatePickerLocale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

interface ParamsList extends ListCourseParams {
}
/**
 * MyCourse component displays the user's courses, including enrolled, active, and completed courses.
 *
 * This component fetches and displays user course data in a tabbed interface. It supports filtering by category,
 * search functionality, date range filtering, pagination, and toggling between grid and list views.
 * The component also listens for language changes and updates the content accordingly.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered MyCourse component.
 *
 * @property {number} page - The current page number for all courses.
 * @property {number} pageDone - The current page number for completed courses.
 * @property {number} pageActive - The current page number for active courses.
 * @property {DataListCourse | undefined} dataState - The data for all courses.
 * @property {DataListCourse | undefined} dataStateDone - The data for completed courses.
 * @property {DataListCourse | undefined} dataStateActive - The data for active courses.
 * @property {Function} t - The translation function from react-i18next.
 * @property {number} currentTab - The current tab index.
 * @property {Function} navigate - The navigation function from react-router-dom.
 * @property {Date | null} startDate - The start date for filtering courses.
 * @property {Date | null} endDate - The end date for filtering courses.
 * @property {any} dataCategory - The data for course categories.
 * @property {string} categorySearch - The selected category ID for filtering.
 * @property {string} search - The search term for filtering courses.
 * @property {boolean} isLoading - Indicates if the component is in a loading state.
 * @property {boolean} isPressed - Indicates if the search button is pressed.
 * @property {boolean} displayGrid - Indicates if the grid view should be displayed.
 * @property {boolean} isGridView - Indicates if the current view is grid view.
 */
const MyCourse = () => {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  const { locale, dateFormat, formatDateForAPI } = useDatePickerLocale()
  const CustomPagination = styled(Pagination)({
    '.MuiPagination-ul': {
      display: 'inline-flex',
      fontSize: 'large',
      listStyle: 'none',
      margin: '10px'
    },
    '.MuiPaginationItem-root': {
      fontSize: 'large',
      fontWeight: 'bold',
      borderRadius: '4px',
      margin: '2px',
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      color: '#718096',
      '&:hover': {
        backgroundColor: '#667eea',
        color: 'white'
      }
    },
    '.MuiPaginationItem-firstLast': {
      borderRadius: '4px'
    },
    '.MuiPaginationItem-previousNext': {
      borderRadius: '4px',
      margin: '10px',
      '@media (min-width: 600px)': {
        margin: '20px'
      }
    },
    '.MuiPaginationItem-page.Mui-selected': {
      color: '#667eea',
      fontWeight: 'bold',
      border: '2px solid #667eea',
      '&:hover': {
        backgroundColor: '#667eea',
        color: 'white'
      }
    },
    '.MuiPaginationItem-ellipsis': {
      color: '#a0aec0',
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      padding: '2px',
      margin: '0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
  const [page, setPage] = useState<number>(1)
  const [pageDone, setPageDone] = useState<number>(1)
  const [pageActive, setPageActive] = useState<number>(1)
  const [dataState, setDataState] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateDone, setDataStateDone] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateActive, setDataStateActive] = useState<DataListCourse | undefined>(
    undefined
  )
  const [currentTab, setCurrentTab] = useState(0)
  const navigate = useNavigate()
  const defaultStartDate = new Date('1970-01-01')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const defaultEndDate = new Date('9999-12-31')
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [dataCategory, setDataCategory] = useState<any>(null)
  const [categorySearch, setCategorySearch] = useState('all')
  const [search, setSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPressed, setIsPressed] = useState(false)
  const [displayGrid, setDisplayGrid] = useState<boolean>(true)
  const [isGridView, setIsGridView] = useState(true)

  /**
   * Toggles the view mode between grid and list.
   *
   * @author Canh
   * @returns {void}
   */
  const handleViewToggle = () => {
    setIsGridView(!isGridView)
  }
  /**
   * Handles changes to the start date input field.
   *
   * @author Canh
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the input.
   * @returns {void}
   */
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (isNaN(date.getTime())) {
      setStartDate(null)
    } else {
      setStartDate(date)
    }
  }
  /**
   * Handles changes to the end date input field.
   *
   * @author Canh
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the input.
   * @returns {void}
   */
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value)
    if (isNaN(date.getTime())) {
      setEndDate(null)
    } else {
      setEndDate(date)
    }
  }
  /**
 * Handles changes to the category selection input.
 *
 * @author Canh
 * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event from the select input.
 * @returns {void}
 */
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategorySearch(event.target.value)
  }
  /**
 * Fetches the user's courses based on the provided parameters.
 *
 * @author Canh
 * @param {ParamsList} [params] - Optional parameters for pagination and filtering.
 * @returns {Promise<void>} - A promise that resolves when the data fetching is complete.
 */
  const getDataMyCourse = async (params?: ParamsList) => {
    setIsLoading(true)
    try {
      const page = params?.page ?? 1
      const listCourseResponse = await getListMyCourses({ params })
      if (!listCourseResponse.data) {
        setDataState(undefined)
      } else {
        const data = listCourseResponse?.data
        setDataState(data)
        setPage(page)
      }
    } catch (e) {
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', {
          replace: true
        })
      }
    }
    setIsLoading(false)
  }
  /**
 * Fetches the user's courses when the component mounts.
 *
 * @author Canh
 * @param {void} - This effect does not take any parameters.
 * @returns {void} - This effect does not return a value.
 */
  useEffect(() => {
    getDataMyCourse({ page: 1 })
  }, [])
  // COURSE DONE
  /**
 * Fetches the list of completed courses for the user.
 *
 * @author Canh
 * @param {ParamsList} [params] - Optional parameters for pagination and filters.
 * @returns {Promise<void>} - Sets the state with the completed courses data or navigates to login on error.
 */
  const getDataMyCourseDone = async (params?: ParamsList) => {
    try {
      const page = params?.page ?? 1
      const listCourseResponse = await getListMyCoursesDone({ params })
      if (!listCourseResponse.data) {
        setDataStateDone(undefined)
      } else {
        const data = listCourseResponse?.data
        setDataStateDone(data)
        setPageDone(page)
      }
    } catch (e) {
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', {
          replace: true
        })
      }
    }
  }
  /**
 * useEffect hook to fetch the initial list of completed courses when the component mounts.
 *
 * @author Canh
 * @returns {void} - Triggers the fetching of completed courses for page 1.
 */
  useEffect(() => {
    getDataMyCourseDone({ page: 1 })
  }, [])

  // COURSE ACTIVE
  /**
   * Fetches the list of active courses for the user.
   *
   * @author Canh
   * @param {ParamsList} [params] - Optional parameters including pagination data (e.g., page number).
   * @returns {Promise<void>} - Sets the active course data or redirects to login if no tokens are found.
   */
  const getDataMyCourseActive = async (params?: ParamsList) => {
    try {
      const page = params?.page ?? 1
      const listCourseResponse = await getListMyCoursesActive({ params })
      if (!listCourseResponse.data) {
        setDataStateActive(undefined)
      } else {
        const data = listCourseResponse?.data
        setDataStateActive(data)
        setPageActive(page)
      }
    } catch (e) {
      const tokens = getFromLocalStorage<any>('tokens')
      if (tokens === null) {
        navigate('/login', {
          replace: true
        })
      }
    }
  }
  /**
 * Effect hook to fetch the user's active courses on component mount.
 *
 * @author Canh
 */
  useEffect(() => {
    getDataMyCourseActive({ page: 1 })
  }, [])
  /**
   * Effect hook to fetch course data (all, done, active) when the current tab changes.
   *
   * @author Canh
   */
  useEffect(() => {
    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate
    getDataMyCourse({ page: 1, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    getDataMyCourseDone({ page: 1, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    getDataMyCourseActive({ page: 1, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }, [currentTab])
  /**
   * Handles the search action on form submission.
   * Fetches the relevant course data based on the current tab and search parameters.
   * Resets loading states and toggles the display view.
   *
   * @author Canh
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setIsPressed(false)
    setIsLoading(true)

    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate
    getDataMyCourse({ page: 1, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    getDataMyCourseActive({ page: 1, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
    getDataMyCourseDone({ page: 1, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })

    setDisplayGrid(false)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }
  /**
 * Calculates the total number of pages based on the data state.
 * Determines the size and total record count, then calculates the total pages.
 *
 * @author Canh
 * @returns {number} The total number of pages.
 */
  const totalPage = useMemo(() => {
    const size = (dataState != null) ? dataState.size : 8
    const totalRecord = (dataState != null) ? dataState.totalRecords : 8
    return Math.ceil(totalRecord / size)
  }, [dataState])
  /**
 * Calculates the total number of pages for completed courses based on the data state.
 * Determines the size and total record count, then computes the total pages.
 *
 * @author Canh
 * @returns {number} The total number of pages for completed courses.
 */
  const totalPageDone = useMemo(() => {
    const size = (dataStateDone != null) ? dataStateDone.size : 8
    const totalRecord = (dataStateDone != null) ? dataStateDone.totalRecords : 8
    return Math.ceil(totalRecord / size)
  }, [dataStateDone])
  /**
 * Calculates the total number of pages for active courses based on the data state.
 * Determines the size and total record count, then computes the total pages.
 *
 * @author Canh
 * @returns {number} The total number of pages for active courses.
 */
  const totalPageActive = useMemo(() => {
    const size = (dataStateActive != null) ? dataStateActive.size : 8
    const totalRecord = (dataStateActive != null) ? dataStateActive.totalRecords : 8
    return Math.ceil(totalRecord / size)
  }, [dataStateActive])
  /**
 * Fetches the category course data and sets it in the state.
 * If an error occurs during the fetch, sets the category data to null.
 *
 * @author Canh
 * @returns {Promise<void>} No return value, updates state with fetched data or null on error.
 */
  const fetchData = useCallback(async () => {
    try {
      const response = await getCategoryCourseData()
      setDataCategory(response.data)
    } catch (error) {
      setDataCategory(null)
    }
  }, [])
  /**
   * Effect that fetches category course data when the component mounts or when
   * the fetchData function reference changes.
   *
   * @author Canh
   */
  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
 * Handles pagination change for My Course data.
 *
 * @author Canh
 * @param value - The new page number to fetch.
 */
  const handleChangePagination = (value: number) => {
    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate
    getDataMyCourse({ page: value, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }

  /**
 * Handles pagination change for completed My Course data.
 *
 * @author Canh
 * @param value - The new page number to fetch.
 */
  const handleChangePaginationDone = (value: number) => {
    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate
    getDataMyCourseDone({ page: value, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }

  /**
 * Handles pagination change for active My Course data.
 *
 * @author Canh
 * @param value - The new page number to fetch.
 */
  const handleChangePaginationActive = (value: number) => {
    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate
    getDataMyCourseActive({ page: value, search, startDate: utcStartDate, endDate: utcEndDate, category: categorySearch === 'all' ? undefined : categorySearch })
  }
  const categoryNames = dataCategory?.map((item: { name: any }) => item.name) ?? []

  /**
   * Handles changes to the start date using DatePicker.
   *
   * @author Canh
   * @param {Date | null} date - The selected date from DatePicker.
   * @returns {void}
   */
  const handleStartDatePickerChange = (date: Date | null) => {
    setStartDate(date)
  }

  /**
   * Handles changes to the end date using DatePicker.
   *
   * @author Canh
   * @param {Date | null} date - The selected date from DatePicker.
   * @returns {void}
   */
  const handleEndDatePickerChange = (date: Date | null) => {
    setEndDate(date)
  }

  return (
    <div className='w-full mx-auto'>
      <div className='flex justify-between items-center border-y-2'>
        <div className='flex items-center w-full'>
          <form className="flex flex-col sm:flex-row justify-between items-center rounded-lg w-full space-x-0 sm:space-x-2 py-2 sm:py-0" onSubmit={handleSearch}>
            <div className='flex flex-col sm:flex-row items-center sm:space-x-0 px-2 space-x-0 w-full sm:w-5/12 md:w-1/2'>
              <div className='flex sm:w-1/2 w-full space-x-2 items-center'>
                <div className='font-bold items-center bg-gray-200 rounded-md h-11 sm:w-2/5 w-1/5'>
                  <div className='p-2 flex justify-center items-center space-x-3 w-full'>
                    <FilterListIcon className='text-black' />
                    <div className='font-bold items-center hidden sm:hidden lg:flex text-black'>{t('homepage.filter_label')}</div>
                  </div>
                </div>
                <select
                  className="h-10 p-2 text-gray-800 w-4/5 sm:w-3/5 outline-none cursor-pointer rounded-md border"
                  value={categorySearch}
                  onChange={handleCategoryChange}
                >
                  <option value="all">{t('homepage.all_courses')}</option>
                  {categoryNames.map((name: string, index: number) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex my-4 w-full sm:w-1/2 items-center justify-center sm:space-x-0 space-x-4">
                <div className='font-bold md:hidden flex w-1/5 justify-end'>
                  <div className='sm:hidden flex'>Search</div>
                </div>
                <div className='w-4/5 flex border border-gray-300 rounded-md'>
                  <div className="p-2 bg-white border-r">
                    <SearchIcon className="text-black" />
                  </div>
                  <input
                    className="py-2 px-4 outline-none w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('homepage.findByCourseName') ?? 'Defaultplaceholder'}
                  />
                </div>
              </div>
            </div>
          <div className='flex flex-col sm:flex-row items-center justify-between space-x-0 sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-7/12 md:w-1/2 px-2'>
              {/* Start Date */}
              <div className='flex items-center w-full sm:w-2/5 xl:w-1/3'>
                <div className='font-bold whitespace-nowrap mr-2 sm:mr-3 w-auto hidden lg:flex'>
                  {t('homepage.from_label')}
                </div>
                <div className="relative flex-grow">
                  <DatePicker
                    key={`start-${i18n.language}`}
                    selected={startDate}
                    onChange={handleStartDatePickerChange}
                    dateFormat={dateFormat}
                    locale={locale}
                    placeholderText={t('picker.placeholder_public_date_text') ?? ''}
                    className='w-full text-gray-700 border rounded-md py-2 pl-2 pr-10 bg-white'
                    wrapperClassName="w-full"
                  >
                    <div className="flex justify-between w-full px-3 py-2 border-t">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          handleStartDatePickerChange(null)
                        }}
                      >
                        {t('picker.clear')}
                      </button>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          handleStartDatePickerChange(today)
                        }}
                      >
                        {t('picker.today')}
                      </button>
                    </div>
                  </DatePicker>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarMonthIcon className="text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className='flex items-center w-full sm:w-2/5 xl:w-1/3'>
                <div className='font-bold whitespace-nowrap mr-2 sm:mr-3 w-auto hidden lg:flex'>
                  {t('homepage.to_label')}
                </div>
                <div className="relative flex-grow">
                  <DatePicker
                    key={`end-${i18n.language}`}
                    selected={endDate}
                    onChange={handleEndDatePickerChange}
                    dateFormat={dateFormat}
                    locale={locale}
                    placeholderText={t('picker.placeholder_public_date_text') ?? ''}
                    className='w-full text-gray-700 border rounded-md py-2 pl-2 pr-10 bg-white'
                    wrapperClassName="w-full"
                  >
                    <div className="flex justify-between w-full px-3 py-2 border-t">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          handleEndDatePickerChange(null)
                        }}
                      >
                        {t('picker.clear')}
                      </button>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          handleEndDatePickerChange(today)
                        }}
                      >
                        {t('picker.today')}
                      </button>
                    </div>
                  </DatePicker>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarMonthIcon className="text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>
                  <div className='flex items-center sm:w-auto'>
                    <button
                      type='submit'
                      className={`bg-custom-button-control hover:bg-custom-button-control-hover rounded-md font-bold px-7 sm:px-4 py-2 m-2 transition duration-200 ${theme === 'dark' ? 'text-black' : 'text-white'}`}
                      onClick={handleSearch}
                    >
                      {t('homepage.find')}
                    </button>
                  </div>
                </div>
          </form>
        </div>
      </div>
      <div className='font-semibold text-2xl mt-8 ml-10'>{t('mycourse.myCourse')}</div>
      <div className='w-full flex items-center justify-center mt-8'>
        {isLoading
          ? <div className="flex justify-center items-center w-full h-140 mt-20">
            <PacmanLoader
              className='flex justify-center items-center w-full mt-20'
              color='#5EEAD4'
              cssOverride={{
                display: 'block',
                margin: '0 auto',
                borderColor: 'blue'
              }}
              loading
              margin={10}
              speedMultiplier={3}
              size={40}
            /></div>
          : <div className='w-11/12'>
            <Tabs selectedIndex={currentTab} onSelect={(index) => setCurrentTab(index)}>
              <TabList className="flex flex-col sm:flex-row flex-wrap lg:w-3/5 md:w-4/5 sm:w-4/5 w-full mt-5 gap-2">
                <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg truncate overflow-hidden max-w-full"
                  selectedClassName={`text-custom-tab underline text-lg ${theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark'}`}
                >
                  {t('mycourse.enrolledCourses')} ({(dataState?.totalRecords ?? 0).toString().padStart(2, '0')})
                </Tab>
                <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg truncate overflow-hidden max-w-full"
                  selectedClassName={`text-custom-tab underline text-lg ${theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark'}`}
                >
                  {t('mycourse.activeCourses')} ({(dataStateActive?.totalRecords ?? 0).toString().padStart(2, '0')})
                </Tab>
                <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg truncate overflow-hidden max-w-full"
                  selectedClassName={`text-custom-tab underline text-lg ${theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark'}`}
                >
                  {t('mycourse.completedCourses')} ({(dataStateDone?.totalRecords ?? 0).toString().padStart(2, '0')})
                </Tab>
              </TabList>
              {/* <div className='inline-flex space-x-2 mt-4'>
                <div
                  className={`rounded-md cursor-pointer transition-colors duration-500 p-1 ${isGridView
                    ? (theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark')
                    : ''
                    }`}
                >
                  <GridViewOutlinedIcon
                    fontSize='large'
                    onClick={() => setIsGridView(true)}
                    className={isGridView ? 'text-custom-tab' : ''}
                  />
                </div>
                <div
                  className={`rounded-lg cursor-pointer transition-colors duration-500 p-1 ${!isGridView
                    ? (theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark')
                    : ''
                    }`}
                >
                  <FormatListBulletedOutlinedIcon
                    fontSize='large'
                    onClick={() => setIsGridView(false)}
                    className={!isGridView ? 'text-custom-tab' : ''}
                  />
                </div>
              </div> */}
              <TabPanel className={`flex flex-col justify-between ${isGridView ? '' : 'w-4/5'}`}>
                <div className={isGridView ? 'grid grid-cols-12 gap-6 mt-4' : 'flex flex-col mt-4'}>
                  {dataState?.data?.length
                    ? (
                        dataState?.data.map?.((item, index) => (
                        <MyCourseCard
                          name={item.name}
                          description={item.description}
                          key={index}
                          summary={item.summary}
                          durationInMinute={item.durationInMinute}
                          id={item.courseId}
                          startDate={new Date(item.startDate)}
                          endDate={new Date(item.endDate)}
                          status={item.status ? 'true' : 'false'}
                          progressPercentage={item.progressPercentage ? item.progressPercentage : 0}
                          price={item.price}
                          assignedBy={item.assignedBy}
                          creatorAVT={item.creatorAVT}
                          locationPath={item.locationPath}
                          category={item.categoryCourseName}
                          lessonCount={item.lessonCount}
                          doneCount={item.doneCount}
                          lastUpdate={item.lastUpdate}
                          progress={item.progress}
                          theme={theme}
                        />
                        ))
                      )
                    : (
                      <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('mycourse.haventLearnYet')}</div>
                      )}
                  {(page === totalPage || dataState?.totalRecords === 0) && (
                    <div className='h-[477px] group mt-4 col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 border-4 border-dashed border-gray-200 hover:border-teal-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors duration-700' onClick={(e: React.MouseEvent<HTMLDivElement>) => navigate('/')}>
                      <div className='w-12 h-12 bg-gray-500 group-hover:bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold duration-700'>
                        +
                      </div>
                      <button className='mt-6 px-6 py-2 border-2 border-teal-500 rounded-full text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-700'>
                        {t('mycourse.addCourse')}
                      </button>
                    </div>
                  )}
                </div>
                <div className='flex justify-center mt-4'>
                  <CustomPagination
                    count={totalPage}
                    page={page}
                    onChange={(_, page) => handleChangePagination(page)}
                    boundaryCount={1}
                    siblingCount={0}
                  />
                </div>
              </TabPanel>
              <TabPanel className="flex flex-col justify-between">
                <div className='grid grid-cols-12 gap-6 mt-4'>
                  {dataStateActive?.data?.length
                    ? (
                        dataStateActive?.data?.map?.((item, index) => (
                        <MyCourseCard
                          name={item.name}
                          description={item.description}
                          key={index}
                          summary={item.summary}
                          durationInMinute={item.durationInMinute}
                          id={item.courseId}
                          startDate={new Date(item.startDate)}
                          endDate={new Date(item.endDate)}
                          status={item.status ? 'true' : 'false'}
                          progressPercentage={item.progressPercentage ? item.progressPercentage : 0}
                          price={item.price}
                          assignedBy={item.assignedBy}
                          creatorAVT={item.creatorAVT}
                          locationPath={item.locationPath}
                          category={item.categoryCourseName}
                          lessonCount={item.lessonCount}
                          doneCount={item.doneCount}
                          lastUpdate={item.lastUpdate}
                          progress={item.progress}
                        />
                        ))
                      )
                    : (
                      <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('mycourse.haventLearnYet')}</div>
                      )}
                  {(pageActive === totalPageActive || dataStateActive?.totalRecords === 0) && (

                    <div className='h-[477px] group mt-4 col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 border-4 border-dashed border-gray-200 hover:border-teal-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors duration-700' onClick={(e: React.MouseEvent<HTMLDivElement>) => navigate('/')}>
                      <div className='w-12 h-12 bg-gray-500 group-hover:bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold duration-700'>
                        +
                      </div>
                      <button className='mt-6 px-6 py-2 border-2 border-teal-500 rounded-full text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-700'>
                        {t('mycourse.addCourse')}
                      </button>
                    </div>
                  )}

                </div>

                <div className='flex justify-center mt-4'>
                  <CustomPagination
                    count={totalPageActive}
                    page={pageActive}
                    onChange={(_, page) => handleChangePaginationActive(page)}
                    boundaryCount={1}
                    siblingCount={0}
                  />
                </div>
              </TabPanel>
              <TabPanel className="flex flex-col justify-between">
                <div className='grid grid-cols-12 gap-6 mt-4'>
                  {dataStateDone?.data?.length
                    ? (
                        dataStateDone?.data?.map?.((item, index) => (
                        <MyCourseCard
                          name={item.name}
                          description={item.description}
                          key={index}
                          summary={item.summary}
                          durationInMinute={item.durationInMinute}
                          id={item.courseId}
                          startDate={new Date(item.startDate)}
                          endDate={new Date(item.endDate)}
                          status={item.status ? 'true' : 'false'}
                          progressPercentage={item.progressPercentage ? item.progressPercentage : 0}
                          price={item.price}
                          assignedBy={item.assignedBy}
                          locationPath={item.locationPath}
                          creatorAVT={item.creatorAVT}
                          category={item.categoryCourseName}
                          lessonCount={item.lessonCount}
                          doneCount={item.doneCount}
                          lastUpdate={item.lastUpdate}
                          progress={item.progress}
                        />
                        ))
                      )
                    : (
                      <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('mycourse.haventLearnYet')}</div>
                      )}
                  {(pageDone === totalPageDone || dataStateDone?.totalRecords === 0) && (
                    <div className='h-[477px] group mt-4 col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3 border-4 border-dashed border-gray-200 hover:border-teal-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors duration-700' onClick={(e: React.MouseEvent<HTMLDivElement>) => navigate('/')}>
                      <div className='w-12 h-12 bg-gray-500 group-hover:bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold duration-700'>
                        +
                      </div>
                      <button className='mt-6 px-6 py-2 border-2 border-teal-500 rounded-full text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-700'>
                        {t('mycourse.addCourse')}
                      </button>
                    </div>
                  )}

                </div>

                <div className='flex justify-center mt-4'>
                  <CustomPagination
                    count={totalPageDone}
                    page={pageDone}
                    onChange={(_, page) => handleChangePaginationDone(page)}
                    boundaryCount={1}
                    siblingCount={0}
                  />
                </div>
              </TabPanel>

            </Tabs>

          </div>
        }
      </div>
    </div>
  )
}

export default MyCourse
