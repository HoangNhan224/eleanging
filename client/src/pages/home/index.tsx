/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: HOME
   ========================================================================== */

import { InputAdornment, Pagination } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import ExamCard from 'components/ExamCard'
import { DataListExam, ListExamParams } from 'api/post/post.interface'
import SearchIcon from '@mui/icons-material/Search'
import Styled from './index.style'
import { getListExams } from 'api/post/post.api'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'hooks'
import { getFromLocalStorage } from 'utils/functions'
import { useNavigate } from 'react-router-dom'

interface ParamsList extends ListExamParams {
  examStatus?: StatusExam
}

enum StatusExam {
  ALL = 'all',
  DONE = 'done',
  NOT_DONE = 'not-done',
}

const Home = () => {
  const [dataState, setDataState] = useState<DataListExam | undefined>(
    undefined
  )
  const [filter, setFilter] = useState<StatusExam>(StatusExam.ALL)
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const searchDebounce = useDebounce(search, 500)

  const { t } = useTranslation()

  const navigate = useNavigate()

  const filterOptions = useMemo(() => {
    return [
      {
        label: t('homepage.filter.all'),
        value: StatusExam.ALL
      },
      {
        label: t('homepage.filter.pending'),
        value: StatusExam.NOT_DONE
      },
      {
        label: t('homepage.filter.tested'),
        value: StatusExam.DONE
      }
    ]
  }, [t])

  const getData = async (params?: ParamsList) => {
    try {
      const listExamsResponse = await getListExams({ params })
      if (!listExamsResponse.data) {
        setDataState(undefined)
      } else {
        setDataState(listExamsResponse?.data)
        setFilter(params?.examStatus ?? StatusExam.ALL)
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

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (searchDebounce !== null) {
      getData({ page: 1, examStatus: filter, search: searchDebounce })
    }
    /* Only call for search changes */
  }, [searchDebounce])

  const handleChangeFilter = (value: StatusExam) => {
    getData({ page, examStatus: value, search })
  }

  const handleChangePagination = (value: number) => {
    getData({ page: value, examStatus: filter, search })
  }

  const totalPage = useMemo(() => {
    const size = (dataState != null) ? dataState.size : 10
    const totalRecord = (dataState != null) ? dataState.totalRecords : 10
    return Math.ceil(totalRecord / size)
  }, [dataState?.size, dataState?.totalRecords])

  return (
    <Styled.Container>
      <Styled.FilterContainer>
        <Styled.FilterTitle>{t('homepage.filter_title')}</Styled.FilterTitle>
        <Styled.FilterDropdown>
          <Styled.FilterLabel>{t('homepage.filter_label')}</Styled.FilterLabel>
          <Styled.Filter
            value={filter}
            onChange={(e) => handleChangeFilter(e.target.value as StatusExam)}
          >
            {filterOptions.map((item, index) => (
              <Styled.OptionItem value={item.value} key={index}>
                {item.label}
              </Styled.OptionItem>
            ))}
          </Styled.Filter>
          <Styled.SearchInput
            // placeholder={t('homepage.filter_placeholder_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
        </Styled.FilterDropdown>
      </Styled.FilterContainer>
      <Styled.ListExams>
        {dataState?.data?.length
          ? (
              dataState?.data.map?.((item, index) => (
              <ExamCard
                name={item.name}
                description={item.description}
                courseId={item.courseId}
                groupId={item.groupId}
                key={index}
                score={item.score}
                id={item.id}
                status={item.attempted > 0 ? 'tested' : 'pending'}
                attempted={item.attempted}
                numberOfAttempt={item.numberOfAttempt}
                durationInMinute={item.durationInMinute}
                pointToPass={item.pointToPass}
                image={item.image}
                createrId={item.createrId}
                numberOfQuestion={item.numberOfQuestion}
                publicDate={item.publicDate}
                publicStatus={item.publicStatus}
              />
              ))
            )
          : (
            <Styled.EmptyData>{t('homepage.empty_data')}</Styled.EmptyData>
            )}
      </Styled.ListExams>
      <Styled.PaginationContainer>
        <Pagination
          count={totalPage}
          page={page}
          onChange={(_, page) => handleChangePagination(page)}
        />
      </Styled.PaginationContainer>
    </Styled.Container>
  )
}

export default Home
