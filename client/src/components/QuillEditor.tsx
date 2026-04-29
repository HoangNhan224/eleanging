/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react'
import ReactQuillNew, { Quill } from 'react-quill-new'
import ImageUploader from 'quill-image-uploader'
import ImageResizeModule from 'quill-image-resize-module-react'
import 'quill/dist/quill.snow.css'
import 'quill-image-uploader/dist/quill.imageUploader.min.css'
import imageCompression from 'browser-image-compression'
import { uploadImg } from '../api/post/post.api'

// Get the built-in image format from the same Quill instance
const Image = Quill.import('formats/image')
// Register the modules on that instance
Quill.register('formats/image', Image, true)
Quill.register('modules/imageUploader', ImageUploader)
Quill.register('modules/imageResize', ImageResizeModule.default || ImageResizeModule)

interface QuillEditorProps {
  theme: string
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

interface QuillShowProps {
  value: string
}

interface QuillContentProps {
  htmlContent: string
  className?: string
}

const QuillEditor: React.FC<QuillEditorProps> = ({ theme, onChange, value }) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ color: [] }, { background: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['code-block'],
        ['link'],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['clean']
      ],
      // imageUploader: {
      //   upload: async (file: File) => {
      //     const options = {
      //       maxSizeMB: 1,
      //       maxWidthOrHeight: 1024,
      //       useWebWorker: true,
      //       fileType: file.type
      //     }
      //     try {
      //       const compressedBlob = await imageCompression(file, options)
      //       const compressedFile = new File([compressedBlob], file.name, { type: file.type })
      //       const formData = new FormData()
      //       formData.append('image', compressedFile)
      //       const response = await uploadImg(formData)
      //       return response.data.image
      //     } catch (error) {
      //       throw new Error('Image upload failed')
      //     }
      //   }
      // },
      imageResize: {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize']
      }
    }),
    []
  )

  return (
    <div>
      <ReactQuillNew theme={theme} modules={modules} value={value} onChange={onChange} />
    </div>
  )
}

const QuillShow: React.FC<QuillContentProps> = ({ htmlContent, className }) => {
  return (
    <div className={`ql-snow ${className || ''}`}>
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}

export { QuillEditor, QuillShow }
export default QuillShow
