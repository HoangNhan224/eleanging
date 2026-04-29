/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import { formatFileSize } from '../utils/fileconfig'
import { IUploadFile } from '../api/interfaces'

interface IPreviewFilesProps {
  className?: string
  fileList: IUploadFile[]
  onRemoveFile: (uid: string) => void
}

/**
 * Returns the appropriate icon component based on the file type.
 *
 * @author Hien
 * @param {string} fileType - The MIME type of the file.
 * @returns {JSX.Element | null} The icon component corresponding to the file type.
 */
const getIcon = (fileType: string) => {
  if (fileType === 'application/pdf') {
    return <PictureAsPdfIcon style={{ fontSize: 40, color: 'red' }} />
  } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return <DescriptionIcon style={{ fontSize: 40, color: 'blue' }} />
  } else {
    return null
  }
}

/**
 * PreviewFiles component displays a list of uploaded files with preview and remove functionality.
 *
 * @author Hien
 * @component
 * @param {IPreviewFilesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered PreviewFiles component.
 *
 * @property {string} [className] - Optional additional class names for the component.
 * @property {IUploadFile[]} fileList - The list of uploaded files to display.
 * @property {function} onRemoveFile - The function to call when a file is removed.
 */
const PreviewFiles: React.FC<IPreviewFilesProps> = ({
  className,
  fileList,
  onRemoveFile
}) => {
  return (
    <div className={`${className || ''} flex flex-col gap-4`}>
      <AnimatePresence>
        {fileList.map((file) => (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            key={file.uid}
          >
            <div className="flex items-center gap-2 p-2 w-full max-w-[500px] rounded-lg border border-solid border-gray-300">
              {file.preview
                ? (
                  <div className="mr-2">
                    <div className="flex items-center gap-2">
                      <img src={file.preview} alt="Preview" className="w-24 h-24" />
                    </div>
                  </div>
                  )
                : (
                    getIcon(file.originalFileObj.type)
                  )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="truncate cursor-help" title={file.originalFileObj.name}>
                  {file.originalFileObj.name}
                </span>
                <span>{formatFileSize(file.originalFileObj.size)}</span>
              </div>
              <div
                className="w-8 h-8 rounded-full hover:bg-slate-200 hover:cursor-pointer duration-300 flex items-center justify-center"
                onClick={() => onRemoveFile(file.uid)}
              >
                <CloseIcon />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default PreviewFiles
