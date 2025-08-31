import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl parameter' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for paired image for:', imageUrl)

    const supabase = supabaseAdmin
    
    // First, find the line art image by URL
    const { data: lineImages, error: lineError } = await supabase
      .from('banner_images')
      .select('id, title, imageUrl, imageType, pairedImageId')
      .eq('imageUrl', imageUrl)
      .eq('imageType', 'line')
      .limit(1)

    if (lineError) {
      console.error('❌ Error fetching line image:', lineError)
      // Fall back to checking without imageType filter
      const { data: anyImages, error: anyError } = await supabase
        .from('banner_images')
        .select('id, title, imageUrl, imageType, pairedImageId')
        .eq('imageUrl', imageUrl)
        .limit(1)

      if (anyError || !anyImages || anyImages.length === 0) {
        console.log('📷 No matching image found in database for:', imageUrl)
        return NextResponse.json({ 
          success: false, 
          message: 'Image not found in database'
        })
      }
      
      const image = anyImages[0]
      if (image.imageType !== 'line' || !image.pairedImageId) {
        console.log('📷 Image found but no pairing available:', { imageType: image.imageType, hasPairedId: !!image.pairedImageId })
        return NextResponse.json({ 
          success: false, 
          message: 'No color reference available for this image'
        })
      }
      
      // Continue with the found image
      const lineImage = image
      const pairedImageId = image.pairedImageId
      
      // Get the paired colored image
      const { data: coloredImages, error: coloredError } = await supabase
        .from('banner_images')
        .select('id, title, imageUrl, imageType')
        .eq('id', pairedImageId)
        .limit(1)

      if (coloredError || !coloredImages || coloredImages.length === 0) {
        console.error('❌ Error fetching colored image:', coloredError)
        return NextResponse.json({ 
          success: false, 
          message: 'Paired colored image not found'
        })
      }

      const coloredImage = coloredImages[0]
      console.log('✅ Found image pairing:', {
        lineImage: { id: lineImage.id, title: lineImage.title },
        coloredImage: { id: coloredImage.id, title: coloredImage.title }
      })

      return NextResponse.json({
        success: true,
        data: {
          lineImage: {
            id: lineImage.id,
            title: lineImage.title,
            imageUrl: lineImage.imageUrl
          },
          coloredImage: {
            id: coloredImage.id,
            title: coloredImage.title,
            imageUrl: coloredImage.imageUrl
          }
        }
      })
    }

    if (!lineImages || lineImages.length === 0) {
      console.log('📷 No line art image found for:', imageUrl)
      return NextResponse.json({ 
        success: false, 
        message: 'Line art image not found'
      })
    }

    const lineImage = lineImages[0]
    
    if (!lineImage.pairedImageId) {
      console.log('📷 Line image found but no paired image ID:', lineImage.title)
      return NextResponse.json({ 
        success: false, 
        message: 'No color reference paired with this line art'
      })
    }

    // Get the paired colored image
    const { data: coloredImages, error: coloredError } = await supabase
      .from('banner_images')
      .select('id, title, imageUrl, imageType')
      .eq('id', lineImage.pairedImageId)
      .limit(1)

    if (coloredError || !coloredImages || coloredImages.length === 0) {
      console.error('❌ Error fetching colored image:', coloredError)
      return NextResponse.json({ 
        success: false, 
        message: 'Paired colored image not found'
      })
    }

    const coloredImage = coloredImages[0]
    console.log('✅ Found image pairing:', {
      lineImage: { id: lineImage.id, title: lineImage.title },
      coloredImage: { id: coloredImage.id, title: coloredImage.title }
    })

    return NextResponse.json({
      success: true,
      data: {
        lineImage: {
          id: lineImage.id,
          title: lineImage.title,
          imageUrl: lineImage.imageUrl
        },
        coloredImage: {
          id: coloredImage.id,
          title: coloredImage.title,
          imageUrl: coloredImage.imageUrl
        }
      }
    })

  } catch (error) {
    console.error('❌ Image pairing lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup image pairing' },
      { status: 500 }
    )
  }
}