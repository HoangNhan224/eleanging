import React, { ReactElement } from 'react'

import { useTranslation } from 'react-i18next'
// import AppImage18 from '../../../../assets/osyaberi_man.png'
// import AppImage19 from '../../../../assets/osyaberi_man.png'
// import AppImage20 from '../../../../assets/osyaberi_man.png'

const TrendingCard = (): ReactElement => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      {/* Card 1 */}
      <div className="relative col-span-full sm:col-span-6 xl:col-span-3 bg-white shadow-lg rounded-sm border border-slate-200 overflow-hidden">
        {/* Image */}
        <img className="absolute w-full h-full object-cover" src='/assets/images/homePage/osyaberi_man.png' width="286" height="160" alt="Application 17" />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent" aria-hidden="true"></div>
        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-end">
          <h3 className="text-lg text-white font-semibold mt-16 mb-0.5">{t('homepage.merchandise')}</h3>
          <a className="text-sm font-medium text-indigo-400 hover:text-indigo-300" href="#0">{t('homepage.exploreCard')} -&gt;</a>
        </div>
      </div>

      {/* Card 2 */}
      <div className="relative col-span-full sm:col-span-6 xl:col-span-3 bg-white shadow-lg rounded-sm border border-slate-200 overflow-hidden">
        {/* Image */}
        <img className="absolute w-full h-full object-cover" src='/assets/images/homePage/osyaberi_man.png' width="286" height="160" alt="Application 18" />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent" aria-hidden="true"></div>
        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-end">
          <h3 className="text-lg text-white font-semibold mt-16 mb-0.5">{t('homepage.audiobooks')}</h3>
          <a className="text-sm font-medium text-indigo-400 hover:text-indigo-300" href="#0">{t('homepage.exploreCard')} -&gt;</a>
        </div>
      </div>

      {/* Card 3 */}
      <div className="relative col-span-full sm:col-span-6 xl:col-span-3 bg-white shadow-lg rounded-sm border border-slate-200 overflow-hidden">
        {/* Image */}
        <img className="absolute w-full h-full object-cover" src='/assets/images/homePage/osyaberi_man.png' width="286" height="160" alt="Application 19" />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent" aria-hidden="true"></div>
        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-end">
          <h3 className="text-lg text-white font-semibold mt-16 mb-0.5">{t('homepage.designTech')}</h3>
          <a className="text-sm font-medium text-indigo-400 hover:text-indigo-300" href="#0">{t('homepage.exploreCard')} -&gt;</a>
        </div>
      </div>

      {/* Card 4 */}
      <div className="relative col-span-full sm:col-span-6 xl:col-span-3 bg-white shadow-lg rounded-sm border border-slate-200 overflow-hidden">
        {/* Image */}
        <img className="absolute w-full h-full object-cover" src='/assets/images/homePage/osyaberi_man.png' width="286" height="160" alt="Application 20" />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent" aria-hidden="true"></div>
        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-end">
          <h3 className="text-lg text-white font-semibold mt-16 mb-0.5">{t('homepage.appsSoftware')}</h3>
          <a className="text-sm font-medium text-indigo-400 hover:text-indigo-300" href="#0">{t('homepage.exploreCard')} -&gt;</a>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TrendingCard
