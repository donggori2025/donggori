import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase 환경 변수가 누락되었습니다.',
          details: {
            missingUrl: !url,
            missingServiceKey: !serviceKey,
          },
        },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();

    // 기본 검증
    const required = ['user_id', 'user_email', 'user_name', 'factory_id', 'factory_name', 'status'];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `필수 필드가 누락되었습니다: ${missing.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from('match_requests')
      .insert({
        user_id: body.user_id,
        user_email: body.user_email,
        user_name: body.user_name,
        factory_id: body.factory_id,
        factory_name: body.factory_name,
        status: body.status ?? 'pending',
        items: body.items ?? [],
        quantity: body.quantity ?? 0,
        description: body.description ?? '',
        contact: body.contact ?? '',
        deadline: body.deadline ?? '',
        budget: body.budget ?? '',
        additional_info: body.additional_info ?? null,
        created_at: body.created_at ?? new Date().toISOString(),
        updated_at: body.updated_at ?? new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: inserted?.id });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '알 수 없는 오류',
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack }),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const userEmail = searchParams.get('userEmail');
  const factoryId = searchParams.get('factoryId');
  const factoryName = searchParams.get('factoryName');
  const requestId = searchParams.get('id');

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase 환경 변수가 누락되었습니다.',
          details: {
            missingUrl: !url,
            missingServiceKey: !serviceKey,
          },
        },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (requestId) {
      const { data, error } = await supabase
        .from('match_requests')
        .select('*')
        .eq('id', requestId)
        .limit(1);
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code, details: error.details, hint: error.hint },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, data });
    }

    if (!userId && !userEmail && !factoryId && !factoryName) {
      return NextResponse.json(
        { success: false, error: '쿼리 파라미터가 필요합니다: userId/userEmail 또는 factoryId/factoryName' },
        { status: 400 }
      );
    }

    const queries: Array<ReturnType<typeof supabase.from>> = [];
    if (userId) queries.push(supabase.from('match_requests').select('*').eq('user_id', userId));
    if (userEmail) queries.push(supabase.from('match_requests').select('*').eq('user_email', userEmail));
    if (factoryId) queries.push(supabase.from('match_requests').select('*').eq('factory_id', factoryId));
    if (factoryName) queries.push(supabase.from('match_requests').select('*').eq('factory_name', factoryName));

    const results = await Promise.all(queries);
    const anyError = results.find(r => r.error);
    if (anyError && anyError.error) {
      return NextResponse.json(
        { success: false, error: anyError.error.message, code: anyError.error.code, details: anyError.error.details, hint: anyError.error.hint },
        { status: 500 }
      );
    }

    const mergedMap = new Map<string, unknown>();
    for (const r of results) {
      for (const row of r.data || []) {
        mergedMap.set(row.id, row);
      }
    }
    const merged = Array.from(mergedMap.values()).sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });

    return NextResponse.json({ success: true, data: merged });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || '알 수 없는 오류',
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase 환경 변수가 누락되었습니다.',
        },
        { status: 500 }
      );
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'id와 status가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase
      .from('match_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code, details: error.details, hint: error.hint },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || '알 수 없는 오류',
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}


