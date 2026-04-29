declare module '@rocketseat/react-plyr' {
  import { ComponentType } from 'react'

  interface PlyrProps {
    type?: 'youtube' | 'vimeo' | 'video' | 'audio'
    videoId?: string
    source?: {
      type: 'video' | 'audio'
      sources: Array<{
        src: string
        type?: string
        provider?: 'youtube' | 'vimeo'
      }>
    }
    options?: {
      controls?: string[]
      autoplay?: boolean
      [key: string]: any
    }
    className?: string
  }

  const Plyr: ComponentType<PlyrProps>
  export default Plyr
}
