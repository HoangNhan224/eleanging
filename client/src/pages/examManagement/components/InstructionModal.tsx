/* eslint-disable @typescript-eslint/explicit-function-return-type */
// filepath: client\src\pages\examManagement\components\InstructionModal.tsx
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ClipboardJS from 'clipboard'
import { useTranslation } from 'react-i18next'

interface InstructionModalProps {
  onClose: () => void
}

/**
 * InstructionModal component for displaying instructions on how to format questions.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered InstructionModal component.
 */
const InstructionModal: React.FC<InstructionModalProps> = ({ onClose }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize state for the selected question type
  const [selectedType, setSelectedType] = useState<'single' | 'multiple'>('single')

  // TODO: Initialize the ClipboardJS library
  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-button')

    clipboard.on('success', function (e: any) {
      toast.success(t('exam_admin.instruction_modal.toast.copy_success'))
      e.clearSelection()
    })

    clipboard.on('error', function (e: any) {
      toast.error(t('exam_admin.instruction_modal.toast.copy_failed'))
    })

    return () => {
      clipboard.destroy()
    }
  }, [t])

  /**
   * Gets the text to copy based on the selected question type.
   *
   * @author Hien
   * @returns {string} The text to copy.
   */
  const getTextToCopy = () => {
    if (selectedType === 'single') {
      return `${t('exam_admin.instruction_modal.example_1_single')}\n${t('exam_admin.instruction_modal.example_1_single_a')}\n${t('exam_admin.instruction_modal.example_1_single_b')}\n${t('exam_admin.instruction_modal.example_1_single_c')}\n${t('exam_admin.instruction_modal.example_1_single_d')}\n\n${t('exam_admin.instruction_modal.example_2_single')}\n${t('exam_admin.instruction_modal.example_2_single_a')}\n${t('exam_admin.instruction_modal.example_2_single_b')}\n${t('exam_admin.instruction_modal.example_2_single_c')}\n${t('exam_admin.instruction_modal.example_2_single_d')}`
    } else {
      return `${t('exam_admin.instruction_modal.example_1_multiple')}\n${t('exam_admin.instruction_modal.example_1_multiple_a')}\n${t('exam_admin.instruction_modal.example_1_multiple_b')}\n${t('exam_admin.instruction_modal.example_1_multiple_c')}\n${t('exam_admin.instruction_modal.example_1_multiple_d')}\n\n${t('exam_admin.instruction_modal.example_2_multiple')}\n${t('exam_admin.instruction_modal.example_2_multiple_a')}\n${t('exam_admin.instruction_modal.example_2_multiple_b')}\n${t('exam_admin.instruction_modal.example_2_multiple_c')}\n${t('exam_admin.instruction_modal.example_2_multiple_d')}`
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow-xl w-4/5 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div></div>
                <h2 className="text-2xl font-semibold text-gray-800">{t('exam_admin.instruction_modal.title')}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Instruction Content */}
            <div className="p-6 overflow-y-auto h-[80vh]">
                <p className="text-gray-700 mb-4">
                    {t('exam_admin.instruction_modal.rules_title')}
                </p>
                <ul className="list-disc list-inside text-gray-600">
                    <li>{t('exam_admin.instruction_modal.rule_1')}</li>
                    <li>{t('exam_admin.instruction_modal.rule_2')}</li>
                    <li>{t('exam_admin.instruction_modal.rule_3')}</li>
                    <li>{t('exam_admin.instruction_modal.rule_4')}</li>
                </ul>

                <p className="text-gray-700 mt-6 mb-4 font-semibold">{t('exam_admin.instruction_modal.examples_title')}</p>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setSelectedType('single')}
                        className={`py-2 px-4 rounded-md ${selectedType === 'single' ? 'bg-teal-400 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {t('exam_admin.instruction_modal.single_answer_type')}
                    </button>
                    <button
                        onClick={() => setSelectedType('multiple')}
                        className={`py-2 px-4 rounded-md ${selectedType === 'multiple' ? 'bg-teal-400 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {t('exam_admin.instruction_modal.multiple_answer_type')}
                    </button>
                </div>

                {selectedType === 'single'
                  ? (
                        <div className="border p-4 rounded-md">
                            <p className="text-gray-800 mb-2">
                                {t('exam_admin.instruction_modal.example_1_single')}
                            </p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_single_a')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_single_b')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_single_c')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_single_d')}</p>

                            <p className="text-gray-800 mt-4 mb-2">
                                {t('exam_admin.instruction_modal.example_2_single')}
                            </p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_single_a')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_single_b')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_single_c')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_single_d')}</p>
                        </div>
                    )
                  : (
                        <div className="border p-4 rounded-md">
                            <p className="text-gray-800 mb-2">
                                {t('exam_admin.instruction_modal.example_1_multiple')}
                            </p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_multiple_a')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_multiple_b')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_multiple_c')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_1_multiple_d')}</p>

                            <p className="text-gray-800 mt-4 mb-2">
                                {t('exam_admin.instruction_modal.example_2_multiple')}
                            </p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_multiple_a')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_multiple_b')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_multiple_c')}</p>
                            <p className="text-gray-800">{t('exam_admin.instruction_modal.example_2_multiple_d')}</p>
                        </div>
                    )}
                <button className="copy-button text-white mt-4 bg-teal-400 py-2 px-4 rounded-md hover:bg-teal-500" data-clipboard-text={getTextToCopy()}>
                  <ContentCopyIcon className="h-5 w-5 -mt-1"/> {t('exam_admin.instruction_modal.copy')}
                </button>
                <div className="text-gray-700 mt-6">
                    {t('exam_admin.instruction_modal.copy_structure_instruction')}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-center">
                <button
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    {t('exam_admin.instruction_modal.close')}
                </button>
            </div>
        </div>
    </div>
  )
}

export default InstructionModal
