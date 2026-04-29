/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/prop-types */
import React, { ReactElement, useRef } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import styled from '@emotion/styled'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'services/styled-themes'

const TopCategoryGrid = (): ReactElement => {
  const { theme } = useTheme()
  const sliderRef = useRef<Slider>(null)
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  }
  const next = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext()
    }
  }
  const { t } = useTranslation()

  const StyledSlider = styled(Slider)`
  .slick-dots li {
    margin: 0 10px;
    transition: margin 0.3s ease;
  
    @media (max-width: 600px) {
      margin: 0 5px;
    }
  }
  
  .slick-dots li button:before {
    font-size: 20px; 
    color: #ff5364; 
    border-radius: 50%; 
    transition: all 0.3s ease;
  }

  // Add these to hide the next and previous buttons
  .slick-next,
  .slick-prev {
    display: none !important;
  }
`
  return (
        <React.Fragment>
            {/* bg-custom-background-category-dark */}
            <div
                className={`w-full justify-center py-5 flex ${theme === 'light' ? 'bg-custom-background-category' : 'bg-custom-background-category shadow-shadow-cate shadow-2xl p-8 rounded-2xl'}`}
            >
                <div className='w-4/5'>
                    <p className='font-bold text-2xl text-shadow-lg'>{t('homepage.topCategories')}</p>
                    <div className='sm:grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-4 mt-8 sm:mt-4 hidden'>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate1.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.itandSoftware')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate8.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.music')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate2.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.photography')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate3.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.bussiness')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate4.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.code')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate5.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.analyst')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate6.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.development')}</div>
                        </div>
                        <div>
                            <div className='justify-center items-center flex'><img src='/assets/images/homePage/cate7.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                            <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                {t('homepage.design')}</div>
                        </div>
                    </div>
                    <div className='sm:hidden flex flex-col justify-center items-center'>
                        <StyledSlider ref={sliderRef} {...settings} className='w-4/5'>
                            <div>
                                <div className='flex flex-col items-center'>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate1.png'className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.itandSoftware')}</div>
                                </div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate8.png'className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.music')}</div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate2.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.photography')}</div>
                                </div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate3.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.bussiness')}</div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate4.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.development')}</div>
                                </div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate5.png'className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.marketing')}</div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate6.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.analyst')}</div>
                                </div>
                                <div>
                                    <div className='justify-center items-center flex mt-12'><img src='/assets/images/homePage/cate7.png' className='rounded-3xl w-72 h-72 transition-transform duration-500 hover:-translate-y-4' /></div>
                                    <div className={`text-center mt-5 font-bold ${theme === 'dark' ? 'text-cate-text-dark' : ''}`}>
                                        {t('homepage.design')}</div>
                                </div>
                            </div>
                        </StyledSlider>
                        <button className='rounded-full bg-gray-200 mt-10 p-2 text-lg' onClick={next}><ArrowForwardIcon fontSize='large' /></button>
                    </div>
                </div>
            </div>
        </React.Fragment>
  )
}

export default TopCategoryGrid
