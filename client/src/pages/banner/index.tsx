/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect } from 'react'
import { getCourseExamList, getGroupExamList, saveBanner, getActiveBanner } from 'api/post/post.api'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

export interface IExam {
  id: string
  name: string
  courseId?: string
  groupId?: string
  attempt?: number
  exitTime?: string
  score?: number
  pointToPass?: number
}

export interface IBannerConfig {
  type: 'course' | 'group'
  examId: string
  topCount: number
}
type FilterOption = 'COURSE' | 'GROUP'

interface OptionType {
  value: FilterOption
  label: string
}
const options: OptionType[] = [
  { value: 'COURSE', label: 'Dành cho khóa học' },
  { value: 'GROUP', label: 'Dành cho nhóm' }
]
interface ExamOption {
  value: string
  label: string
}

const BannerPage = () => {
  const [type, setType] = useState<'course' | 'group'>('course')
  const [examId, setExamId] = useState<string | null>(null)
  const [topCount, setTopCount] = useState<number>(3)
  const [exams, setExams] = useState<IExam[]>([])
  const [loading, setLoading] = useState(false)
  const [filterOption, setFilterOption] = useState<FilterOption>('COURSE')
  const { t } = useTranslation()

  const fetchExamsByType = async (examType: 'course' | 'group'): Promise<IExam[]> => {
    try {
      const res = examType === 'course'
        ? await getCourseExamList()
        : await getGroupExamList()
      return res.data || []
    } catch (error: any) {
      console.error('Error fetching exams:', error?.message ?? JSON.stringify(error))
      toast.error('Lỗi tải danh sách bài thi')
      return []
    }
  }

  // On mount: load active banner from DB and pre-populate form
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      let initialType: 'course' | 'group' = 'course'
      let initialExamId: string | null = null
      let initialTopCount = 3

      try {
        const bannerRes = await getActiveBanner()
        const banner = bannerRes.data?.banner
        if (banner) {
          initialType = banner.type as 'course' | 'group'
          initialExamId = String(banner.examId)
          initialTopCount = banner.topNumber
        }
      } catch (error: any) {
        console.error('Load banner error:', error?.message ?? JSON.stringify(error))
      }

      const examList = await fetchExamsByType(initialType)
      setExams(examList)
      setType(initialType)
      setFilterOption(initialType === 'course' ? 'COURSE' : 'GROUP')
      setExamId(initialExamId)
      setTopCount(initialTopCount)
      setLoading(false)
    }

    void init()
  }, [])

  const handleSaveBanner = async () => {
    if (!examId || topCount <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      await saveBanner({
        type,
        examId: Number(examId),
        topNumber: topCount
      })

      toast.success('Lưu banner thành công')
    } catch (error: any) {
      console.error('Save banner error:', error?.message ?? JSON.stringify(error))
      toast.error('Lỗi khi lưu banner')
    }
  }

  const handleChangeFilter = (option: OptionType | null) => {
    if (!option) return
    const newType = option.value === 'COURSE' ? 'course' : 'group'
    setFilterOption(option.value)
    setType(newType)
    setExamId(null)
    setLoading(true)
    void fetchExamsByType(newType).then((list) => {
      setExams(list)
      setLoading(false)
    })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-8">{t('banner_admin.title')}</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end w-full">
          <div className="py-10 px-5 w-1/3 flex flex-col">
            <label className="font-semibold mb-2">{t('banner_admin.display_type')}</label>
            <Select<OptionType, false>
              className="z-20 w-full"
              options={options}
              value={options.find((opt) => opt.value === filterOption)}
              onChange={handleChangeFilter}
              isDisabled={loading}
            />
          </div>

          <div className="py-10 px-5 w-1/3 flex flex-col">
            <label className="font-semibold mb-2">{type === 'course' ? t('banner_admin.exam_course') : t('banner_admin.exam_group')}</label>
            <Select<ExamOption, false>
              className="z-10 w-full"
              options={exams.map((exam) => ({
                value: String(exam.id),
                label: exam.name
              }))}
              value={
                examId
                  ? {
                      value: examId,
                      label: exams.find((e) => String(e.id) === examId)?.name ?? ''
                    }
                  : null
              }
              onChange={(opt) => setExamId(opt ? opt.value : null)}
              isDisabled={loading}
              placeholder={loading ? '-- Đang tải --' : '-- Chọn bài thi --'}
              isClearable
            />
          </div>

          <div className="py-10 px-5 w-[400px] flex flex-col">
            <label className="font-semibold mb-2">{t('banner_admin.top_count')}</label>
            <input
              type="number"
              min={1}
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
              disabled={loading}
              placeholder="Nhập số lượng"
              className="h-[40px] w-full px-3 border border-slate-300 rounded-md bg-white text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="py-10 px-2 w-[150px] flex flex-col">
            <button
              onClick={handleSaveBanner}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition"
            >
              {t('banner_admin.save')}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default BannerPage
