/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: HOMEPAGE
   ========================================================================== */

// TODO: remove later
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useDatePickerLocale } from '../../hooks/useDatePickerLocale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { Pagination } from '@mui/material'
import { styled } from '@mui/system'
import { DataListCourse, ListCourseParams } from 'api/post/post.interface'
import { getListProCourses, getListFreeCourses, getListCourses, getCategoryCourseData, getListNewCourses } from 'api/post/post.api'
import { getFromLocalStorage, removeAllLocalStorage, removeLocalStorage, setToLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import FilterListIcon from '@mui/icons-material/FilterList'
import HomeCourseCard from 'components/HomeCourseCard'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import SlideBar from 'components/Slide'
import TopCategoryGrid from 'components/TopCategoryGrid'
import { PacmanLoader } from 'react-spinners'
import PopularCard from 'components/PopularCard'
import TrendingCard from 'components/TrendingCard'
import ROUTES from 'routes/constant'
import { ShowButtonTopContext, DivRefContext } from '../../containers/layouts/default'
import { useMediaQuery } from 'react-responsive'
import { useTheme } from 'services/styled-themes'
interface ParamsList extends ListCourseParams {
}
/**
 * HomePage component displays the homepage with various sections including featured learning categories,
 * popular categories, trending courses, and new courses. It supports filtering, pagination, and searching
 * for courses. The component also listens for language changes and updates the content accordingly.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered HomePage component.
 *
 * @property {boolean} isSmallScreen - Indicates if the screen width is less than 767 pixels.
 * @property {object} theme - The current theme of the application.
 * @property {object} divRef - The reference to the div element for scrolling.
 * @property {object} targetDivRef - The reference to the target div element for scrolling.
 * @property {boolean} showButtonTop - Indicates if the "scroll to top" button should be shown.
 * @property {Function} setShowButtonTop - Function to set the state of showButtonTop.
 * @property {boolean} isLoading - Indicates if the component is in a loading state.
 * @property {number} currentTab - The current tab index.
 * @property {Date | null} startDate - The start date for filtering courses.
 * @property {Date | null} endDate - The end date for filtering courses.
 * @property {any} dataCategory - The data for course categories.
 * @property {string} categorySearch - The selected category ID for filtering.
 * @property {string} search - The search term for filtering courses.
 * @property {number} pagePaid - The current page number for paid courses.
 * @property {number} pageFree - The current page number for free courses.
 * @property {number} page - The current page number for all courses.
 * @property {boolean} isPressed - Indicates if the search button is pressed.
 * @property {DataListCourse | undefined} dataStatePaid - The data for paid courses.
 * @property {DataListCourse | undefined} dataStateFree - The data for free courses.
 * @property {DataListCourse | undefined} dataStateNew - The data for new courses.
 * @property {number} newCurrentPage - The current page number for new courses.
 * @property {boolean} isNewLoading - Indicates if the component is loading new courses.
 * @property {boolean} isNewAllLoading - Indicates if the component is loading all new courses.
 * @property {number} pageNew - The current page number for new courses.
 * @property {boolean} isNewViewAll - Indicates if all new courses should be viewed.
 * @property {number} pageMoreNew - The current page number for more new courses.
 * @property {DataListCourse | undefined} dataState - The data for all courses.
 * @property {boolean} displayGrid - Indicates if the grid view should be displayed.
 * @property {Function} t - The translation function from react-i18next.
 * @property {Function} navigate - The navigation function from react-router-dom.
 */
const HomePage = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 })
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  const { locale, dateFormat, formatDateForAPI } = useDatePickerLocale()
  const CustomPagination = styled(Pagination)({
    '.MuiPagination-ul': {
      display: 'inline-flex',
      fontSize: 'large',
      listStyle: 'none',
      margin: '10px',
      '@media (max-width: 600px)': {
        margin: '5px'
      }
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
      },
      '@media (max-width: 600px)': {
        margin: '0px'
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
      },
      '@media (max-width: 600px)': {
        fontSize: 'medium',
        margin: '0px'
      }
    },
    '.MuiPaginationItem-page.Mui-selected': {
      color: '#667eea',
      fontWeight: 'bold',
      border: '2px solid #667eea',
      backgroundColor: 'white',
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
  const divRef = useContext(DivRefContext)
  const targetDivRef = useRef<HTMLDivElement>(null)
  const searchDivRef = useRef<HTMLDivElement>(null)

  const { showButtonTop, setShowButtonTop } = useContext(ShowButtonTopContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState(0)
  const defaultStartDate = new Date('1970-01-01')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const defaultEndDate = undefined
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [dataCategory, setDataCategory] = useState<any>(null)
  const [categorySearch, setCategorySearch] = useState('all')
  const [search, setSearch] = useState<string>('')
  const [pagePaid, setPagePaid] = useState<number>(1)
  const [pageFree, setPageFree] = useState<number>(1)
  const [page, setPage] = useState<number>(1)
  const [isPressed, setIsPressed] = useState(false)

  const [dataStatePaid, setDataStatePaid] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateFree, setDataStateFree] = useState<DataListCourse | undefined>(
    undefined
  )
  const [dataStateNew, setDataStateNew] = useState<DataListCourse | undefined>(
    undefined
  )
  const [newCurrentPage, setNewCurrentPage] = useState(1)
  const [isNewLoading, setIsNewLoading] = useState<boolean>(false)
  const [isNewAllLoading, setIsNewAllLoading] = useState<boolean>(false)
  const [pageNew, setPageNew] = useState<number>(1)
  const [isNewViewAll, setIsNewViewAll] = useState<boolean>(false)
  const [pageMoreNew, setPageMoreNew] = useState<number>(1)

  const [dataState, setDataState] = useState<DataListCourse | undefined>(
    undefined
  )
  const [displayGrid, setDisplayGrid] = useState<boolean>(true)
  const navigate = useNavigate()
  const [bannerData, setBannerData] = useState<any>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('homepageBanner')
      if (saved) setBannerData(JSON.parse(saved))
    } catch (err) {
      console.warn('Cannot read homepageBanner from localStorage', err)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'homepageBanner') {
        try {
          setBannerData(e.newValue ? JSON.parse(e.newValue) : null)
        } catch (err) {
          console.warn(err)
        }
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /**
   * Handles the change event for the start date input.
   *
   * This function parses the input value as a date and updates the start date state.
   * If the input value is not a valid date, it sets the start date state to null.
   *
   * @author Canh
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the start date input.
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
  * Handles the change event for the end date input.
 *
 * This function parses the input value as a date and updates the end date state.
 * If the input value is not a valid date, it sets the end date state to null.
 *
 * @author Canh
 * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the end date input.
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
 * Handle the search form submission.
 *
 * This function handles the form submission event for the search functionality. It prevents the default form submission behavior,
 * sets the loading state, and triggers the appropriate data fetching function based on the current tab.
 * It also resets the display grid state and sets a timeout to stop the loading state after 1.5 seconds.
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

    if (currentTab === 0) {
      getDataCourse({
        page: 1,
        search,
        startDate: utcStartDate,
        endDate: utcEndDate,
        category: categorySearch
      })
    } else if (currentTab === 1) {
      getDataFreeCourse({
        page: 1,
        search,
        startDate: utcStartDate,
        endDate: utcEndDate,
        category: categorySearch
      })
    } else {
      getDataProCourse({
        page: 1,
        search,
        startDate: utcStartDate,
        endDate: utcEndDate,
        category: categorySearch
      })
    }

    setDisplayGrid(false)

    setTimeout(() => {
      setIsLoading(false)
      if (searchDivRef.current) {
        searchDivRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 1500)
  }

  /**
 * Fetch data for courses, free courses, and pro courses when the component mounts or the current tab changes.
 *
 * This useEffect hook triggers data fetching functions for courses, free courses, and pro courses whenever the component mounts
 * or the currentTab state changes. It uses the current search term, start date, end date, and category search criteria to fetch the data.
 *
 * @author Canh
 * @param {Function} getDataCourse - Function to fetch data for courses.
 * @param {Function} getDataFreeCourse - Function to fetch data for free courses.
 * @param {Function} getDataProCourse - Function to fetch data for pro courses.
 * @param {number} currentTab - The current tab index.
 * @param {string} search - The search term.
 * @param {Date|null} startDate - The start date for filtering courses.
 * @param {Date|null} endDate - The end date for filtering courses.
 * @param {string} categorySearch - The category search criteria.
 */
  useEffect(() => {
    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate

    getDataCourse({
      page: 1,
      search,
      startDate: utcStartDate,
      endDate: utcEndDate,
      category: categorySearch
    })
    getDataFreeCourse({
      page: 1,
      search,
      startDate: utcStartDate,
      endDate: utcEndDate,
      category: categorySearch
    })
    getDataProCourse({
      page: 1,
      search,
      startDate: utcStartDate,
      endDate: utcEndDate,
      category: categorySearch
    })
  }, [currentTab])
  /**
   * Fetch data for pro courses with optional parameters.
   *
   * This function fetches data for pro courses, optionally using provided parameters. It first attempts to retrieve the data from local storage.
   * If the data is not found in local storage, it makes an API call to fetch the data. The fetched data is then stored in local storage and
   * the state is updated accordingly.
   *
   * @author Canh
   * @param {ParamsList} [params] - Optional parameters for fetching pro courses.
   * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
   */
  const getDataProCourse = async (params?: ParamsList) => {
    try {
      const page = params?.page ?? 1
      let data = getFromLocalStorage<any>(`paidCourse-page-${page}`)
      if (data) {
        setDataStatePaid(data)
        setPagePaid(page)
        return
      } else {
        const listCourseResponse = await getListProCourses({ params })
        if (!listCourseResponse.data) {
          setDataStatePaid(undefined)
        } else {
          data = listCourseResponse?.data
          setToLocalStorage(`paidCourse-page-${page}`, JSON.stringify(data))
        }
      }
      setDataStatePaid(data)
      setPagePaid(page)
    } catch (e) {
    }
  }
  /**
 * Fetch data for pro courses when the component mounts.
 *
 * This useEffect hook triggers the getDataProCourse function to fetch data for pro courses when the component mounts.
 * It fetches the data for the first page of pro courses.
 *
 * @author Canh
 * @param {Function} getDataProCourse - Function to fetch data for pro courses.
 */
  useEffect(() => {
    getDataProCourse({ page: 1 })
  }, [])
  /**
   * Fetch data for free courses with optional parameters.
   *
   * This function fetches data for free courses, optionally using provided parameters. It first attempts to retrieve the data from local storage.
   * If the data is not found in local storage, it makes an API call to fetch the data. The fetched data is then stored in local storage and
   * the state is updated accordingly. If an error occurs during the fetch, it handles the error appropriately.
   *
   * @author Canh
   * @param {ParamsList} [params] - Optional parameters for fetching free courses.
   * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
   */
  const getDataFreeCourse = async (params?: ParamsList) => {
    try {
      const page = params?.page ?? 1
      let data = getFromLocalStorage<any>(`freeCourse-page-${page}`)
      if (data) {
        setDataStateFree(data)
        setPageFree(page)
        return
      } else {
        const listCourseResponse = await getListFreeCourses({ params })
        if (!listCourseResponse.data) {
          setDataStateFree(undefined)
        } else {
          data = listCourseResponse?.data
          setToLocalStorage(`freeCourse-page-${page}`, JSON.stringify(data))
        }
      }
      setDataStateFree(data)
      setPageFree(page)
    } catch (e) {
    }
  }
  /**
 * Fetch data for free courses when the component mounts.
 *
 * This useEffect hook triggers the getDataFreeCourse function to fetch data for free courses when the component mounts.
 * It fetches the data for the first page of free courses.
 *
 * @author Canh
 * @param {Function} getDataFreeCourse - Function to fetch data for free courses.
 */
  useEffect(() => {
    getDataFreeCourse({ page: 1 })
  }, [])
  /**
   * Fetch more new courses and update the state.
   *
   * This function fetches additional new courses data for the next page and updates the state accordingly.
   * It handles loading state, pagination, and appending new data to the existing state.
   * If an error occurs during the fetch, it logs the error to the console.
   *
   * @author Canh
   * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
   */
  const fetchMoreNewCourses = async () => {
    try {
      setIsNewLoading(true)
      const nextPage = newCurrentPage + 1
      console.log('trang dang tim:', nextPage)
      const newData = await getListNewCourses({ params: { page: nextPage } })
      console.log(newCurrentPage, 'hein tai')
      console.log('newData:', newData)
      setTimeout(() => {
        if (!isNewViewAll) {
          setIsNewViewAll(false)
          setDataStateNew({
            ...newData.data,
            data: [...(dataStateNew?.data ?? []), ...newData.data.data]
          })

          setNewCurrentPage(nextPage)
          console.log('set lai trang:', newCurrentPage)
          setIsNewLoading(false)
        } else {
          setIsNewViewAll(false)
          setDataStateNew(newData.data)
          setNewCurrentPage(nextPage)
          console.log('set lai trang:', newCurrentPage)
          setIsNewLoading(false)
        }
      }, 500)
    } catch (error) {
      console.error('Error fetching more courses:', error)
    }
  }
  /**
 * Fetch all new courses and update the state.
 *
 * This function fetches all new courses and updates the state accordingly. It handles loading state,
 * resets the current page to 0, and sets a timeout to simulate a delay before fetching the data.
 * If an error occurs during the fetch, it logs the error to the console.
 *
 * @author Canh
 * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
 */
  const fetchAllNewCourse = async () => {
    try {
      setIsNewAllLoading(true)
      setNewCurrentPage(0)
      setTimeout(() => {
        setIsNewViewAll(true)
        getDataNewCourse()
        setIsNewAllLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching all new courses:', error)
    }
  }
  // KHONG DUNG LS
  /**
 * Fetch data for new courses with optional parameters.
 *
 * This function fetches data for new courses, optionally using provided parameters. It makes an API call to fetch the data.
 * If the data is not found, it sets the state to undefined. If the data is found, it updates the state and sets the current page.
 * If an error occurs during the fetch, it checks for tokens in local storage and navigates to the login page if tokens are not found.
 *
 * @author Canh
 * @param {ParamsList} [params] - Optional parameters for fetching new courses.
 * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
 */
  const getDataNewCourse = async (params?: ParamsList) => {
    try {
      const listCourseResponse = await getListNewCourses({ params })
      if (!listCourseResponse.data) {
        setDataStateNew(undefined)
      } else {
        setDataStateNew(listCourseResponse?.data)
        setPageNew(params?.page ?? 1)
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
 * Fetch data for new courses when the component mounts.
 *
 * This useEffect hook triggers the getDataNewCourse function to fetch data for free courses when the component mounts.
 * It fetches the data for the first page of new courses.
 *
 * @author Canh
 * @param {Function} getDataNewCourse - Function to fetch data for new courses.
 */
  useEffect(() => {
    getDataNewCourse({ page: 1 })
  }, [])
  // KHONG DUNG LOCAL STORAGE
  /**
 * Fetches and updates the list of courses based on the provided parameters.
 *
 * If the API response contains data, it updates the state with the fetched data.
 * If no data is returned, it clears the current state.
 * Handles errors, specifically checking for the absence of authentication tokens
 * and redirecting the user to the login page if necessary.
 *
 * @author Canh
 * @param {ParamsList} [params] - Optional parameters for fetching the list of courses, such as pagination details.
 * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
 */
  const getDataCourse = async (params?: ParamsList) => {
    try {
      const listCourseResponse = await getListCourses({ params })
      if (!listCourseResponse.data) {
        setDataState(undefined)
      } else {
        setDataState(listCourseResponse?.data)
        setPage(params?.page ?? 1)
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
   * Fetch data for courses when the component mounts.
   *
   * This useEffect hook triggers the getDataCourse function to fetch data for courses when the component mounts.
   * It fetches the data for the first page of courses.
   *
   * @author Canh
   * @param {Function} getDataCourse - Function to fetch data for courses.
   */
  useEffect(() => {
    getDataCourse()
  }, [])

  // const getDataCourse = async (params?: ParamsList) => {
  //   try {
  //     let total = 0
  //     for (const x in localStorage) {
  //       const amount = (localStorage[x].length * 2) / 1024 / 1024
  //       if (!isNaN(amount) && localStorage.hasOwnProperty(x)) {
  //         total += amount
  //       }
  //     }
  //     console.log(`Total localStorage size in MB: ${total.toFixed(2)}`)
  //     const page = params?.page ?? 1
  //     let data = getFromLocalStorage<any>(`allCourse-page-${page}`)
  //     // Check if search, startDate, endDate, or category is not empty
  //     if ((params?.search || (params?.startDate?.toISOString() !== defaultStartDate.toISOString()) || (params?.endDate?.toISOString() !== defaultEndDate.toISOString()) || params?.category !== 'all')) {
  //       data = null
  //     }

  //     if (data) {
  //       setDataState(data)
  //       setPage(page)
  //       return
  //     } else {
  //       const listCourseResponse = await getListCourses({ params })
  //       if (!listCourseResponse.data) {
  //         setDataState(undefined)
  //       } else {
  //         const fullData: DataListCourse = listCourseResponse?.data
  //         // Use map on fullData.data, not on fullData
  //         data = {
  //           data: fullData.data.map(course => ({
  //             id: course.id,
  //             name: course.name,
  //             locationPath: course.locationPath,
  //             categoryCourseName: course.categoryCourseName,
  //             durationInMinute: course.durationInMinute,
  //             enrollmentCount: course.enrollmentCount
  //           })),
  //           page: fullData.page,
  //           size: fullData.size,
  //           totalRecords: fullData.totalRecords
  //         }
  //         // Only save to LS if search, startDate, endDate, and category are all empty
  //         // console.log('params:', params)
  //         if (!params?.search && (params?.startDate?.toISOString() === defaultStartDate.toISOString()) && (params?.endDate?.toISOString() === defaultEndDate.toISOString()) && params?.category === 'all') {
  //           setToLocalStorage(`allCourse-page-${page}`, JSON.stringify(data))
  //         }
  //       }
  //     }
  //     setDataState(data)
  //     setPage(page)
  //   } catch (e) {
  //     // const tokens = getFromLocalStorage<any>('tokens')
  //     // if (tokens === null) {
  //     //   navigate('/login', {
  //     //     replace: true
  //     //   })
  //     // }
  //   }
  // }

  // const handleChangePaginationPaid = (value: number) => {
  //   getDataProCourse({ page: value, search })
  // }

  // const totalPagePaid = useMemo(() => {
  //   const size = (dataStatePaid != null) ? dataStatePaid.size : 5
  //   const totalRecord = (dataStatePaid != null) ? dataStatePaid.totalRecords : 5
  //   return Math.ceil(totalRecord / size)
  // }, [dataStatePaid])

  // const handleChangePaginationFree = (value: number) => {
  //   getDataFreeCourse({ page: value, search })
  // }

  // const totalPageFree = useMemo(() => {
  //   const size = (dataStateFree != null) ? dataStateFree.size : 5
  //   const totalRecord = (dataStateFree != null) ? dataStateFree.totalRecords : 5
  //   return Math.ceil(totalRecord / size)
  // }, [dataStateFree])

  /**
 * Handles pagination changes for new courses.
 *
 * This function is triggered when the page number changes. It calls the getDataNewCourse
 * function with the updated page number to fetch the corresponding data for new courses.
 *
 * @author Canh
 * @param {number} value - The new page number to fetch data for.
 */
  const handleChangePaginationNew = (value: number) => {
    getDataNewCourse({ page: value })
  }
  /**
   * Calculates the total number of pages for new courses.
   *
   * Uses `size` and `totalRecords` from `dataStateNew`, defaults to 5 if not available.
   * Recalculates when `dataStateNew` changes.
   *
   * @author Canh
   * @returns {number} Total number of pages.
   */
  const totalPageNew = useMemo(() => {
    const size = (dataStateNew != null) ? dataStateNew.size : 5
    const totalRecord = (dataStateNew != null) ? dataStateNew.totalRecords : 5
    return Math.ceil(totalRecord / size)
  }, [dataStateNew])
  /**
   * Handles pagination changes for the course list.
   *
   * Calls `getDataCourse` with the updated page number, along with current search, date range,
   * and category filters.
   *
   * @author Canh
   * @param {number} value - The new page number to fetch data for.
   */
  const handleChangePagination = (value: number) => {
    const utcStartDate = formatDateForAPI(startDate) ?? defaultStartDate
    const utcEndDate = formatDateForAPI(endDate) ?? defaultEndDate

    getDataCourse({
      page: value,
      search,
      startDate: utcStartDate,
      endDate: utcEndDate,
      category: categorySearch
    })
  }
  /**
   * Calculates the total number of pages for the course list.
   *
   * Determines total pages based on `size` and `totalRecords` from `dataState`,
   * defaulting to 5 if not available. Recalculates when `dataState` changes.
   *
   * @author Canh
   * @returns {number} Total number of pages.
   */
  const totalPage = useMemo(() => {
    const size = (dataState != null) ? dataState.size : 5
    const totalRecord = (dataState != null) ? dataState.totalRecords : 5
    return Math.ceil(totalRecord / size)
  }, [dataState])
  /**
   * Handles changes to the category selection.
   *
   * Updates the `categorySearch` state with the selected value from the dropdown.
   *
   * @author Canh
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event from the select element.
   */
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategorySearch(event.target.value)
  }
  // const fetchData = useCallback(async () => {
  //   try {
  //     const response = await getCategoryCourseData()
  //     setDataCategory(response.data)
  //   } catch (error) {
  //     setDataCategory(null)
  //   }
  // }, [])
  // useEffect(() => {
  //   fetchData()
  // }, [fetchData])

  /**
   * Fetches category course data from local storage or API.
   *
   * Checks local storage for cached data. If found, updates the state.
   * If not, fetches data from the API and updates both the state and local storage.
   * Handles errors by setting state to null.
   *
   * @author Canh
   * @returns {Promise<void>} Resolves when data fetching is complete.
   */
  const fetchData = async () => {
    try {
      const data = getFromLocalStorage<any>('categoryCourse')
      if (data) {
        setDataCategory(data)
      } else {
        const response = await getCategoryCourseData()
        if (response.data) {
          setDataCategory(response.data)
          setToLocalStorage('categoryCourse', JSON.stringify(response.data))
        } else {
          setDataCategory(null)
        }
      }
    } catch (error) {
      setDataCategory(null)
    }
  }

  /**
   * Fetches category course data when the component mounts.
   *
   * This useEffect hook calls the fetchData function to retrieve the category course data
   * when the component is first rendered. The empty dependency array ensures it only runs once.
   *
   * @author Canh
   */
  useEffect(() => {
    fetchData()
  }, [])

  /**
   * Scrolls the referenced div to the top smoothly.
   *
   * This function checks if the div reference is valid and then uses the scrollTo method
   * to scroll to the top of the div with a smooth behavior.
   *
   * @author Canh
   */
  const moveToTop = () => {
    if (divRef && divRef.current) {
      divRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const scrollToTargetDiv = () => {
    if (targetDivRef && targetDivRef.current) {
      targetDivRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }
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
    <div>
      <div>
        {bannerData && (
          <div className="w-full mb-4">
            <div className="max-w-9xl mx-auto rounded-lg overflow-hidden bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">{bannerData.type === 'course' ? 'Khóa học' : 'Nhóm'}</div>
                  <div className="text-lg font-bold">{bannerData.examName || bannerData.examId}</div>
                  <div className="text-sm">Top {bannerData.topCount} người điểm cao nhất</div>
                </div>
                <div className="text-xs opacity-80">Cập nhật: {new Date(bannerData.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
        {/* {isPressed && <div className="fixed inset-0 bg-black opacity-50" onClick={handlePress}></div>} */}
        <div className='w-full mx-auto pb-12'>
          <div className={`flex justify-between items-center ${theme === 'light' ? 'border-gray-200' : 'border-line-dark'} border-y-2`}>
            <div className='flex items-center w-full'>
              <form className="flex flex-col sm:flex-row justify-between items-center rounded-lg w-full space-x-0 sm:space-x-2 py-2 sm:py-0" onSubmit={handleSearch}>
                <div className='flex flex-col sm:flex-row items-center sm:space-x-0 px-2 space-x-0 w-full sm:w-5/12 md:w-1/2'>
                  <div className='flex sm:w-1/2 w-full space-x-2 items-center'>
                    <div className='font-bold items-center bg-gray-200 text-black rounded-md h-11 sm:w-2/5 w-1/5'>
                      <div className='p-2 flex justify-center items-center space-x-3 w-full'>
                        <FilterListIcon />
                        <div className='font-bold items-center hidden sm:hidden lg:flex'>{t('homepage.filter_label')}</div>
                      </div>
                    </div>
                    <select
                      className="h-10 p-2 text-gray-800 w-4/5 sm:w-3/5 outline-none cursor-pointer rounded-md border"
                      value={categorySearch}
                      onChange={handleCategoryChange}
                    >
                      <option value="all">{t('homepage.all_courses')}</option>
                      {dataCategory?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex my-4 w-full sm:w-1/2 items-center justify-center sm:space-x-0 space-x-4">
                    <div className='font-bold md:hidden flex w-1/5 justify-end'>
                      <div className='sm:hidden flex'>{t('homepage.search_label')}</div>
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
          {/* <div className=''>
            <img src='/assets/images/homePage/bgHead.png' className='w-full h-160'></img>
          </div>
          <div className='mt-20 flex flex-col justify-center items-center space-y-3'>
            <div className='text-3xl font-bold'>GIỚI THIỆU CHUNG</div>
            <img src='/assets/images/homePage/lineGreen.png' className=''></img>
          </div> */}
          {/* <div className='px-4 sm:px-5 mt-10'>
            <div className='flex flex-col lg:flex-row w-full gap-6'>
              <div className='flex-1 flex flex-col justify-center order-2 lg:order-1'>
                <h2 className='text-2xl md:text-2xl lg:text-3xl font-bold mb-4 text-center lg:text-left'>Giới thiệu chung</h2>

                <div className='flex items-start mb-4'>
                  <span className='mr-2 text-lg sm:text-xl lg:text-2xl mt-1 flex-shrink-0'>🔹</span>
                  <span className='text-base sm:text-lg md:text-xl lg:text-2xl'>Hơn 5,000 Khóa Học và Chứng Chỉ Chuyên Nghiệp từ Các Đại Học và Chuyên Gia Hàng Đầu.</span>
                </div>

                <div className='flex items-start mb-4'>
                  <span className='mr-2 text-lg sm:text-xl lg:text-2xl mt-1 flex-shrink-0'>🔹</span>
                  <span className='text-base sm:text-lg md:text-xl lg:text-2xl'>Tăng Cường Kỹ Năng và Cải Thiện Hiệu Suất trong Ngành Nông Nghiệp.</span>
                </div>

                <div className='flex items-start mb-4'>
                  <span className='mr-2 text-lg sm:text-xl lg:text-2xl mt-1 flex-shrink-0'>🔹</span>
                  <span className='text-base sm:text-lg md:text-xl lg:text-2xl'>Học Linh Hoạt và Tiện Lợi: Tiếp cận tài liệu học tập từ bất kỳ đâu, bất kỳ khi nào.</span>
                </div>

                <div className='flex items-start mb-2'>
                  <span className='mr-2 text-lg sm:text-xl lg:text-2xl mt-1 flex-shrink-0'>🌱</span>
                  <span className='text-base sm:text-lg md:text-xl lg:text-2xl'>Bắt Đầu Ngay để Khám Phá Cơ Hội và Xây Dựng Tương Lai Bền Vững trong Nông Nghiệp!</span>
                </div>
              </div>

              <div className='flex-1 flex justify-center items-center order-1 lg:order-2 mb-8 lg:mb-0'>
                <img
                  src='/assets/images/homePage/homeLeft.png'
                  className='w-full max-w-md lg:max-w-none'
                  alt="Giới thiệu MElearning"
                />
              </div>
            </div>
          </div> */}
          {displayGrid && (
            // <div className='w-full h-full flex flex-col sm:flex-row justify-center relative'>
            //   <img className='hidden xl:block absolute top-16 w-1/3' src={lineTop}></img>
            //   <img className='hidden xl:block absolute bottom-0' src={lineBottom}></img>
            //   <img className='hidden xl:block absolute left-14 top-1/3' src={lineLeft}></img>
            //   <img className='hidden 2xl:block absolute right-28 top-1/4' src={lineRight}></img>
            //   <div className='w-full mt-10 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row'>
            //     <div className='flex-1 mt-20'>
            //       <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold flex justify-center'>
            //         <div className='w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5 text-center'>
            //           {t('homepage.welcome')}
            //         </div>
            //       </div>
            //       <div className='flex justify-center'>
            //         <div className='flex mt-5 justify-center w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5'>
            //           <button
            //             className={`bg-custom-button-control hover:bg-custom-button-control-hover font-bold ${theme === 'dark' ? 'text-black' : 'text-white'} shadow-xl rounded-3xl py-1 px-3 m-2 transition duration-200`}
            //             onClick={scrollToTargetDiv}
            //           >
            //             {t('homepage.getStarted')}
            //           </button>
            //           <button
            //             className={`bg-gray-300 hover:bg-gray-400 shadow-xl rounded-3xl py-1 px-3 m-2 transition duration-200 ${theme === 'dark' ? 'text-black' : 'text-white'}`}
            //           >
            //             {t('homepage.learnMore')}
            //           </button>
            //         </div>
            //       </div>
            //       <div className='flex justify-center mt-5 h-2/5'>
            //         <div className='w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-3/5 text-center font-sans text-xl'>
            //           &quot;{t('homepage.description')}&quot;
            //         </div>
            //       </div>
            //     </div>
            //     <div className='flex-1 flex justify-center items-center mt-5 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0'>
            //       <img src={imgHome} className='w-[500px] h-[500px]' />
            //     </div>
            //   </div>
            // </div>
            <div className='w-full h-full flex flex-col sm:flex-row justify-center relative'>
              <img className='hidden xl:block absolute top-16 w-1/3' src="/assets/images/homePage/lineTop.png" alt="Line Top" />
              <img className='hidden xl:block absolute bottom-0' src="/assets/images/homePage/lineBot.png" alt="Line Bottom" />
              <img className='hidden xl:block absolute left-14 top-1/3' src="/assets/images/homePage/lineLeft.png" alt="Line Left" />
              <img className='hidden 2xl:block absolute right-8 top-1/4' src="/assets/images/homePage/lineRight.png" alt="Line Right" />
              <div className='w-full mt-10 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row'>
                <div className='flex-1 mt-20'>
                  <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold flex justify-center'>
                    <div className='w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5 text-center'>
                      {t('homepage.welcome')}
                    </div>
                  </div>
                  <div className='flex justify-center'>
                    <div className='flex mt-5 justify-center w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5'>
                      <button
                        className={`bg-custom-button-control hover:bg-custom-button-control-hover font-bold ${theme === 'dark' ? 'text-black' : 'text-white'} shadow-xl rounded-3xl py-1 px-3 m-2 transition duration-200`}
                        onClick={scrollToTargetDiv}
                      >
                        {t('homepage.getStarted')}
                      </button>
                      <button
                        className={`bg-gray-300 hover:bg-gray-400 shadow-xl rounded-3xl py-1 px-3 m-2 transition duration-200 ${theme === 'dark' ? 'text-black' : 'text-white'}`}
                      >
                        {t('homepage.learnMore')}
                      </button>
                    </div>
                  </div>
                  <div className='flex justify-center mt-5 h-2/5'>
                    <div className='w-full sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-3/5 text-center font-sans text-xl'>
                      &quot;{t('homepage.description')}&quot;
                    </div>
                  </div>
                </div>
                <div className='flex-1 flex justify-center items-center mt-5 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0'>
                  <img src="/assets/images/homePage/imgHome.png" className='w-[500px] h-[500px]' alt="Home" />
                </div>
              </div>
            </div>
          )}
          {displayGrid && (
            <div className='w-full flex justify-center' id='learnerViewing' ref={targetDivRef}>
              <div className='w-4/5'>
                <p className='font-bold text-2xl text-shadow-lg mt-14'>{t('homepage.featuredLearningCategories')}</p>
                {/* {isPressed && <div className="fixed inset-0 bg-black opacity-50" onClick={handlePress}></div>} */}
                <SlideBar></SlideBar>
              </div>
            </div>
          )}
          <div className='mt-10' ref={searchDivRef}></div>
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
            : <div className='w-4/5 mx-auto pt-5'>
              <Tabs selectedIndex={currentTab} onSelect={(index) => setCurrentTab(index)}>
                <TabList className="flex lg:w-2/5 sm:w-4/5 w-full mt-5">
                  <Tab className="font-bold cursor-pointer rounded-lg w-auto px-4" selectedClassName={`text-custom-tab underline text-lg ${theme === 'light' ? 'bg-custom-background-tab' : 'bg-custom-background-tab-dark'}`}>{t('homepage.allCourse')} ({dataState?.totalRecords ?? 0})</Tab>
                  {/* <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('homepage.freeCourse')}</Tab>
                  <Tab className="flex-1 font-bold cursor-pointer text-center rounded-lg" selectedClassName="text-blue-500 bg-blue-100 underline text-lg">{t('homepage.paidCourse')}</Tab> */}
                </TabList>
                <hr className={`my-4 border-t -mx-5 ${theme === 'dark' ? 'border-line-dark' : 'border-gray-300'}`} />
                <TabPanel className="flex flex-col justify-between">
                  <div className='grid grid-cols-12 gap-6 mt-4'>
                    {dataState?.data?.length
                      ? (
                          dataState?.data
                            .map((item, index) => (
                          <HomeCourseCard
                            name={item.name}
                            description={item.description}
                            assignedBy={item.assignedBy}
                            creatorAVT={item.creatorAVT}
                            key={index}
                            summary={item.summary}
                            durationInMinute={item.durationInMinute}
                            id={item.id}
                            startDate={new Date(item.startDate)}
                            endDate={new Date(item.endDate)}
                            price={item.price}
                            category={item.categoryCourseName}
                            locationPath={item.locationPath}
                            enrollmentCount={item.enrollmentCount}
                            createdAt={item.createdAt}
                            lessonCount={item.lessonCount}
                          />
                            ))
                        )
                      : (
                        <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('homepage.empty_data_course')}</div>
                        )}
                  </div>
                  <div className='flex justify-center mt-10 md:mt-5 lg:mt-3'>
                    <CustomPagination
                      count={totalPage}
                      page={page}
                      onChange={(_, page) => handleChangePagination(page)}
                      boundaryCount={1}
                      siblingCount={1}
                    />
                  </div>
                </TabPanel>
                {/* <TabPanel className="flex flex-col justify-between">
                  <div className="grid grid-cols-12 gap-6 mt-4">
                    {dataStateFree?.data?.length
                      ? (
                          dataStateFree?.data
                            .map((item, index) => (
                          <HomeCourseCard
                            name={item.name}
                            description={item.description}
                            assignedBy={item.assignedBy}
                            key={index}
                            summary={item.summary}
                            durationInMinute={item.durationInMinute}
                            id={item.id}
                            startDate={new Date(item.startDate)}
                            endDate={new Date(item.endDate)}
                            price={item.price}
                            category={item.categoryCourseName}
                            locationPath={item.locationPath}
                          />
                          ))
                        )
                      : (
                        <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('homepage.empty_data_course')}</div>
                        )}
                  </div>
                  <div className='flex justify-center mt-10'>
                  <CustomPagination
                      count={totalPageFree}
                      page={pageFree}
                      onChange={(_, page) => handleChangePaginationFree(page)
                      }
                      boundaryCount={1}
                      siblingCount={1}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="flex flex-col justify-between">
                  <div className="grid grid-cols-12 gap-6 mt-4">
                    {dataStatePaid?.data?.length
                      ? (
                          dataStatePaid?.data
                            .map((item, index) => (
                            <HomeCourseCard
                            name={item.name}
                            description={item.description}
                            assignedBy={item.assignedBy}
                            key={index}
                            summary={item.summary}
                            durationInMinute={item.durationInMinute}
                            id={item.id}
                            startDate={new Date(item.startDate)}
                            endDate={new Date(item.endDate)}
                            price={item.price}
                            category={item.categoryCourseName}
                            locationPath={item.locationPath}
                          />
                          ))
                        )
                      : (
                        <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('homepage.empty_data_course')}</div>
                        )}
                  </div>
                  <div className='flex justify-center mt-10'>
                  <CustomPagination
                      count={totalPagePaid}
                      page={pagePaid}
                      onChange={(_, page) => handleChangePaginationPaid(page)
                      }
                      boundaryCount={1}
                      siblingCount={1}
                    />
                  </div>
                </TabPanel> */}
              </Tabs>
              <div className="mt-8">
                <h2 className={`text-xl leading-snug font-bold mb-5 ${theme === 'dark' ? 'text-custom-title' : 'text-slate-800'}`}>
                  {t('homepage.popularCategories')}
                </h2>
                <div className="grid grid-cols-12 gap-6">
                  <PopularCard />
                </div>
              </div>
              {/* <div className="mt-8">
                <h2 className={`text-xl leading-snug font-bold mb-5 ${theme === 'dark' ? 'text-custom-title' : 'text-slate-800'}`}>
                  {t('homepage.trendingNow')}
                </h2>
                <div className="grid grid-cols-12 gap-6">
                  <TrendingCard />
                </div>
              </div> */}
            </div>
          }
        </div>
        {displayGrid && (
          <TopCategoryGrid />
        )}
        <div className='w-4/5 mx-auto pt-5'>
          <div className="mt-8">
            <div className='text-custom-title font-bold'>{t('homepage.courseAndProfessionalCertificates')}</div>
            <div className='font-bold text-2xl text-shadow-lg'>{t('homepage.newOnSorimachi')}</div>
            <div className=''>{t('homepage.explore')}</div>
            <div className="grid grid-cols-12 gap-6">
              {dataStateNew?.data?.length
                ? (
                    dataStateNew?.data
                      .map((item, index) => (
                    <HomeCourseCard
                      name={item.name}
                      key={index}
                      durationInMinute={item.durationInMinute}
                      id={item.id}
                      category={item.categoryCourseName}
                      locationPath={item.locationPath}
                      assignedBy={item.assignedBy}
                      creatorAVT={item.creatorAVT}
                      enrollmentCount={item.enrollmentCount}
                    />
                      ))
                  )
                : (
                  <div className='py-10 flex items-center justify-center w-full h-full text-center italic col-span-12'>{t('homepage.empty_data_course')}</div>
                  )}
            </div>
            {(isNewViewAll || isSmallScreen) && (
              <div className='flex justify-center mt-10'>
                <CustomPagination
                  count={totalPageNew}
                  page={pageNew}
                  onChange={(_, page) => handleChangePaginationNew(page)}
                  boundaryCount={1}
                  siblingCount={1}
                />
              </div>
            )}
            <div className='mt-8 flex xl:w-1/6 md:w-2/5 w-full space-x-3 lg:space-x-5'>
              { }
              <button
                onClick={fetchAllNewCourse}
                className={`sm:flex hidden sm:w-auto w-4/5 flex-1 py-1 px-2 rounded-md border items-center justify-between
    ${theme === 'dark' ? 'bg-white text-custom-button-showall-dark border-custom-button-showall-dark hover:bg-custom-button-showall-dark hover:text-white' : 'bg-white text-custom-button-showall border-custom-button-showall hover:bg-custom-button-showall hover:text-white'}`}
              >
                {isNewAllLoading
                  ? (
                    <div className='flex items-center justify-center w-full'>
                      <svg className="animate-spin h-4 fill-current" viewBox="0 0 16 16">
                        <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                      </svg>
                    </div>
                    )
                  : (
                    <div className='w-full font-bold text-center'>
                      {t('homepage.viewAll')}
                    </div>
                    )}
              </button>
            </div>
          </div>
        </div>

        {/* OLD IMG */}

        <div className='bg-custom-img-footer my-20 flex flex-col md:flex-row py-5 text-black'>
          <div className='w-full xl:w-1/3 lg:w-1/3 sm:w-full md:w-1/3 flex justify-center -my-8'>
            <img src='/assets/images/homePage/bgfoot.png' className='w-96 h-128'></img>
          </div>
          <div className='flex flex-col items-center md:items-start justify-center w-full sm:w-full xl:w-2/3 lg:w-2/3 md:w-2/3'>
            <div className='w-11/12'>
              <div className='md:text-7xl sm:text-5xl font-bold text-4xl md:mt-0 sm:mt-10 mt-16 md:text-left text-center'>{t('homepage.outComes')}</div>
              <p className='md:text-3xl font-bold mt-4 md:text-left text-center text-xl '>
                {t('homepage.footer1')}{' '}
              </p>
              <div className='flex md:justify-start justify-center'>
                <button
                  className='bg-custom-button-footer hover:bg-custom-button-control-hover rounded-3xl text-white items-center justify-center h-10 w-32 mt-4 transition duration-300'
                >
                  {t('homepage.join')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NEW IMG */}

        {/* <div className='mt-20 py-5'>
          <img src={imgFoot2} className='w-full h-128'></img>
        </div> */}
        <button
          className={`rounded-full fixed bottom-3 right-8 z-50 text-lg border-none outline-none bg-custom-button-enroll hover:bg-custom-button-enroll-hover text-white cursor-pointer p-4 transition-colors duration-500 ${showButtonTop ? '' : 'hidden'}`}
          onClick={moveToTop}
        ><KeyboardArrowUpIcon style={{ fill: 'rgba(0, 0, 0, 1)', stroke: 'black', strokeWidth: 5 }} />
        </button>
      </div>
    </div>

  )
}
export default HomePage
