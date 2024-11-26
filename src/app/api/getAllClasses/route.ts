import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you are using Prisma to interact with your database

export async function GET() {
  try {
    // Fetch all classes from the database
    const allClasses = await prisma.class.findMany(); // Replace 'class' with your model name if needed
    return NextResponse.json(allClasses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
