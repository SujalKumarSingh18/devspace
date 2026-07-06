import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ======================================================================
// POST: Logout the user by deleting the secure JWT token cookie
// ======================================================================
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully!" 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
