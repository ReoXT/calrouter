import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// PATCH - Update endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpointId } = await params;
    const body = await request.json();

    // Get user from database
    const { data: dbUser } = await supabaseAdmin!
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify endpoint belongs to user
    const { data: existingEndpoint } = await supabaseAdmin!
      .from('webhook_endpoints')
      .select('id')
      .eq('id', endpointId)
      .eq('user_id', dbUser.id)
      .single();

    if (!existingEndpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    // Update endpoint
    const { data: updatedEndpoint, error } = await supabaseAdmin!
      .from('webhook_endpoints')
      .update({
        name: body.name,
        destination_url: body.destination_url,
        enable_reschedule_detection: body.enable_reschedule_detection,
        enable_utm_tracking: body.enable_utm_tracking,
        enable_question_parsing: body.enable_question_parsing,
        is_active: body.is_active,
      })
      .eq('id', endpointId)
      .select()
      .single();

    if (error) {
      console.error('Error updating endpoint:', error);
      return NextResponse.json({ error: 'Failed to update endpoint' }, { status: 500 });
    }

    return NextResponse.json(updatedEndpoint);
  } catch (error) {
    console.error('Error in PATCH /api/endpoints/[endpointId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpointId } = await params;

    // Get user from database
    const { data: dbUser } = await supabaseAdmin!
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify endpoint belongs to user
    const { data: existingEndpoint } = await supabaseAdmin!
      .from('webhook_endpoints')
      .select('id')
      .eq('id', endpointId)
      .eq('user_id', dbUser.id)
      .single();

    if (!existingEndpoint) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    // Soft delete: Set is_active to false and add deleted_at timestamp
    // This preserves webhook logs as specified in the requirements
    const { error } = await supabaseAdmin!
      .from('webhook_endpoints')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', endpointId);

    if (error) {
      console.error('Error deleting endpoint:', error);
      return NextResponse.json({ error: 'Failed to delete endpoint' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/endpoints/[endpointId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
