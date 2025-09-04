import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return NextResponse.json({
    hasUrl: !!url,
    hasAnon: !!anon,
    hasServiceRole: !!service,
  });
}


