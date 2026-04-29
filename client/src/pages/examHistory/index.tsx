/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Styled from './index.style'
import { t } from 'i18next'
import { Box, Button } from '@mui/material'
import { darken, lighten } from '@mui/material/styles'
// import { DataGrid, GridApi, GridCellValue, GridColDef, GridToolbar } from '@mui/x-data-grid'
import { DataGrid, GridApi, GridCellValue, GridColDef } from '@mui/x-data-grid'
import { getShortHistoryExams } from 'api/post/post.api'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
export interface IHistory {
  examId?: string
  overAllScore?: string | number
  attempt?: number
  updatedAt?: Date | null
  numberOfQuestions?: number
  name?: string
}

const getBackgroundColor = (color: string, mode: string) =>
  mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6)

const getHoverBackgroundColor = (color: string, mode: string) =>
  mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5)

const ExamHistory = () => {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const [data, setData] = useState<IHistory[]>([] as IHistory[])
  const getData = useCallback(
    async (id?: string) => {
      try {
        const listHistoryExamsResponse = await getShortHistoryExams({ id })
        setData(listHistoryExamsResponse?.data)
      } catch (e) {
        const tokens = getFromLocalStorage<any>('tokens')
        if (tokens === null) {
          navigate('/login', {
            replace: true
          })
        }
      }
    },
    [searchParams]
  )

  useEffect(() => {
    if (params?.id) {
      void getData(params?.id)
    }
  }, [getData, params, searchParams])
  const toDateString = (date: Date | null | undefined) => {
    if (date) {
      return new Date(date).toLocaleString('vi')
    } else {
      return ''
    }
  }

  const columns: GridColDef[] = [
    { field: 'examId', headerName: `${t('history.exam_id')}`, width: 200, align: 'center', headerAlign: 'center', headerClassName: 'super-app-theme--header', hide: true },
    { field: 'attempt', headerName: `${t('history.attempt')}`, width: 200, align: 'center', headerAlign: 'center', headerClassName: 'super-app-theme--header' },
    { field: 'overAllScore', headerName: `${t('history.over_all_score')}`, width: 250, align: 'center', headerAlign: 'center', headerClassName: 'super-app-theme--header' },
    {
      field: 'updatedAt',
      headerName: `${t('history.updated_at')}`,
      width: 300,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        return toDateString(params?.value)
      }
    },
    { field: 'numberOfQuestions', headerName: `${t('history.number_of_questions')}`, width: 300, align: 'center', headerAlign: 'center', headerClassName: 'super-app-theme--header' },
    {
      field: 'action',
      headerName: `${t('history.action')}`,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const onClick = () => {
          const api: GridApi = params.api
          const thisRow: Record<string, GridCellValue> = {}
          api
            .getAllColumns()
            .filter((c) => c.field !== '__check__' && !!c)
            .forEach(
              (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
            )
          return navigate(`/exams/${thisRow?.examId}/${thisRow?.attempt}?status=view`)
        }
        return <Button onClick={onClick}>{t('history.review')}</Button>
      },
      width: 200
    }
  ]

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <Styled.Container>
      <Styled.HeaderDetail>
        <h2><a href='/'>{t('history.homepage')}</a></h2>
        <Styled.InfoExamContainer>
          <div>{`${t('history.exam_name')}: ${data[0]?.name}`}</div>
          <div>{`${t('history.number_of_times_done')}: ${data?.length}`}</div>
          <Button startIcon={<SportsScoreIcon/>} variant="contained" onClick={() => navigate(`/exams/${params.id}?status=test`)}>{t('history.take_exam')}</Button>
        </Styled.InfoExamContainer>
      </Styled.HeaderDetail>
      <Box
        sx={{
          height: 700,
          width: '100%',
          // '& .super-app-theme--Open': {
          //   bgcolor: (theme) =>
          //     getBackgroundColor(theme.palette.info.main, theme.palette.mode),
          //   '&:hover': {
          //     bgcolor: (theme) =>
          //       getHoverBackgroundColor(theme.palette.info.main, theme.palette.mode)
          //   }
          // },
          '& .super-app-theme--Pass': {
            bgcolor: (theme) =>
              getBackgroundColor(theme.palette.success.main, theme.palette.mode),
            '&:hover': {
              bgcolor: (theme) =>
                getHoverBackgroundColor(
                  theme.palette.success.main,
                  theme.palette.mode
                )
            }
          },
          // '& .super-app-theme--PartiallyFilled': {
          //   bgcolor: (theme) =>
          //     getBackgroundColor(theme.palette.warning.main, theme.palette.mode),
          //   '&:hover': {
          //     bgcolor: (theme) =>
          //       getHoverBackgroundColor(
          //         theme.palette.warning.main,
          //         theme.palette.mode
          //       )
          //   }
          // },
          '& .super-app-theme--Fail': {
            bgcolor: (theme) =>
              getBackgroundColor(theme.palette.error.main, theme.palette.mode),
            '&:hover': {
              bgcolor: (theme) =>
                getHoverBackgroundColor(theme.palette.error.main, theme.palette.mode)
            }
          },
          '& .super-app-theme--header': {
            fontSize: '20px'
          }
        }}
      >
        <DataGrid
          columns={columns}
          rows={data}
          getRowId={(row: any) => row.attempt}
          // components={{ Toolbar: GridToolbar }}
          getRowClassName={(params) => {
            const point = String(params.row.overAllScore).split(' / ')
            return Number(point[0]) / Number(point[1]) >= 0.5 ? 'super-app-theme--Pass' : 'super-app-theme--Fail'
          }}
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main'
            }
          }}
        />
      </Box>
    </Styled.Container>
  )
}

export default ExamHistory
