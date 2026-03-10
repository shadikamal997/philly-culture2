import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Success' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
  return NextResponse.json({ message: 'Success' });
}