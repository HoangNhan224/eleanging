/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useCallback, useEffect, useState } from 'react'
import Styled from './index.style'
// import { useTranslation } from 'react-i18next'
import { commentOnQuestion, getQuestionDiscussion } from 'api/post/post.api'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Button, Avatar } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface Props {
  questionId?: string
}

interface IDiscussion {
  userId?: string
  username?: string
  comment?: string
  like?: number
  unlike?: number
  updateAt?: Date
}

interface FormValues {
  comment: string
}

const Discussion = ({ questionId }: Props) => {
  const { t } = useTranslation()
  const [data, setData] = useState<IDiscussion[]>({} as IDiscussion[])
  const { register, handleSubmit, setValue } = useForm<FormValues>()
  const onSubmit: SubmitHandler<FormValues> = async data => {
    if (questionId && data.comment.length) {
      await commentOnQuestion(questionId, data)
      void getData(questionId)
      setValue('comment', '', {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  }
  // const { t } = useTranslation()
  const getData = useCallback(
    async (id?: string) => {
      try {
        const listDiscussion = await getQuestionDiscussion({ id })
        setData(listDiscussion?.data)
      } catch (e) {
        console.log(e)
      }
    },
    []
  )
  useEffect(() => {
    void getData(questionId)
  }, [])

  function stringToColor (string: string) {
    let hash = 0
    let i
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = '#'
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
    }
    return color
  }

  function stringAvatar (name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name)
      },
      children: `${name.split(' ')[0][0].toUpperCase()}`
    }
  }
  return (
    <Styled.DiscussionContainer>
      <div>
        <Styled.SendFeadbackTitle>{t('discussion.send_feedback')}</Styled.SendFeadbackTitle>
        <Styled.FeadbackContainer>
          <textarea rows={4} cols={50} {...register('comment')} style={{ resize: 'none', padding: 5 }}/>
          <Button variant="outlined" onClick={handleSubmit(onSubmit)}>{t('discussion.send')}</Button>
        </Styled.FeadbackContainer>
      </div>
      <Styled.CommentContainer>
        <Styled.SendFeadbackTitle>{t('discussion.feedback')}: {data.length}</Styled.SendFeadbackTitle>
        {data.length > 0 && data?.map(
          (item, index) => (
            <Styled.SingleComment key={index} isEnd={index === data.length - 1}>
              <div>
                <Styled.ContainerTree>
                  <Styled.BorderTree index={index}></Styled.BorderTree>
                  <Avatar {...stringAvatar(String(item.username) ?? t('discussion.guest'))} />
                </Styled.ContainerTree>
              </div>
              <Styled.Container>
                <Styled.DiscussionTitle>
                  {item.username}
                </Styled.DiscussionTitle>
                <Styled.DiscussionContent>
                  {item.comment}
                </Styled.DiscussionContent>
              </Styled.Container>
            </Styled.SingleComment>
          ))}
      </Styled.CommentContainer>
    </Styled.DiscussionContainer>
  )
}

export default Discussion
