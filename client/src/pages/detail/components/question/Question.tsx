/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Checkbox, FormControlLabel, Radio } from '@mui/material'
import { FieldValues, UseFormSetValue, useFormContext } from 'react-hook-form'
import React, { useEffect, useMemo, useState } from 'react'

import { ModalType } from '../..'
import Styled from './index.style'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Discussion from '../discussion'
import QuillShow from '../../../../components/QuillEditor'

export enum QUESTION_TYPE {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  FILL_MISSING_TEXT = 'FILL_MISSING_TEXT',
}

interface Props extends QuestionProps {
  questionId?: string
  type: QUESTION_TYPE
  statusType?: ModalType
  formPayload?: FieldValues
}

interface QuestionProps {
  no?: number
  title?: string
  option_1?: string | null
  option_2?: string | null
  option_3?: string | null
  option_4?: string | null
  option_5?: string | null
  option_6?: string | null
  option_7?: string | null
  option_8?: string | null
  option_9?: string | null
  option_10?: string | null
  option_11?: string | null
  option_12?: string | null
  option_13?: string | null
  option_14?: string | null
  option_15?: string | null
  option_16?: string | null
  value?: string
  isCorrect: boolean
  explanation?: string | null
  correctAnswer?: string | null
}

interface OptionObj {
  label?: string | number
  value?: string | number
}

interface QuestionChoiceProps {
  options?: OptionObj[]
  questionId?: string
  onChange?: UseFormSetValue<FieldValues>
  disabled?: boolean
  value?: string
  isCorrect?: boolean
  correctAnswer?: string | null
}

const MultiChoice = ({
  options,
  questionId,
  onChange,
  disabled,
  value,
  isCorrect,
  correctAnswer
}: QuestionChoiceProps) => {
  const [valueState, setValueState] = useState<string[]>([])

  useEffect(() => {
    if (value === '') {
      setValueState([])
    } else {
      const parseValue = value?.split('::')
      setValueState(parseValue as string[])
    }
  }, [value])

  if (options == null) return <></>

  const handleChange = (flag: boolean, value?: string | number) => {
    const cloneState = JSON.parse(JSON.stringify(valueState))
    if (flag) {
      cloneState.push(value)
      setValueState(cloneState)
      onChange?.(questionId as string, cloneState.join('::'))
    } else {
      const newState = cloneState.filter((i: string) => i !== value)
      setValueState(newState)
      onChange?.(questionId as string, newState.join('::'))
    }
  }

  const showIcon = (v?: string | number) => {
    if (isCorrect === null || isCorrect === undefined) {
      return null
    }
    if (isCorrect) {
      if (value?.split('::').includes(String(v))) return <Styled.CheckedIcon />
    } else {
      if (value?.split('::').includes(String(v))) {
        if (correctAnswer?.split('::').includes(String(v))) {
          return <Styled.CheckedIcon />
        } else {
          return <Styled.ClosedIcon />
        }
      }
    }
  }

  return (
    <>
      {options?.map(
        (item, index) =>
          !!item?.value && (
            <Styled.MultiChoiceContainer key={index}>
              <Checkbox
                checked={valueState.includes(String(item?.label))}
                disabled={disabled}
                onChange={(e) => handleChange(e.target.checked, item?.label)}
              />
              <Styled.MultiChoiceLabel disabled={disabled}>
                <div>
                  <QuillShow
                    htmlContent={item?.value.toString() || ''}
                  />
                </div>
              </Styled.MultiChoiceLabel>
              <Styled.ShowIcon>{showIcon(item?.label)}</Styled.ShowIcon>
            </Styled.MultiChoiceContainer>
          )
      )}
    </>
  )
}

const SingleChoice = ({
  options,
  questionId,
  onChange,
  disabled,
  value = undefined,
  isCorrect
}: QuestionChoiceProps) => {
  const [state, setState] = useState<string | number | undefined>(value)

  useEffect(() => {
    if (value === undefined) {
      setState('')
    }
  }, [value])

  if (options == null) return <></>

  const handleChange = (value?: string | number) => {
    setState(value)
    onChange?.(questionId as string, value)
  }

  const showIcon = (v?: string | number) => {
    if (isCorrect === null || isCorrect === undefined) {
      return null
    }
    if (isCorrect) {
      if (v === value) return <Styled.CheckedIcon />
    } else {
      if (v === value) return <Styled.ClosedIcon />
    }
  }

  return (
    <Styled.RadioGroupContainer
      name={questionId}
      value={state}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options?.map(
        (item, index) =>
          !!item?.value && (
            <Styled.FormControlLabelContainer key={index}>
              <FormControlLabel
                value={item?.label}
                control={<Radio />}
                label={''}
                disabled={disabled}
              />
              <div>
                <QuillShow
                  htmlContent={item?.value.toString() || ''}
                />
              </div>
              <Styled.ShowIcon>{showIcon(item?.label)}</Styled.ShowIcon>
            </Styled.FormControlLabelContainer>
          )
      )}
    </Styled.RadioGroupContainer>
  )
}

const MissingText = ({
  questionId,
  onChange,
  disabled,
  value,
  isCorrect
}: QuestionChoiceProps) => {
  const [state, setState] = useState<string | undefined>(value)
  // const { t } = useTranslation()
  const handleChange = (value: string) => {
    setState(value)
    onChange?.(questionId as string, value)
  }

  useEffect(() => {
    if (!value) {
      setState('')
    }
  }, [value])

  const showIcon = () => {
    if (value) {
      if (isCorrect) return <Styled.CheckedIcon />
      return <Styled.ClosedIcon />
    }
    return null
  }

  return (
    <Styled.InputTextContainer>
      <Styled.InputText
        sx={{ background: 'white' }}
        value={state}
        disabled={disabled}
        name={questionId}
        // placeholder={t('detail.missing_text')}
        onChange={(e) => handleChange(e.target.value)}
      />
      <Styled.ShowIcon>{showIcon()}</Styled.ShowIcon>
    </Styled.InputTextContainer>
  )
}

const Question = (props: Props) => {
  const { setValue } = useFormContext()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const isInViewMode = useMemo(() => {
    return searchParams.get('status') === 'view'
  }, [searchParams])
  const renderTypeQuestion = () => {
    switch (props.type) {
      case QUESTION_TYPE.SINGLE_CHOICE:
        return (
          <SingleChoice
            onChange={setValue}
            value={props?.value}
            questionId={props.questionId}
            isCorrect={props.isCorrect}
            options={[
              { value: props?.option_1 ?? '', label: 'a' },
              { value: props?.option_2 ?? '', label: 'b' },
              { value: props?.option_3 ?? '', label: 'c' },
              { value: props?.option_4 ?? '', label: 'd' }
            ]}
            disabled={isInViewMode}
          />
        )
      case QUESTION_TYPE.MULTIPLE_CHOICE:
        return (
          <MultiChoice
            onChange={setValue}
            value={props?.value === undefined ? '' : props?.value}
            questionId={props.questionId}
            isCorrect={props.isCorrect}
            options={[
              { value: props?.option_1 ?? '', label: 'a' },
              { value: props?.option_2 ?? '', label: 'b' },
              { value: props?.option_3 ?? '', label: 'c' },
              { value: props?.option_4 ?? '', label: 'd' },
              { value: props?.option_5 ?? '', label: 'e' },
              { value: props?.option_6 ?? '', label: 'f' },
              { value: props?.option_7 ?? '', label: 'g' },
              { value: props?.option_8 ?? '', label: 'h' },
              { value: props?.option_9 ?? '', label: 'i' },
              { value: props?.option_10 ?? '', label: 'j' },
              { value: props?.option_11 ?? '', label: 'k' },
              { value: props?.option_12 ?? '', label: 'l' },
              { value: props?.option_13 ?? '', label: 'm' },
              { value: props?.option_14 ?? '', label: 'n' },
              { value: props?.option_15 ?? '', label: 'o' },
              { value: props?.option_16 ?? '', label: 'p' }
            ]}
            disabled={isInViewMode}
            correctAnswer={props?.correctAnswer}
          />
        )
      case QUESTION_TYPE.FILL_MISSING_TEXT:
        return (
          <MissingText
            onChange={setValue}
            value={props?.value}
            questionId={props.questionId}
            disabled={isInViewMode}
            isCorrect={props.isCorrect}
          />
        )
      default:
        return null
    }
  }

  const isEmpty = useMemo(() => {
    if (!props?.questionId) return false
    return props?.formPayload?.[props?.questionId] === undefined
  }, [props?.formPayload, props?.questionId])

  const getTitleHTMLDisplay = useMemo(() => {
    if (!props?.title) {
      return ''
    } else {
      return props?.title
    }
  }, [props?.title])

  const getExplanationHTMLDisplay = useMemo(() => {
    if (!props?.explanation) {
      return ''
    } else {
      return props?.explanation.replace(/\n/g, '<br />')
    }
  }, [props?.explanation])

  const getCorrectAnswerDisplay = useMemo(() => {
    if (!props?.correctAnswer) {
      return ''
    } else {
      return props?.correctAnswer
    }
  }, [props?.correctAnswer])

  return (
    <Styled.QuestionContainer
      isWrong={(props.statusType === ModalType.FAIL && isEmpty) || !props.isCorrect}
      isModeView={isInViewMode}
      isNotAnswer={(props.statusType === ModalType.FAIL && isEmpty && !isInViewMode)}
    >
      <Styled.QuestionTitle>
        <Styled.QuestionNo>
          {t('detail.question_no') + ' ' + props?.no}:
        </Styled.QuestionNo>
        <div>
          <QuillShow
            htmlContent={getTitleHTMLDisplay || ''}
          />
        </div>
      </Styled.QuestionTitle>
      {renderTypeQuestion()}
      <Styled.QuestionExplanation>
        {props?.correctAnswer && (
          <Styled.QuestionAnswer>
          {`${t('detail.correctAnswerGuid')} ${getCorrectAnswerDisplay}`}
          </Styled.QuestionAnswer>
        )}
        {props?.explanation && (
          <>
            <Styled.QuestionExplanationTitle>
            {t('detail.explanation')}
            </Styled.QuestionExplanationTitle>
            <div>
              <QuillShow
                htmlContent={getExplanationHTMLDisplay || ''}
              />
            </div>
          </>
        )}
      </Styled.QuestionExplanation>
      {props?.correctAnswer && (<Discussion questionId={props?.questionId} />)}
    </Styled.QuestionContainer>
  )
}

export default Question
