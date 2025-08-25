// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts"

// Deno global type declaration
declare const Deno: any

interface CreateFoodRequest {
  title: string
  description: string
  quantity: number
  location: string
  latitude: number
  longitude: number
  expired_at: string
  image_url?: string
  category: string
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const foodData: CreateFoodRequest = await req.json()

    // Validate required fields
    if (!foodData.title || !foodData.description || !foodData.quantity || 
        !foodData.location || !foodData.expired_at || !foodData.category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Insert food into database
    const { data: food, error: insertError } = await supabaseClient
      .from('foods')
      .insert({
        donor_id: user.id,
        title: foodData.title,
        description: foodData.description,
        quantity: foodData.quantity,
        location: foodData.location,
        latitude: foodData.latitude,
        longitude: foodData.longitude,
        expired_at: foodData.expired_at,
        image_url: foodData.image_url,
        category: foodData.category,
        status: 'available'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting food:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create food' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send notification to nearby users (optional)
    try {
      await supabaseClient.functions.invoke('send-push-notification', {
        body: {
          type: 'new_food',
          title: 'Makanan Baru Tersedia!',
          message: `${foodData.title} tersedia di ${foodData.location}`,
          data: {
            food_id: food.id,
            latitude: foodData.latitude,
            longitude: foodData.longitude
          }
        }
      })
    } catch (notifError) {
      console.warn('Failed to send notification:', notifError)
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: food,
        message: 'Food created successfully' 
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in create-food function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})