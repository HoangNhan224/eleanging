/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { FC } from 'react'
import { DropzoneOptions, useDropzone, FileRejection, Accept } from 'react-dropzone'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'
interface IUploadFilesProps extends DropzoneOptions {
  className?: string
  errorMessage?: string
  borderError?: boolean
  maxFiles?: number
  multiple?: boolean
  maxSize?: number
  accept?: Accept
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[]) => Promise<void>
}

/**
 * UploadFiles component provides a drag-and-drop interface for uploading files.
 *
 * @author Hien
 * @component
 * @param {IUploadFilesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered UploadFiles component.
 *
 * @property {string} [className] - Optional additional class names for the component.
 * @property {string} [errorMessage] - Optional error message to display.
 * @property {boolean} [borderError] - Optional flag to indicate if the border should be red.
 * @property {number} [maxFiles] - Optional maximum number of files that can be uploaded.
 * @property {boolean} [multiple] - Optional flag to indicate if multiple files can be uploaded.
 * @property {number} [maxSize] - Optional maximum file size.
 * @property {Accept} [accept] - Optional accepted file types.
 * @property {function} [onDrop] - Optional function to handle file drop.
 */
const UploadFiles: FC<IUploadFilesProps> = ({
  className,
  errorMessage,
  borderError,
  ...dropzoneOptions
}) => {
  const theme = useTheme()
  const { getInputProps, getRootProps } = useDropzone({ ...dropzoneOptions })
  const { t } = useTranslation()

  /**
   * Returns a friendly string representation of accepted file types.
   *
   * @author Hien
   * @param {Accept | undefined} accept - The accepted file types.
   * @returns {string} The friendly string representation of accepted file types.
   */
  const getFriendlyFileTypes = (accept: Accept | undefined) => {
    if (!accept) return 'various'
    const mimeTypes = Object.keys(accept)
    return mimeTypes
      .map((mime) => {
        const extensions = accept[mime]
        switch (mime) {
          case 'application/pdf':
            return '.pdf'
          case 'application/msword':
            return '.doc'
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return '.docx'
          case 'image/jpeg':
            if (Array.isArray(extensions) && extensions.length > 0) {
              return extensions.map((ext) => ext.toLowerCase()).join(', ')
            }
            return '.jpg, .jpeg'
          case 'image/png':
            return '.png'
          case 'video/mp4':
            return '.mp4'
          default:
            return mime.includes('/') ? `.${mime.split('/')[1]}` : mime
        }
      })
      .join(', ')
  }

  const getSizeLimitText = (accept: Accept | undefined) => {
    if (!accept) return t('uploadfile.size_limit_default')

    const mimeTypes = Object.keys(accept)
    const hasPdf = mimeTypes.includes('application/pdf')
    const hasImage = mimeTypes.some((mime) => mime.startsWith('image/'))

    if (hasPdf && hasImage) return t('uploadfile.size_limit_pdf_image')
    if (hasPdf) return t('uploadfile.size_limit_pdf')
    if (hasImage) return t('uploadfile.size_limit_image')

    return t('uploadfile.size_limit_default')
  }

  return (
<>
  <div
    {...getRootProps({
      className: `${className || ''
        } flex flex-col items-center p-4 ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-[#00000005]'} border border-dashed ${borderError ? 'border-red-500' : theme === 'dark' ? 'border-[#555]' : 'border-[#d9d9d9]'
        } rounded-lg hover:border-blue-500 transition-colors duration-300 hover:cursor-pointer`
    })}
  >
    <input {...getInputProps()} />
    <CloudUploadIcon color={theme === 'dark' ? 'info' : 'success'} sx={{ fontSize: 50 }} />
    <p className={`text-base mb-1 ${theme === 'dark' ? 'text-[#ffffff]' : 'text-[#000000e0]'}`}>
      {t('uploadfile.title_upload_file')}
    </p>
    <p className={`text-sm ${theme === 'dark' ? 'text-[#ffffffb3]' : 'text-[#00000073]'}`}>
      {t('uploadfile.support')} {getFriendlyFileTypes(dropzoneOptions.accept)} {getSizeLimitText(dropzoneOptions.accept)}
    </p>
  </div>
  {errorMessage && (
    <p className="text-base text-red-400 mt-1">{errorMessage}</p>
  )}
</>
  )
}

export default UploadFiles
