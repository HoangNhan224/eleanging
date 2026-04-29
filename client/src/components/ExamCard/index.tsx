/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Styled from './index.style'
import { t } from 'i18next'
import React, { useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
import ModalComponent from 'components/Modal'
import { useNavigate } from 'react-router-dom'

interface Props {
  description?: string
  courseId?: string
  groupId?: string
  id?: string
  name?: string
  score?: string
  status?: string
  type?: string
  numberOfAttempt: number
  attempted: number
  durationInMinute: number
  pointToPass: number
  image: string
  createrId: string
  numberOfQuestion: number
  publicDate: Date
  publicStatus: boolean
  children?: React.ReactNode
}

const ExamCard = ({
  name,
  description,
  courseId,
  groupId,
  score,
  status,
  id,
  attempted,
  numberOfAttempt,
  durationInMinute,
  pointToPass,
  image,
  createrId,
  numberOfQuestion,
  publicDate,
  publicStatus,
  children
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const navigate = useNavigate()

  const examPathView = useMemo(() => {
    return `/exams/${id}/history`
  }, [id])

  const examPathTest = useMemo(() => {
    return `/exams/${id}?status=test`
  }, [id])

  const handleOkModal = () => {
    navigate(examPathTest)
  }

  const handleOpenModal = () => {
    setIsOpenModal(true)
  }

  const statusText = useMemo(() => {
    if (status === 'tested') {
      return (
        t('homepage.filter.tested') +
        ` ${attempted} ${numberOfAttempt ? ' / ' + numberOfAttempt : ''}`
      )
    }
    return t('homepage.filter.pending')
  }, [status, attempted, numberOfAttempt])

  const scoreText = useMemo(() => {
    if (!score) {
      return null
    }
    return <Styled.CardScore>{score}</Styled.CardScore>
  }, [score])

  const descriptionExcerptText = useMemo(() => {
    return description?.substring(0, 100) + '...'
  }, [description])

  const duration = useMemo(() => {
    if (!durationInMinute) {
      return `${t('homepage.limitTimeGuid')}: ${t('homepage.noTimeLimited')}`
    } else {
      return `${t('homepage.limitTimeGuid')}: ${durationInMinute} ${t('homepage.minuteText')}`
    }
  }, [durationInMinute])

  const confirmMessage: any = useMemo(() => {
    return (
      <>
        {t('homepage.modal_test_description')}
        <br></br>
        <p>{name && name}</p>
        <p>{duration}</p>
      </>
    )
  }, [])

  return (
    <Styled.CardWrapper>
      <Styled.CardStatus status={status}>{statusText}</Styled.CardStatus>
      <Styled.CardNameContainer>
        <div>
        <div>courseId: {courseId}</div>
        <div>groupId: {groupId}</div>
        <div>ID: {id}</div>
        <div>Number attemps: {numberOfAttempt}</div>
        <div>Attempeds: {attempted}</div>
        <div>point to pass: {pointToPass}</div>
        <div>Number of question: {numberOfQuestion}</div>
        </div>
        <div>
        <div>Public date: {publicDate}</div>
        <div>Public status: {publicStatus}</div>
        <div>Creater ID: {createrId}</div>
        </div>
        <Styled.CardName title={name}>{name}</Styled.CardName>
        {scoreText}
        {duration}
      </Styled.CardNameContainer>
      <Styled.CardDescription>{descriptionExcerptText}</Styled.CardDescription>
      <Styled.ButtonGroup>
        {attempted && (<Styled.ButtonView to={examPathView}>
          <SearchIcon />
          <p>{t('homepage.view')}</p>
        </Styled.ButtonView>)}
        {(attempted < numberOfAttempt || !numberOfAttempt) && (
          <Styled.ButtonTest onClick={handleOpenModal}>
            <SportsScoreIcon />
            <p>{t('homepage.test')}</p>
          </Styled.ButtonTest>
        )}
      </Styled.ButtonGroup>
      <ModalComponent
        isOpen={isOpenModal}
        okText={t('homepage.start') ?? ''}
        cancelText={t('homepage.another_time') ?? ''}
        title={t('homepage.modal_test_title') ?? ''}
        description={confirmMessage}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleOkModal}
        onClose={() => setIsOpenModal(false)}
      />
    </Styled.CardWrapper>
  )
}

export default ExamCard
