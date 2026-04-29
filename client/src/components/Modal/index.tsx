/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import Modal from '@mui/material/Modal'
import Styled from './index.style'
import Close from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress' // Import component for loading indicator
import { useTranslation } from 'react-i18next'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  onClose?: () => void
  onOk?: () => void
  onCancel?: () => void
  cancelText?: string
  okText?: string
  children?: React.ReactNode
  imageUrl?: string
  loading?: boolean
}
const ModalComponent = ({
  isOpen,
  title,
  description,
  onClose,
  onOk,
  onCancel,
  cancelText = 'Cancel',
  okText = 'OK',
  children,
  imageUrl,
  loading = false
}: Props) => {
  const { t } = useTranslation()
  return (
    <Modal open={isOpen}>
      <Styled.ModalContainer>
        <Styled.ModalChildren>
          <Styled.CloseButton onClick={onClose}>
            <Close />
          </Styled.CloseButton>
          <Styled.ModalTitle>{title}</Styled.ModalTitle>
          {(imageUrl != null) &&
            <div className="flex items-center justify-center">
              <img className="w-24 h-24 object-cover" src={imageUrl} alt={title} />
            </div>
          }
          <Styled.ModalDescription>{description}</Styled.ModalDescription>
          <Styled.ModalDescription>{children}</Styled.ModalDescription>
          <Styled.ButtonContainer>
            <Styled.OKButton onClick={onOk} disabled={loading} className='bg-custom-button-enroll hover:bg-custom-button-enroll-hover'>
              {loading ? <CircularProgress size={24} /> : t('modal.continue')}
            </Styled.OKButton>
            <Styled.CancelButton onClick={onCancel} className='bg-red-400 hover:bg-red-500'>
              {t('modal.cancel')}
            </Styled.CancelButton>
          </Styled.ButtonContainer>
        </Styled.ModalChildren>
      </Styled.ModalContainer>
    </Modal>
  )
}

export default ModalComponent
