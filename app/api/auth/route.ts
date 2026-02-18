
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function POST(request: Request) {
  try {
    const { action, email, name, department } = await request.json();
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (action === 'login') {
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ ...user, id: user._id.toString(), _id: undefined });
    }

    if (action === 'signup') {
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ ...existing, id: existing._id.toString(), _id: undefined });
      }

      const newUser = {
        name,
        email: email.toLowerCase(),
        department,
        createdAt: new Date().toISOString()
      };

      const result = await db.collection('users').insertOne(newUser);
      return NextResponse.json({ ...newUser, id: result.insertedId.toString() });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
