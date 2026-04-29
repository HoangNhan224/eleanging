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
    max-width: fit-content;
    min-height: 200px;  
`,
  ModalTitle: styled.div`
    font-weight: bold;
    font-size: 28px;
    text-align: center;
    word-break: break-word
`,
  ModalDescription: styled.div`
    margin-top: 12px;
    margin-left: auto;
    margin-right: auto;
    font-size: 16px;
    text-align: center;
    word-break: break-word;
    width: 300px;
`,
  ButtonContainer: styled.div`
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 16px;
    width: 100%;
  `,
  CancelButton: styled.button`
    flex: 1;
    outline: none;
    border: none;
    padding: 10px 20px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid #ff7875;
    border-radius: 8px;
    width: 50%;
  `,
  OKButton: styled.button`
    flex: 1;
    outline: none;
    border: none;
    padding: 10px 20px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    border-radius: 8px;
    width: 50%;
  `
}

export default Styled
