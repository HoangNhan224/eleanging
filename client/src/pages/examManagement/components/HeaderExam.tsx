/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// HeaderComponent.tsx
import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface HeaderComponentProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

/**
 * Header component for exam management pages.
 * @author Hien
 * @param {object} props - The component's props.
 * @param {string} props.activeTab - The name of the currently active tab.
 * @param {function} props.onTabChange - Callback function to change the active tab.
 * @returns {JSX.Element} The rendered header component.
 */

const HeaderComponent: React.FC<HeaderComponentProps> = ({ activeTab, onTabChange }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize the navigate hook
  const navigate = useNavigate()
  // TODO: Define the tabs for the header
  const tabs = [
    { label: t('exam_admin.header.exam_info'), value: 'basic' },
    { label: t('exam_admin.header.exam_question'), value: 'compose' },
    { label: t('exam_admin.header.exam_setting'), value: 'advanced' },
    { label: t('exam_admin.header.exam_statistic'), value: 'statistics' }
  ]

  /**
     * Handles the back button click.
     * @author Hien
     */
  const handleBack = () => {
    navigate('/exam-management')
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#f5f5f5', color: '#333', boxShadow: 'none' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              sx={{
                color: '#333',
                textTransform: 'none',
                fontWeight: activeTab === tab.value ? 'bold' : 'normal',
                padding: '8px 16px',
                borderRadius: 0,
                borderBottom: activeTab === tab.value ? '2px solid #3b82f6' : 'none',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Typography variant="body1">{tab.label}</Typography>
            </Button>
          ))}
        </Box>

        <Box>
           <button
               onClick={() => navigate(-1)}
               className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
               {t('exam_admin.header.back')}
            </button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderComponent
