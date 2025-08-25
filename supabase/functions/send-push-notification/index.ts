// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @ts-ignore
import { corsHeaders } from "../_shared/cors.ts"

// Deno global type declaration
declare const Deno: any

interface PushNotificationRequest {
  type: string
  title: string
  message: string
  recipient_id?: string
  data?: any
  latitude?: number
  longitude?: number
  radius?: number // in kilometers
}

interface ExpoMessage {
  to: string
  title: string
  body: string
  data?: any
  sound?: string
  badge?: number
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const notificationData: PushNotificationRequest = await req.json()

    let pushTokens: string[] = []

    if (notificationData.recipient_id) {
      // Send to specific user
      const { data: user, error: userError } = await supabaseClient
        .from('profiles')
        .select('expo_push_token')
        .eq('id', notificationData.recipient_id)
        .single()

      if (!userError && user?.expo_push_token) {
        pushTokens.push(user.expo_push_token)
      }
    } else if (notificationData.latitude && notificationData.longitude) {
      // Send to users within radius (for new food notifications)
      const radius = notificationData.radius || 5 // default 5km
      
      const { data: nearbyUsers, error: usersError } = await supabaseClient
        .rpc('get_nearby_users', {
          lat: notificationData.latitude,
          lng: notificationData.longitude,
          radius_km: radius
        })

      if (!usersError && nearbyUsers) {
        pushTokens = nearbyUsers
          .map((user: any) => user.expo_push_token)
          .filter((token: string) => token)
      }
    }

    if (pushTokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No valid push tokens found' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare Expo push messages
    const messages: ExpoMessage[] = pushTokens.map(token => ({
      to: token,
      title: notificationData.title,
      body: notificationData.message,
      data: notificationData.data || {},
      sound: 'default',
      badge: 1
    }))

    // Send to Expo Push API
    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const expoResult = await expoResponse.json()

    if (!expoResponse.ok) {
      console.error('Expo push notification error:', expoResult)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send push notification',
          details: expoResult 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log successful notifications
    console.log(`Sent ${messages.length} push notifications for type: ${notificationData.type}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_count: messages.length,
        expo_response: expoResult,
        message: 'Push notifications sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})