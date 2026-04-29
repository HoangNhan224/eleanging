/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable multiline-ternary */
/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import axios from 'axios'
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable-next-line no-trailing-spaces */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/comma-dangle */
import React from 'react'
import { useTranslation } from 'react-i18next'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import Tooltip from '@mui/material/Tooltip'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
interface LessonControlProps {
  lession: any
  theme: string
  isExamActive: boolean
  handlePreviousClick: () => void
  handleNextClick: () => void
  isExpanded: boolean
  handleExpandClick: () => void
}
const LessonControl: React.FC<LessonControlProps> = ({
  lession,
  theme,
  isExamActive,
  handlePreviousClick,
  handleNextClick,
  isExpanded,
  handleExpandClick
}) => {
  const { t } = useTranslation()

  return (
        <div className={`w-full bottom-0 h-14 shadow-sm fixed left-0 z-50 ${theme === 'dark' ? 'bg-custom-control-learning' : 'bg-gray-200'}`}>
            <div className="overflow-auto h-full flex justify-center items-center px-4">
                {!isExamActive && (
                    <div className='flex justify-between'>
                        <div
                            className={`border border-transparent p-2 font-bold rounded-lg cursor-pointer hover:opacity-80 select-none lg:text-sm text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-black'
                                }`}
                            onClick={handlePreviousClick}
                        >
                            <ArrowBackIosIcon /> {t('learning.previous')}
                        </div>
                        <Tooltip title={<span className="lg:text-sm text-xs text-white">{t('learning.shortcut')}</span>} placement="top" arrow>
                            <div
                                className='border-2 border-green-500 text-green-500 p-2 font-bold rounded-lg cursor-pointer ml-4 hover:border-green-400 hover:bg-green-400 hover:text-white select-none lg:text-sm text-xs transition duration-500'
                                onClick={handleNextClick}
                            >
                                {t('learning.next')} <ArrowForwardIosIcon />
                            </div>
                        </Tooltip>
                    </div>
                )}
                <div className='flex items-center justify-center absolute right-2'>
                    {!isExamActive && (
                        <div className='font-bold lg:text-xs xl:text-sm lg:block hidden'>{lession.order}. {lession.name}</div>
                    )}
                    <div className='lg:flex hidden items-center rounded-full bg-white text-black w-9 h-9 ml-5 justify-center cursor-pointer' onClick={handleExpandClick}>
                        {isExpanded ? <MenuIcon fontSize="medium" /> : <ArrowForwardIcon fontSize="medium" />}
                    </div>
                </div>
            </div>
        </div>
  )
}

export default LessonControl
