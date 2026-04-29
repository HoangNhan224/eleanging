/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import styled from '@emotion/styled'
import { useTheme } from 'services/styled-themes'

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
  border-radius: 50%; 
  transition: all 0.3s ease;
  color: gray; /* Màu mặc định của chấm tròn */
}

.slick-dots li button:hover:before,
.slick-dots li.slick-active button:before {
  transform: scaleX(2.0);
   color: lightgreen;

}

.slick-dots li:hover {
  margin: 0 20px;

  @media (max-width: 600px) {
    margin: 0 10px;
  }
}

@media (max-width: 768px) {
  .slick-prev:before, 
  .slick-next:before {
    color: gray;
    font-size: 30px;
  }
  .slick-prev {
    left: -30px;
  }
  .slick-next {
    right: -30px;
  }
}
`
function UnevenSetsInfinite () {
  const { theme } = useTheme()
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,

    slidesToScroll: 2,
    slidesToShow: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false
          // arrows: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false
        }
      }
    ]
  }
  return (
    <div className="w-full h-96">
      <StyledSlider {...settings} arrows={true} className='w-full'>
        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
            <div className={`flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-300'} hover:bg-cyan-950 transition-colors duration-500 hover:text-white`}>
              <img src='/assets/images/homePage/icon1.png' className='w-2/5 h-32' />
              <div className='font-bold text-center mt-4 w-1/3'>Docker Development</div>
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
          <div className={`flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-300'} hover:bg-cyan-950 transition-colors duration-500 hover:text-white`}>
          <img src='/assets/images/homePage/icon2.png' className='w-2/5 h-32' />
              <div className='font-bold text-center mt-4 w-1/3'>NodeJS Frontend</div>
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
          <div className={`flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-300'} hover:bg-cyan-950 transition-colors duration-500 hover:text-white`}>
          <img src='/assets/images/homePage/icon3.png' className='w-2/5 h-32' />
              <div className='font-bold text-center mt-4 w-1/3'>Angular Development</div>
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
          <div className={`flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-300'} hover:bg-cyan-950 transition-colors duration-500 hover:text-white`}>
          <img src='/assets/images/homePage/icon4.png' className='w-2/5 h-32' />
              <div className='font-bold text-center mt-4 w-1/3'>React Native</div>
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
          <div className={`flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-300'} hover:bg-cyan-950 transition-colors duration-500 hover:text-white`}>
          <img src='/assets/images/homePage/icon5.png' className='w-2/5 h-32' />
              <div className='font-bold text-center mt-4 w-1/3'>Python Development</div>
            </div>
          </div>
        </div>

        <div className='slide-item flex items-center justify-center flex-col'>
          <div className='flex items-center justify-center w-full h-96 rounded-3x'>
          <div className={`flex flex-col items-center justify-center w-10/12 h-72 rounded-3xl border-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-300'} hover:bg-cyan-950 transition-colors duration-500 hover:text-white`}>
          <img src='/assets/images/homePage/icon6.png' className='w-2/5 h-32' />
              <div className='font-bold text-center mt-4 w-1/3'>Swift Development</div>
            </div>
          </div>
        </div>
      </StyledSlider>
    </div>
  )
}

export default UnevenSetsInfinite
