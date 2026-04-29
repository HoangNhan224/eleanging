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
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { Document, Page } from 'react-pdf'
import YouTube from 'react-youtube'
import { toast } from 'react-toastify'

interface LessonProps {
  lesson: {
    id: string
    name: string
    type: string
    locationPath: string
    allowDownload?: boolean
    description: string
    content: string
    updatedAt: string
  }
  lession: any
  pdfContainerRef: React.RefObject<HTMLDivElement>
  isVideoError: boolean
  setIsVideoError: React.Dispatch<React.SetStateAction<boolean>>
  isCommentModalOpen: boolean
  numPages: number
  setNumPages: React.Dispatch<React.SetStateAction<number>>
  formattedDate: string
  opts: {
    height: string
    width: string
    playerVars: {
      autoplay: number
      controls: number
      rel: number
      showinfo: number
      mute: number
      loop: number
    }
  }
  playVideo: (e: any) => void
  onStateChange: (e: any) => void
  getPdfFilePath: (path: string) => Promise<string | null>
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void
  getPageWidth: () => number

  // Tracking progress props
  watchRef: React.MutableRefObject<boolean>
  tt: React.MutableRefObject<any>
  courseProgress: any[]
  addProgress: (payload: any) => Promise<any>
  setCourseProgress: (progress: any[]) => void

  // Optional props for advanced functionality
  enrollData?: any
  courseData?: any
  userId?: string | number
  dispatch?: any
  lessions?: any[]
  markCourseAsDone?: (data: any) => Promise<any>
  createNotification?: (data: any) => Promise<any>
  addNotification?: (data: any) => void
  loadingPDF?: boolean
  pdfPath?: string | null
}

const Lesson: React.FC<LessonProps> = ({
  lesson,
  lession,
  pdfContainerRef,
  isVideoError,
  setIsVideoError,
  isCommentModalOpen,
  numPages,
  setNumPages,
  formattedDate,
  opts,
  playVideo,
  onStateChange,
  getPdfFilePath,
  onDocumentLoadSuccess,
  getPageWidth,
  watchRef,
  tt,
  courseProgress,
  addProgress,
  setCourseProgress,
  enrollData,
  courseData,
  userId,
  dispatch,
  lessions,
  markCourseAsDone,
  createNotification,
  addNotification,
  loadingPDF,
  pdfPath
}) => {
  const { t } = useTranslation()
  const canDownloadDocument =
        lession?.type === 'PDF' &&
        Boolean(lession?.allowDownload) &&
        Boolean(lession?.locationPath)

  const handleDownloadDocument = async () => {
    if (!canDownloadDocument) {
      toast.error(t('learning.download_not_available'))
      return
    }

    const encodedFileName = encodeURIComponent(lession.locationPath)
    const fileUrl = `${process.env.REACT_APP_API}/uploads/lessions/${encodedFileName}`

    try {
      const response = await axios.get(fileUrl, { responseType: 'blob' })
      const blob = response.data
      const objectUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = lession.locationPath
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      toast.error(t('learning.error_pdf'))
    }
    console.log('PDF PATH:', pdfPath)
    console.log('LESSON:', lession)
  }

  return (
        <div ref={pdfContainerRef} className='md:overflow-y-auto custom-scrollbar h-full lg:h-lvh' style={{ height: 'calc(100vh - 8rem)', overflowY: 'scroll' }}>
            <div className='w-full object-cover xl:mb-24 mb-4'>
                <div>
                    {lession.type === 'MP4'
                      ? (
                            <div>
                                {isVideoError
                                  ? (
                                        <div className="flex justify-center items-center rounded-2xl bg-red-100 border border-red-300 shadow-lg h-[300px] sm:h-[500px] md:h-[600px] xl:h-[620px] 2xl:h-[700px]">
                                            <span className="text-red-600 font-semibold text-lg">
                                                {t('learning.please_log_in_provided_account')}
                                            </span>
                                        </div>
                                    )
                                  : (
                                        <div className="rounded-2xl overflow-hidden shadow-lg h-[300px] sm:h-[500px] md:h-[600px] xl:h-[620px] 2xl:h-[700px]">
                                            <YouTube
                                                videoId={lession.locationPath}
                                                opts={{ ...opts, width: '100%', height: '100%' }}
                                                className="w-full h-full"
                                                onPlay={(e: any) => playVideo(e)}
                                                onStateChange={onStateChange}
                                                onError={(e: any) => {
                                                  if (e.data === 150) {
                                                    // toast.error(t('learning.video_is_not_available'))
                                                    setIsVideoError(true)
                                                  }
                                                }}
                                            />
                                        </div>
                                    )}
                            </div>
                        )
                      : (
                            <div className=''>
                                <div className='lg:pt-14 pt-8 w-full justify-center items-center flex'>
                                    <div className='xl:w-11/12 lg:w-4/5 md:w-4/5 w-full border-b border-gray-200 pb-5 px-2'>
                                        <div className='text-3xl font-bold'>{lession.name}</div>
                                        <div className='mt-3 flex items-center justify-between'>
                                          <span>{t('learning.updated_at')} {formattedDate}</span>
                                          {canDownloadDocument && (
                                            <button
                                              type="button"
                                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors duration-200 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
                                              onClick={handleDownloadDocument}
                                            >
                                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 10.586V3a1 1 0 011-1z" clipRule="evenodd" />
                                                <path d="M3 14a1 1 0 011 1v1h12v-1a1 1 0 112 0v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 011-1z" />
                                              </svg>
                                              <span>{t('learning.download_document')}</span>
                                            </button>
                                          )}
                                        </div>
                                        <div className='font-bold mt-3'>{lession.description}</div>
                                        {/* <div className='mt-3'>{t('learning.description')}</div> */}
                                        <div className='font-bold mt-3'>{lession.content}</div>

                                    </div>
                                </div>
                                <div className="flex items-center justify-center w-full h-auto lg:mb-36 mb-0">
                                    
                                    {lession.type === 'PDF' && (
                                      <>
                                        {loadingPDF && (
                                          <div>{t('learning.loading_document')}</div>
                                        )}

                                        {!loadingPDF && pdfPath && (
                                          <Document
                                            className={isCommentModalOpen ? 'pdf-opacity' : ''}
                                            file={pdfPath}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                          >
                                            {Array.from(new Array(numPages), (_, index) => (
                                              <Page
                                                key={index}
                                                pageNumber={index + 1}
                                                width={getPageWidth()}
                                                className="pdf-page"
                                                renderMode="canvas"
                                              />
                                            ))}
                                                  </Document>
                                        )}
                                        {!loadingPDF && !pdfPath && (
                                          <div className="text-red-500 text-lg font-semibold py-8">
                                            Không load được PDF
                                          </div>
                                        )}
                                      </>
                                    )}    
                                </div>
                            </div>
                        )}
                      {lession.type === 'MP4' &&
                          (
                              <div className='sm:h-[250px] h-full w-full'>
                                  <div className='md:pt-8 md:pl-20 sm:mt-7 sm:pl-10 pt-4 pl-4 w-11/12 lg:pr-16'>
                                      <div className='text-lg sm:text-2xl lg:text-3xl font-bold'>{lession.name}</div>
                                      <div className='md:mt-3 mt-1 sm:mt-2 sm:text-balance text-sm'>{t('learning.updated_at')} {formattedDate}</div>
                                      <div className='font-bold md:mt-3 sm:mt-2 mt-1'>{lession.description}</div>
                                      <div className='md:mt-3 sm:mt-2 mt-1'>{t('learning.description')}</div>
                                  </div>
                              </div>
                          )}
                </div>
            </div>
        </div>
  )
}

export default Lesson
