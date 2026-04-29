import styled from 'styled-components'

const Styled = {
  CloseButton: styled.div`
    position: absolute;
    cursor: pointer;
    top: 10px;
    right: 10px;
    &:hover {
        color: grey;
    }
 `,
  ModalContainer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
`,
  ModalChildren: styled.div`
  position: relative;
  background: white;
  padding: 32px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 250px; // Adjust this to make the modal narrower
  min-height: 150px; // Adjust this to make the modal shorter
`,
  ModalTitle: styled.div`
    font-weight: bold;
    font-size: 28px;
    text-align: center;
    word-break: break-word
`,
  ModalDescription: styled.div`
    margin-top: 12px;
    font-size: 16px;
    text-align: center;
    word-break: break-word;
`,
  CancelButton: styled.button`
    margin-top: 4px;
    outline: none;
    width: 100%;
    border: none;
    cursor: pointer;
    background-color: #ff5858;
    border-radius: 8px;
    &:hover {
        background-color: #d1061e;
    }
    height: 40px;
  `,
  OKButton: styled.button`
    margin-top: 10px;
    outline: none;
    border: none;
    width: 100%;
    color: white;
    height: 40px;
    cursor: pointer;
    background-color: #42f572;
    border-radius: 8px;
    &:hover {
        background-color: #30d95d;
    }
  `
}

export default Styled
