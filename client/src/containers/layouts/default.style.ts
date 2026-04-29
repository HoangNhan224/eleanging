/* LAYOUT DEFAULT COMPONENT STYLES
========================================================================== */

import styled from 'styled-components'

const Styled = {
  Content: styled.div`
    display: flex;
  `,
  Main: styled.main`
    width: 100%;
    background-color: ${({ theme }) => theme.colors.body};
    color: ${({ theme }) => theme.colors.text};
  `
}

export default Styled
