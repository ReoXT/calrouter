import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { getOrCreateUser, supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: Request) {
  // Get Clerk webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return Response.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify required headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json(
      { error: 'Missing Svix headers' },
      { status: 400 }
    );
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create Svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return Response.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created': {
        // Create user in Supabase when they sign up
        const { id, email_addresses } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
          console.error('No email found for user:', id);
          return Response.json(
            { error: 'No email found' },
            { status: 400 }
          );
        }

        const { user, isNew } = await getOrCreateUser(id, email);

        console.log(`User ${isNew ? 'created' : 'already exists'}:`, {
          id: user.id,
          clerk_id: id,
          email,
        });

        return Response.json({
          success: true,
          message: `User ${isNew ? 'created' : 'found'}`,
          userId: user.id,
        });
      }

      case 'user.updated': {
        // Update user email if changed
        const { id, email_addresses } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (!email || !supabaseAdmin) {
          return Response.json({ success: true, message: 'No update needed' });
        }

        const { error } = await supabaseAdmin
          .from('users')
          .update({ email })
          .eq('clerk_user_id', id);

        if (error) {
          console.error('Error updating user email:', error);
          // Don't fail the webhook - log and continue
        }

        console.log('User updated:', { clerk_id: id, email });

        return Response.json({
          success: true,
          message: 'User updated',
        });
      }

      case 'user.deleted': {
        // Soft delete or handle user deletion
        const { id } = evt.data;

        if (!supabaseAdmin) {
          return Response.json({ success: true, message: 'User deleted from Clerk' });
        }

        // Option 1: Hard delete (cascades to endpoints and logs)
        const { error } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('clerk_user_id', id);

        if (error) {
          console.error('Error deleting user:', error);
          // Don't fail the webhook
        }

        console.log('User deleted:', { clerk_id: id });

        return Response.json({
          success: true,
          message: 'User deleted',
        });
      }

      default: {
        console.log('Unhandled webhook event:', eventType);
        return Response.json({
          success: true,
          message: 'Event not handled',
        });
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
