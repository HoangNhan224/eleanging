/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import React, { useEffect, useState } from 'react'
import { getBannerTopScore } from 'api/post/post.api'
import { useTranslation } from 'react-i18next'

interface IUser {
  userId: number
  email: string
  topScore: number | string
  sourceName?: string
}

const Banner = () => {
  const [users, setUsers] = useState<IUser[]>([])
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await getBannerTopScore()
        setUsers(res.data.topUsers || [])
      } catch (error: any) {
        const msg = error?.message ?? error?.error ?? JSON.stringify(error)
        console.error('Load banner error:', msg)
      }
    }

    fetchTopUsers()
  }, [])
  const { t } = useTranslation()
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes banner-marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }

      .banner-marquee {
        animation: banner-marquee 20s linear infinite;
      }

      .banner-marquee:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (users.length === 0) return null

  return (
    <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-md overflow-hidden">
      <div className="px-4 sm:px-10 lg:px-10 py-2 max-w-9xl mx-auto">
        <div className="flex whitespace-nowrap banner-marquee text-base font-medium text-white">
          {[...Array(3)].map((_, idx) => (
            <span key={idx} className="mr-20 flex items-center">
              🏆{' '}
              <span className="ml-2 font-semibold">
                {t('banner_user.title')}:
              </span>
              {users[0]?.sourceName && (
                <span className="ml-2 text-white font-semibold">
                  {users[0].sourceName}
                </span>
              )}
              {users.map((u, i) => (
                <span
                  key={`${u.userId}-${i}`}
                  className="ml-3 font-bold text-yellow-200"
                >
                  {u.email} – {u.topScore} {t('banner_user.score')}
                  {i < users.length - 1 && ' • '}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Banner
