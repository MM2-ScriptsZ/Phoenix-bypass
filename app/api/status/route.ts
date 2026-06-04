import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory storage (fallback when DB is not available)
let systemState = {
  is_locked: false,
  is_paused: false,
  maintenance_message: '',
  lock_message: 'System is currently locked by administrator',
};

// Public endpoint to check if bypasser is locked/paused
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('is_locked, is_paused, maintenance_message, lock_message')
      .eq('id', 1)
      .single();

    if (error) {
      console.log('[v0] Database not available, using in-memory state');
      return NextResponse.json({
        success: true,
        ...systemState,
      });
    }

    // Update in-memory state from database
    if (settings) {
      systemState = {
        is_locked: settings.is_locked ?? false,
        is_paused: settings.is_paused ?? false,
        maintenance_message: settings.maintenance_message ?? '',
        lock_message: settings.lock_message ?? 'System is currently locked by administrator',
      };
    }

    return NextResponse.json({
      success: true,
      ...systemState,
    });
  } catch (error) {
    console.log('[v0] Status check error, using in-memory state:', error);
    return NextResponse.json({
      success: true,
      ...systemState,
    });
  }
}

// Helper function to update state (can be called from settings API)
export function updateState(newState: Partial<typeof systemState>) {
  systemState = { ...systemState, ...newState };
  console.log('[v0] System state updated:', systemState);
}
