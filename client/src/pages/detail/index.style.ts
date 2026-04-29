import styled from 'styled-components'
import { device } from '../../assets/responsives/divice'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
interface Props {
  isWrong: boolean
  isModeView: boolean
  isSelect: boolean
}

const Styled = {
  DetailContainer: styled.div`
    width: 80%;
    margin: auto;
    padding: 50px 0;
  `,
  FormContainer: styled.form`
    width: 60%;
    margin: auto;
    padding: 50px 0;
  `,
  TestName: styled.div`
    font-size: 26px;
    font-weight: bold;
  `,
  TestStatus: styled.div`
    font-size: 20px;
    font-weight: bold;
  `,
  TestDescription: styled.div`
    font-size: 18px;
    // margin: 8px auto;
    // white-space: pre;
    word-break: break-word;
  `,
  ButtonContainer: styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
  `,
  SubmitButton: styled.button`
    width: 120px;
    height: 50px;
    border: 2px solid white;
    background-color: #ff5858;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      background-color: #d14545;
    }
  `,
  RetestButton: styled.button`
    width: 120px;
    height: 50px;
    border: 2px solid white;
    background-color: #5878ff;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      background-color: #4760cb;
    }
  `,
  Score: styled.div`
    font-weight: bold;
    color: black;
    margin: 10px 10px 10px 10px;
  `,
  BackButton: styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
    background-color: #ff5858;
    margin-bottom: 12px;
    border-radius: 8px;
    height: 30px;
    color: white;
    &:hover {
      background-color: #d14545;
    }
    border: none;
    cursor: pointer;
    p {
      margin-left: 6px;
    }
  `,
  HeaderDetail: styled.div`
    background-color: #00a6d8;
    width: 100%;
    position: sticky;
    top: 50px;
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;
    flex-wrap: wrap;
    margin: 0 0 10px 0;
    z-index: 10;
    color: white;
  `,
  FooterDetail: styled.div`
    background-color: #00a6d8;
    width: 100%;
    position: sticky;
    bottom: 0px;
    padding: 5px;
  `,
  TestContainer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    
    @media only screen and ${device.desktop} {
      width: 50%;
    }

    @media only screen and ${device.laptopL} {
      width: 100%;
    }
  `,
  NumberTestContainer: styled.div`
    @media only screen and ${device.desktop} {
      position: fixed;
      right: 10px;
      top: 100px;
      width: 290px;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    @media only screen and ${device.laptopL} {
      position: fixed;
      right: 10px;
      top: 100px;
      width: 230px;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    grid-gap: 5px;
    padding: 10px;
    border: 3px solid gray;
    border-radius: 5px;
  `,
  NumberTestBox: styled.div<Props>`
    height: 60px;
    cursor: pointer;
    display: grid;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    border: ${({ isModeView, isWrong, isSelect }) => (isModeView ? (isWrong ? '2px solid green' : '2px solid red') : (isSelect ? '2px solid black' : '2px solid gray'))};
    background-color: ${({ isWrong, isModeView, isSelect }) => (isModeView ? (isWrong ? '#a7f6d326' : '#f5c4c426') : (isSelect ? 'rgb(254 243 199)' : ''))};
    border-radius: 5px;
    text-transform: capitalize;
  `,
  CheckedIcon: styled(CheckIcon)`
    color: green;
  `,
  ClosedIcon: styled(CloseIcon)`
    color: red;
  `,
  NumberTestBoxHeader: styled.div`
    grid-row: span 1 / span 1;
    border-bottom: 1px solid black;
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
  `,
  NumberTestBoxBody: styled.div`
    grid-row: span 2 / span 2;
    display: flex;
    align-items: center;
    justify-content: center;
  `
}

export default Styled
