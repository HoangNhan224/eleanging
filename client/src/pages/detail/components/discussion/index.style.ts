import styled from 'styled-components'
interface PropsBorderTree {
  index: number
}
interface PropsSingleComment {
  isEnd: boolean
}
const Styled = {
  DiscussionContainer: styled.div`
    margin: 0 auto 20px;
    padding: 20px;
    word-break: normal;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  `,
  FeadbackContainer: styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px
  `,
  SendFeadbackTitle: styled.div`
    font-weight: bold;
  `,
  SingleComment: styled.div<PropsSingleComment>`
    display: flex; 
    justify-content: start;
    algin-items: center;
    gap: 10px;
    border-left: ${({ isEnd }) => (isEnd ? '2px solid transparent' : '2px solid gray')};
  `,
  Container: styled.div`
    border-radius: 15px;
    background-color: rgb(163 163 163);
    padding: 10px;
  `,
  ContainerTree: styled.div`
    position: relative;
    padding-left: 15px;
  `,
  BorderTree: styled.div<PropsBorderTree>`
    width: 12px;
    height: ${({ index }) => (index === 0 ? '50%' : '80%')};
    position: absolute;
    bottom: 50%;
    left: -2px;
    border-bottom-left-radius: 10px;
    border-left: 2px solid gray;
    border-bottom: 2px solid gray;
  `,
  CommentContainer: styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `,
  DiscussionTitle: styled.div`
    word-break: normal;
    text-transform: capitalize;
    font-weight: bold;
  `,
  DiscussionContent: styled.div`
    word-break: normal;
  `
}

export default Styled
