  // src/app/api/increment-upload/route.js
  import { NextResponse } from 'next/server';
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  export async function POST(req) {
    const { userId } = await req.json();
    console.log("Incrementing upload count for user", userId)
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const { error } = await supabase.rpc('add_upload_history_by_clerk_id', {
        guest_id: userId,  
        file_name: "test.mp3"       
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }