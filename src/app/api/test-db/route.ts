
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: 'Successfully connected to MongoDB!' }, { status: 200 });
  } catch (error) {
    console.error('Database connection error:', error);
    let errorMessage = 'MongoDB didn\'t connect.'; // Corrected this line
    if (error instanceof Error) {
      errorMessage += ` Details: ${error.message}`;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
