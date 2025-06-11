import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  const formData = await req.formData();
  const audioFile = formData.get('audio');
  const analysis = JSON.parse(formData.get('analysis'));
  const clerkId = formData.get('clerkId') || null;
  const guestId = formData.get('guestId') || null;
  const userId = formData.get('userId') || null;

  // 1. Upload audio file to Supabase Storage
  let audioUrl = null;
  if (audioFile) {
    const fileExt = audioFile.name.split('.').pop();
    const filePath = `uploads/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('audio') // Your storage bucket name
      .upload(filePath, audioFile, {
        contentType: audioFile.type,
        upsert: false,
      });

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('audio')
      .getPublicUrl(filePath);
    audioUrl = publicUrlData.publicUrl;
  }

  // If clerkId is present, increment uploadCount in Clerk publicMetadata
  if (clerkId) {
    try {
      const user = await clerkClient.users.getUser(clerkId);
      const currentMeta = user.publicMetadata || {};
      const currentCount = currentMeta.uploadCount || 0;
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: {
          ...currentMeta,
          uploadCount: currentCount + 1,
        },
      });
    } catch (err) {
      console.error('Failed to update Clerk publicMetadata:', err);
      // Optionally, return error or continue
    }
  }

  console.log("userID", clerkId, guestId, userId)

  // 2. Look up user as before (see previous answer)
  const orFilters = [];
  if (clerkId) orFilters.push(`clerk_id.eq.${clerkId}`);
  if (guestId) orFilters.push(`guest_id.eq.${guestId}`);

  if (orFilters.length === 0) {
    return NextResponse.json({ error: 'No user identifier provided' }, { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .or(orFilters.join(','))
    .maybeSingle();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  let userIdForReport;
  
  if (!user) {
    // Create new user if not found
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert([
        {
          clerk_id: clerkId,
          guest_id: guestId,
        }
      ])
      .select('id')
      .single();
    if (newUserError) {
      return NextResponse.json({ error: newUserError.message }, { status: 500 });
    }
    userIdForReport = newUser.id;
  } else {
    userIdForReport = user.id;
  }

  // 3. Insert the report with the audio URL
  const { data, error } = await supabase
    .from('reports')
    .insert([
      {
        user_id: userIdForReport,
        analysis,
        audio_url: audioUrl,
      }
    ])
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}