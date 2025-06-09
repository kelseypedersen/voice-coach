import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  const { analysis, userId } = await req.json();

  // Insert the report into the voice_reports table
  const { data, error } = await supabase
    .from('voice_reports')
    .insert([
      {
        user_id: userId,
        analysis, // stores the analysis as JSONB
      }
    ])
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}