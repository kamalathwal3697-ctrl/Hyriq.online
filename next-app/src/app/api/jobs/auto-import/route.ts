import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Simple success placeholder/delegate to keep the frontend happy
  // since Google search covers all local jobs import anyway.
  return NextResponse.json({ success: true, count: 0, message: 'Arbeitnow auto-import is deprecated in favor of Google Jobs Bot' });
}
