/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const getBase64 = async (file: File): Promise<string> =>
  await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

export const getVideoCover = async (videoFile: File) => {
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')
  const videoObjectURL = URL.createObjectURL(videoFile)

  await new Promise((resolve) => {
    video.addEventListener('loadedmetadata', () => {
      video.width = video.videoWidth
      video.height = video.videoHeight
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      video.currentTime = video.duration * 0.25
    })
    video.addEventListener('seeked', () => resolve(''))
    video.src = videoObjectURL
  })

  canvas
    .getContext('2d')
    ?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  const videoCoverURL = canvas.toDataURL('image/png')
  URL.revokeObjectURL(videoObjectURL)
  return videoCoverURL
}

export const formatFileSize = (fileSizeInBytes: number): string => {
  if (fileSizeInBytes < 1024) {
    return fileSizeInBytes + ' B'
  } else if (fileSizeInBytes < 1024 * 1024) {
    return (fileSizeInBytes / 1024).toFixed(1) + ' KB'
  } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
    return (fileSizeInBytes / (1024 * 1024)).toFixed(1) + ' MB'
  } else {
    return (fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }
}

export const getDropzoneAcceptedFileTypes = (acceptedFileTypes: string[]): string[] => {
  return acceptedFileTypes.map(type => type)
}
