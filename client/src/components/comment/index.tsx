/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface Props {
  comment: {
    name: string
    content: string
  }
}
const Comment = ({
  comment
}: Props) => {
  const [isReact, setIsReact] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()
  const handleMouseEnter = () => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
    }
    setIsReact(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsReact(false)
    }, 1000)
  }
  return (
    <div className='flex mb-4 py-4'>
      <img src="https://picsum.photos/200/300" alt='avt' className='w-10 h-10 object-cover rounded-full mr-5'></img>
      <div className='w-3/5'>
        <div className='rounded-2xl bg-gray-300 p-3 break-words inline-block'>
          <h3 className='font-bold'>{comment.name}</h3>
          <p className='mt-1'>{comment.content}</p>
        </div>
        <div />
        <div className='relative mt-2'>
          <div className='p-1 flex'>
            <div className='text-blue-600 cursor-pointer hover:underline text-sm font-thin'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {t('comment.like')}</div>
            <div className='mx-1'>·</div>
            <div className='text-blue-600 cursor-pointer hover:underline text-sm'>{t('comment.reply')}</div>
            <div className='mx-1'>·</div>
            <div className='text-sm text-gray-500'>{t('comment.months_ago', { count: 6 })}</div>
          </div>
          {isReact && (
            <div className='absolute -top-12 -left-8 transform p-2 bg-white rounded-3xl shadow-lg inline-block'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
              <div className='flex'>
                <div className='relative mr-4 transform transition-all duration-200 hover:scale-150 hover:-translate-y-2 cursor-pointer w-8 h-8' title="Like">
                  <img className='absolute w-full h-full' src='/assets/images/learning/like2.png' alt="Like Icon" />
                  <img className='absolute w-full h-full opacity-0 hover:opacity-100' src='/assets/images/learning/like.gif' alt="Like Icon Gif" />
                </div>
                <div className='relative mr-4 transform transition-all duration-200 hover:scale-150 hover:-translate-y-2 cursor-pointer w-8 h-8' title="Love">
                  <img className='absolute w-full h-full' src='/assets/images/learning/love2.png' alt="Love Icon" />
                  <img className='absolute w-full h-full opacity-0 hover:opacity-100' src='/assets/images/learning/love.gif' alt="Love Icon Gif" />
                </div>
                <div className='relative mr-4 transform transition-all duration-200 hover:scale-150 hover:-translate-y-2 cursor-pointer w-8 h-8' title="Haha">
                  <img className='absolute w-full h-full' src='/assets/images/learning/haha2.png' alt="Haha Icon" />
                  <img className='absolute w-full h-full opacity-0 hover:opacity-100' src='/assets/images/learning/haha.gif' alt="Haha Icon Gif" />
                </div>
                <div className='relative mr-4 transform transition-all duration-200 hover:scale-150 hover:-translate-y-2 cursor-pointer w-8 h-8' title="Wow">
                  <img className='absolute w-full h-full' src='/assets/images/learning/wow2.png' alt="Wow Icon" />
                  <img className='absolute w-full h-full opacity-0 hover:opacity-100' src='/assets/images/learning/wow.gif' alt="Wow Icon Gif" />
                </div>
                <div className='relative mr-4 transform transition-all duration-200 hover:scale-150 hover:-translate-y-2 cursor-pointer w-8 h-8' title="Sad">
                  <img className='absolute w-full h-full' src='/assets/images/learning/sad2.png' alt="Sad Icon" />
                  <img className='absolute w-full h-full opacity-0 hover:opacity-100' src='/assets/images/learning/sad.gif' alt="Sad Icon Gif" />
                </div>
                <div className='relative transform transition-all duration-200 hover:scale-150 hover:-translate-y-2 cursor-pointer w-8 h-8' title="Angry">
                  <img className='absolute w-full h-full' src='/assets/images/learning/angry2.png' alt="Angry Icon" />
                  <img className='absolute w-full h-full opacity-0 hover:opacity-100' src='/assets/images/learning/angry.gif' alt="Angry Icon Gif" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Comment
