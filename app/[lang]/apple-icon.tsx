import { ImageResponse } from 'next/og'
import { RatIcon } from '@components/icons/RatIcon'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <RatIcon size={180} />
    ),
    {
      ...size,
    }
  )
}
