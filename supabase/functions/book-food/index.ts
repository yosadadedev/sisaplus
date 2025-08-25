import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

interface BookFoodRequest {
  food_id: string
  message?: string
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
    const bookingData: BookFoodRequest = await req.json()

    if (!bookingData.food_id) {
      return new Response(
        JSON.stringify({ error: 'Food ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if food exists and is available
    const { data: food, error: foodError } = await supabaseClient
      .from('foods')
      .select('*, profiles:donor_id(full_name, expo_push_token)')
      .eq('id', bookingData.food_id)
      .eq('status', 'available')
      .single()

    if (foodError || !food) {
      return new Response(
        JSON.stringify({ error: 'Food not found or not available' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user is not the donor
    if (food.donor_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot book your own food' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Start transaction: Create booking and update food status
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        food_id: bookingData.food_id,
        receiver_id: user.id,
        status: 'pending',
        message: bookingData.message
      })
      .select('*, foods(*), profiles:receiver_id(full_name)')
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update food status to booked
    const { error: updateError } = await supabaseClient
      .from('foods')
      .update({ status: 'booked' })
      .eq('id', bookingData.food_id)

    if (updateError) {
      console.error('Error updating food status:', updateError)
      // Rollback booking if food update fails
      await supabaseClient
        .from('bookings')
        .delete()
        .eq('id', booking.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to update food status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send push notification to donor
    try {
      await supabaseClient.functions.invoke('send-push-notification', {
        body: {
          type: 'food_booked',
          title: 'Makanan Anda Telah Dipesan!',
          message: `${booking.profiles.full_name} telah memesan ${food.title}`,
          recipient_id: food.donor_id,
          data: {
            booking_id: booking.id,
            food_id: bookingData.food_id
          }
        }
      })
    } catch (notifError) {
      console.warn('Failed to send notification:', notifError)
      // Don't fail the request if notification fails
    }

    // Create notification record
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: food.donor_id,
        type: 'food_booked',
        title: 'Makanan Anda Telah Dipesan!',
        message: `${booking.profiles.full_name} telah memesan ${food.title}`,
        data: {
          booking_id: booking.id,
          food_id: bookingData.food_id
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: booking,
        message: 'Food booked successfully' 
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in book-food function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})