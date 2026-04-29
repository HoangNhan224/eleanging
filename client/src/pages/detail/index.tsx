/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */
import { FieldValues, FormProvider, useForm, useFormState, useWatch } from 'react-hook-form'
import Question, { QUESTION_TYPE } from './components/question/Question'
import { getDetailExams, markExam, saveTempAnswer } from 'api/post/post.api'
import React, { useCallback, useEffect, useState, useMemo } from 'react'

import { t } from 'i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Styled from './index.style'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ModalComponent from 'components/Modal'
import { getFromLocalStorage } from 'utils/functions'
import CountDownTimer from './components/timer/CountDownTimer'

enum Mode {
  VIEW = 'view',
  TEST = 'test',
}

export enum ModalType {
  SUBMIT = 'submit',
  FAIL = 'fail',
}

export interface Question {
  a: string | null
  b: string | null
  c: string | null
  d: string | null
  e: string | null
  f: string | null
  g: string | null
  h: string | null
  i: string | null
  j: string | null
  k: string | null
  l: string | null
  m: string | null
  n: string | null
  o: string | null
  p: string | null
  createdAt: string
  score: string
  id: string
  isCorrect: boolean
  title: string
  type: string
  updatedAt: string
  userAnswer: string
  explanation: string
  correctAnswer: string
  isSelect: boolean
}

export interface IDetail {
  description?: string
  id?: string
  name?: string
  score?: string | number
  questions?: Question[]
  numberOfAttempt?: number
  attempted?: number
  lastAttempted?: number
  enterTime?: Date | null
  exitTime?: Date | null
  durationInMinute?: number | 0
}

const Detail = () => {
  const method = useForm()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState<IDetail>({} as IDetail)
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [modalType, setModalType] = useState<ModalType>(ModalType.SUBMIT)
  const [formPayload, setFormPayload] = useState<FieldValues>({})
  const [payload, setPayload] = useState({})
  const [reload, setReload] = useState(false)

  const handleOpenModal = () => {
    setModalType(ModalType.SUBMIT)
    setIsOpenModal(true)
  }

  const isInViewMode = useMemo(() => {
    return searchParams.get('status') === 'view'
  }, [searchParams])

  const onSubmit = useCallback(
    async (payload: any) => {
      console.log('payload', payload)
      try {
        await markExam(data.id as string, payload)
        navigate(`/exams/${data?.id}?status=view`, {
          replace: true
        })
        setIsOpenModal(false)
      } catch (e) {
        const tokens = getFromLocalStorage<any>('tokens')
        if (tokens === null) {
          navigate('/login', {
            replace: true
          })
        }
      }
    },
    [data.id, navigate]
  )

  const getData = useCallback(
    async (id?: string, attempt?: string) => {
      try {
        const status = searchParams.get('status')
        const listExamsResponse = await getDetailExams({ id, attempt, status })
        if (listExamsResponse?.data) {
          setData(listExamsResponse.data)
          listExamsResponse.data.questions?.map((i: { id: { toString: () => any }, userAnswer: any }, index: { toString: () => any }) => {
            if (i.userAnswer) {
              method.setValue(i.id.toString(), i.userAnswer)
              if (status === 'test') {
                setPayload(method.getValues())
              }
            }
            return null
          })
        } else {
          setData({} as IDetail)
        }
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

  const handleRetest = useCallback(() => {
    navigate(`/exams/${data?.id}?status=test`, {
      replace: true
    })
    method.reset()
  }, [data?.id, navigate])

  const handleOkModal = useCallback(() => {
    const payload = method.getValues()
    if (modalType === ModalType.FAIL) {
      setIsOpenModal(false)
      return
    }
    if (
      !((data?.questions) == null) &&
      Object.keys(payload).length < data?.questions?.length
    ) {
      setModalType(ModalType.FAIL)
      setFormPayload(payload)
      return
    }
    onSubmit(payload)
  }, [data?.questions, method, modalType, onSubmit])

  useEffect(() => {
    if (params?.id) {
      getData(params?.id, params?.attempt)
    }
  }, [getData, params, searchParams])

  const statusText = useMemo(() => {
    if (data.attempted && data.attempted > 0) {
      return (
        t('homepage.filter.tested') +
        ` ${data.lastAttempted} ${
          data.numberOfAttempt ? ' / ' + data.numberOfAttempt : ''
        }`
      )
    }
    return t('homepage.filter.pending')
  }, [data.attempted, data.numberOfAttempt])

  const haveMoreAttempt = useMemo(() => {
    if (!data.numberOfAttempt) {
      return true
    } else if (!data.attempted) {
      return true
    } else if (data.attempted < data.numberOfAttempt) {
      return true
    } else {
      return false
    }
  }, [data.attempted, data.numberOfAttempt])

  const confirmMessage: string = useMemo(() => {
    if (!modalType) return ''
    else if (modalType === ModalType.FAIL) {
      return (
        t('detail.not_enough_field')
      )
    } else return t('detail.modal_test_description')
  }, [modalType])

  const validEndTime: Date | null = useMemo(() => {
    if (data?.enterTime != null && data?.durationInMinute != null && data?.exitTime == null) {
      const enterTime = new Date(data?.enterTime)
      return new Date(enterTime.getTime() + data?.durationInMinute * 60000)
    } else {
      return null
    }
  }, [data])

  function handleFormChange (e: any) {
    if (searchParams.get('status') === Mode.TEST) {
      setPayload(method.getValues())
      const saveData = async () => {
        await saveTempAnswer(data.id as string, payload)
      }
      saveData().catch(console.error)
    }
  }
  useEffect(() => {
    data?.questions?.map((question, index) => (
      Object.keys(payload).map((key, index) => {
        if (String(question.id) === String(key)) {
          if (Object.values(payload)[index] !== '') {
            question.isSelect = true
            question.userAnswer = String(Object.values(payload)[index])
          } else {
            question.isSelect = false
          }
        }
        return question
      })
    ))
    setReload((prev: boolean) => !prev)
  }, [payload])

  useEffect(() => {
  }, [reload])

  const refs = data?.questions?.reduce((acc: any, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})

  const handleClickToElement = (id: string) => {
    window.scrollTo(0, refs[id].current.offsetTop - 150)
  }

  return (
    <FormProvider {...method}>
      <Styled.FormContainer onSubmit={method.handleSubmit(onSubmit)} onChange={handleFormChange}>
        <Styled.HeaderDetail>
          <Styled.TestContainer>
            <Styled.BackButton type="button" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
              <p>{t('detail.back')}</p>
            </Styled.BackButton>
            <Styled.TestName>{data?.name}</Styled.TestName>
            <Styled.TestDescription>{data?.description}</Styled.TestDescription>
          </Styled.TestContainer>
          {validEndTime && (<CountDownTimer onTimeUp={() => alert(t('detail.timeup'))} targetDate={validEndTime.getTime() }></CountDownTimer>)}
        </Styled.HeaderDetail>
        {/* <Styled.DetailContainer> */}
        <Styled.TestStatus>{statusText}</Styled.TestStatus>
        {data?.attempted !== 0 && searchParams.get('status') === Mode.VIEW && (
          <>
            <Styled.Score>{`${t('detail.attempt')} ${data?.attempted}`}</Styled.Score>
            <Styled.Score>{`${t('detail.score')} ${data?.score}`}</Styled.Score>
          </>
        )}<Styled.NumberTestContainer>
          {
            data?.questions?.map((question, index) => (
              <Styled.NumberTestBox isWrong={question.isCorrect}
              isModeView={isInViewMode} isSelect={question.isSelect} key={question.id} onClick={() => handleClickToElement(question.id)}>
                <Styled.NumberTestBoxHeader>{index + 1}</Styled.NumberTestBoxHeader>
                <Styled.NumberTestBoxBody>
                  {
                    isInViewMode ? (question.isCorrect ? <Styled.CheckedIcon></Styled.CheckedIcon> : <Styled.ClosedIcon></Styled.ClosedIcon>) : <>{question.type === 'SINGLE_CHOICE' && question.userAnswer}</>
                  }
                </Styled.NumberTestBoxBody>
              </Styled.NumberTestBox>
            ))
          }
        </Styled.NumberTestContainer>
        {data?.questions?.map((i, index) => (
          <div ref={refs[i.id]} key={i.id}>
            <Question
              formPayload={formPayload}
              statusType={modalType}
              key={i.id}
              questionId={i.id.toString()}
              type={i.type as QUESTION_TYPE}
              title={i.title}
              option_1={i.a}
              option_2={i.b}
              option_3={i.c}
              option_4={i.d}
              option_5={i.e}
              option_6={i.f}
              option_7={i.g}
              option_8={i.h}
              option_9={i.i}
              option_10={i.j}
              option_11={i.k}
              option_12={i.l}
              option_13={i.m}
              option_14={i.n}
              option_15={i.o}
              option_16={i.p}
              value={i.userAnswer === null ? undefined : i.userAnswer}
              no={index + 1}
              isCorrect={i.isCorrect}
              explanation={i.explanation}
              correctAnswer={i.correctAnswer}
            />
          </div>
        ))}
        {/* </Styled.DetailContainer> */}
        <Styled.FooterDetail>
          <Styled.ButtonContainer>
            {data?.attempted !== 0 && searchParams.get('status') === Mode.VIEW && haveMoreAttempt && (
              <Styled.RetestButton type="button" onClick={handleRetest}>
                {t('detail.retest')}
              </Styled.RetestButton>
            )}
            {data && searchParams.get('status') === Mode.TEST && (
              <Styled.SubmitButton type="button" onClick={handleOpenModal}>
                {t('detail.submit')}
              </Styled.SubmitButton>
            )}
          </Styled.ButtonContainer>
        </Styled.FooterDetail>
      </Styled.FormContainer>
      <ModalComponent
        isOpen={isOpenModal}
        title={t('detail.modal_test_title') ?? ''}
        description={confirmMessage}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      />
    </FormProvider>
  )
}

export default Detail
