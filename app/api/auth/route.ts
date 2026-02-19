
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, name } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const normalizedEmail = email.toLowerCase();

    if (action === 'login') {
      const user = await db.collection('users').findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 404 });
      }
      return NextResponse.json({ 
        id: user._id.toString(),
        name: user.name,
        email: user.email 
      });
    }

    if (action === 'signup') {
      if (!name) {
        return NextResponse.json({ error: 'Full name is required for registration.' }, { status: 400 });
      }

      const existing = await db.collection('users').findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json({ 
          id: existing._id.toString(),
          name: existing.name,
          email: existing.email 
        });
      }

      const newUser = {
        name,
        email: normalizedEmail,
        createdAt: new Date().toISOString()
      };

      const result = await db.collection('users').insertOne(newUser);
      return NextResponse.json({ 
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email 
      });
    }

    return NextResponse.json({ error: 'Invalid authentication action requested.' }, { status: 400 });
  } catch (e: any) {
    console.error("Auth API Error:", e);
    return NextResponse.json({ error: `Authentication service unavailable: ${e.message}` }, { status: 500 });
  }
}
