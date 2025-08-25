// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts"

// Deno global type declaration
declare const Deno: any

interface ReminderRequest {
  type: 'pickup_reminder' | 'expiry_reminder' | 'donation_reminder'
  booking_id?: string
  food_id?: string
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for cron jobs
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const reminderData: ReminderRequest = await req.json()

    if (reminderData.type === 'pickup_reminder' && reminderData.booking_id) {
      // Send pickup reminder to receiver
      const { data: booking, error: bookingError } = await supabaseClient
        .from('bookings')
        .select(`
          *,
          foods(*),
          profiles:receiver_id(full_name, expo_push_token)
        `)
        .eq('id', reminderData.booking_id)
        .eq('status', 'confirmed')
        .single()

      if (!bookingError && booking) {
        // Send push notification
        await supabaseClient.functions.invoke('send-push-notification', {
          body: {
            type: 'pickup_reminder',
            title: 'Jangan Lupa Ambil Makanan!',
            message: `Waktu pickup untuk ${booking.foods.title} sudah dekat`,
            recipient_id: booking.receiver_id,
            data: {
              booking_id: booking.id,
              food_id: booking.food_id
            }
          }
        })

        // Create notification record
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: booking.receiver_id,
            type: 'pickup_reminder',
            title: 'Jangan Lupa Ambil Makanan!',
            message: `Waktu pickup untuk ${booking.foods.title} sudah dekat`,
            data: {
              booking_id: booking.id,
              food_id: booking.food_id
            }
          })
      }
    }

    if (reminderData.type === 'expiry_reminder') {
      // Find foods expiring in 2 hours
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      
      const { data: expiringFoods, error: foodsError } = await supabaseClient
        .from('foods')
        .select(`
          *,
          profiles:donor_id(full_name, expo_push_token)
        `)
        .eq('status', 'available')
        .lte('expired_at', twoHoursFromNow)
        .gte('expired_at', new Date().toISOString())

      if (!foodsError && expiringFoods) {
        for (const food of expiringFoods) {
          // Send expiry reminder to donor
          await supabaseClient.functions.invoke('send-push-notification', {
            body: {
              type: 'expiry_reminder',
              title: 'Makanan Akan Segera Kedaluwarsa!',
              message: `${food.title} akan kedaluwarsa dalam 2 jam`,
              recipient_id: food.donor_id,
              data: {
                food_id: food.id
              }
            }
          })

          // Create notification record
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: food.donor_id,
              type: 'expiry_reminder',
              title: 'Makanan Akan Segera Kedaluwarsa!',
              message: `${food.title} akan kedaluwarsa dalam 2 jam`,
              data: {
                food_id: food.id
              }
            })
        }
      }
    }

    if (reminderData.type === 'donation_reminder') {
      // Find users who haven't donated in 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: inactiveUsers, error: usersError } = await supabaseClient
        .from('profiles')
        .select('*')
        .not('expo_push_token', 'is', null)
        .not('id', 'in', `(
          SELECT DISTINCT donor_id 
          FROM foods 
          WHERE created_at > '${thirtyDaysAgo}'
        )`)

      if (!usersError && inactiveUsers) {
        for (const user of inactiveUsers) {
          // Send donation reminder
          await supabaseClient.functions.invoke('send-push-notification', {
            body: {
              type: 'donation_reminder',
              title: 'Yuk Berbagi Makanan Lagi!',
              message: 'Sudah lama tidak berbagi makanan. Mari bantu sesama!',
              recipient_id: user.id,
              data: {}
            }
          })

          // Create notification record
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'donation_reminder',
              title: 'Yuk Berbagi Makanan Lagi!',
              message: 'Sudah lama tidak berbagi makanan. Mari bantu sesama!',
              data: {}
            })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reminders sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in send-reminder function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})