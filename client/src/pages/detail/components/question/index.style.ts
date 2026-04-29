/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { InputBase, RadioGroup } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import styled from 'styled-components'
interface Props {
  isWrong: boolean
  isModeView: boolean
  isNotAnswer: boolean
}
const Styled = {
  QuestionContainer: styled.div<Props>`
  margin: 0 auto 20px;
  padding: 20px;
  border: ${({ isWrong, isModeView, isNotAnswer }) => (!isModeView ? isNotAnswer ? '1px solid red' : '1px solid #cccccc' : isWrong ? '1px solid red' : '1px solid green')};
  background-color: ${({ isWrong, isModeView, isNotAnswer }) => (!isModeView ? isNotAnswer ? '#f5c4c426' : 'white' : isWrong ? '#f5c4c426' : '#a7f6d326')};
  border-radius: 8px;
  min-height: 150px;
  word-break: normal;
`,
  QuestionTitle: styled.div`
    word-break: normal;
  `,
  QuestionNo: styled.span`
    font-weight: 600;
  `,
  RadioGroupContainer: styled(RadioGroup)`
    margin-left: 12px;
  `,
  FormControlLabelContainer: styled.div`
    display: flex;
    align-items: center;
  `,
  InputTextContainer: styled.div`
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px
  `,
  InputText: styled(InputBase)`
    background: #white;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 0 6px;
  `,
  CheckedIcon: styled(CheckIcon)`
    color: green;
  `,
  ClosedIcon: styled(CloseIcon)`
    color: red;
  `,
  MultiChoiceContainer: styled.div`
    display: flex;
    align-items: center;
  `,
  ShowIcon: styled.div`
    display: flex;
    aligh-items: center;
    margin-left: 4px;
  `,
  MultiChoiceLabel: styled.span<{ disabled?: boolean }>`
    color: ${({ disabled }) => (disabled ? 'rgba(0, 0, 0, 0.38)' : '')};
  `,
  QuestionExplanation: styled.div`
  word-break: normal;
  `,
  QuestionExplanationTitle: styled.div`
  word-break: normal;
  font-weight: bold;
  margin-top: 10px;
  `,
  QuestionAnswer: styled.div`
  word-break: normal;
  margin-top: 30px;
  font-weight: bold;
  `
}

export default Styled
