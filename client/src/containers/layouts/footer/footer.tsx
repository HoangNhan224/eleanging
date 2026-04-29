/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* LAYOUT FOOTER COMPONENT
   ========================================================================== */

import React from 'react'
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined'
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { useTranslation } from 'react-i18next'
/**
 * Footer component displays the footer section of the application.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered Footer component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 */
const Footer = () => {
  const { t } = useTranslation()
  return (
    <div className='bg-neutral-800 text-white'>
      <div className="container mx-auto px-4 sm:grid flex flex-col sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">

        <div className="col-span-1 flex items-center justify-center">
          <img src='/assets/images/footer/logo_sorimachi.svg' alt="Sorimachi"/>
        </div>

        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('footer.contact_with_us')}</h2>
          <address className="not-italic mb-4 font-semibold cursor-pointer flex items-center">
            <PlaceOutlinedIcon className='mr-2' />{t('footer.address')}
          </address>
          <p className="mb-2 font-semibold cursor-pointer flex items-center"><LocalPhoneOutlinedIcon className='mr-2' />+84-(0)28-3849-5557</p>
          <p>
            <a href="mailto:hotro@sorimachigroup.vn" className="hover:underline font-semibold cursor-pointer flex items-center">
              <LocalPostOfficeOutlinedIcon className='mr-2' />hotro@sorimachigroup.vn
            </a>
          </p>
        </div>

        <div className="col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('footer.missions')}</h2>
          <p className="mb-4 italic">{t('footer.introduction')}</p>
        </div>
      </div>

      <div className="text-center mt-8 border-t border-white pt-4 pb-4 mx-4 lg:mx-28">
        SORIMACHI VIET NAM &copy; {new Date().getFullYear()} All Rights Reserved.
      </div>
    </div>
  )
}

export default Footer
