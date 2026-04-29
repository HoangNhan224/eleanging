/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
// import { formatFileSize } from '../utils/fileconfig'
import { IUploadFile } from '../api/interfaces'

interface IPreviewFilesProps {
  className?: string
  fileList: IUploadFile[]
  onRemoveFile: (uid: string) => void
}

const getIcon = (fileType: string) => {
  if (fileType === 'application/pdf') {
    return <PictureAsPdfIcon style={{ fontSize: 40, color: 'red' }} />
  } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return <DescriptionIcon style={{ fontSize: 40, color: 'blue' }} />
  } else {
    return null
  }
}

const PreviewFiles: React.FC<IPreviewFilesProps> = ({
  className,
  fileList,
  onRemoveFile
}) => {
  return (
    <div className={`${className || ''} flex flex-wrap gap-4 w-500`}>
      <AnimatePresence>
        {fileList.map((file) => (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            key={file.uid}
            className="md:w-1/3 flex items-center w-full  gap-2 p-2 rounded-lg border border-solid border-gray-300"
          >
            {file.preview
              ? (
              <img
                src={file.preview}
                alt="Preview picture"
                className="w-20 h-20 rounded-lg object-contain"
              />
                )
              : (
                  getIcon(file.originalFileObj.type)
                )}
            <div className="flex flex-col flex-1">
              {/* // hiển thị tên ảnh và kích thước của anh */}
              {/* <p className="break-words break-all">{file.originalFileObj.name}</p>
              <p>{formatFileSize(file.originalFileObj.size)}</p> */}
            </div>
            <div
              className="w-8 h-8 rounded-full hover:bg-slate-200 hover:cursor-pointer duration-300 flex items-center justify-center"
              onClick={() => onRemoveFile(file.uid)}
            >
              <CloseIcon />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

  )
}

export default PreviewFiles
