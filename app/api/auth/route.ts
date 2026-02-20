import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, name, userId, updates } = body;
    
    let client;
    try {
      client = await clientPromise;
    } catch (connError: any) {
      console.error("Database Connection Failure:", connError);
      return NextResponse.json({ 
        error: "The Recovery Hub database is currently unreachable. Please check your Atlas configuration." 
      }, { status: 503 });
    }

    const db = client.db(DB_NAME);
    const normalizedEmail = email?.trim().toLowerCase();

    if (action === 'signup') {
      if (!normalizedEmail || !name) {
        return NextResponse.json({ error: 'Identity details are required.' }, { status: 400 });
      }

      const existing = await db.collection('users').findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json({ error: 'This university account is already registered.' }, { status: 409 });
      }

      const newUser = {
        name: name.trim(),
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
        department: '', faculty: '', level: '', studentId: '', phoneNumber: '', bio: '', avatarUrl: '', preferredMeetingSpot: '', socialHandle: ''
      };

      const result = await db.collection('users').insertOne(newUser);
      return NextResponse.json({ ...newUser, id: result.insertedId.toString() });
    }

    if (action === 'login') {
      if (!normalizedEmail) {
        return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
      }
      
      const user = await db.collection('users').findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json({ error: 'Account not found. Verify your email.' }, { status: 404 });
      }
      
      return NextResponse.json({ ...user, id: user._id.toString(), _id: undefined });
    }

    if (action === 'update') {
      if (!userId || !updates) {
        return NextResponse.json({ error: 'Missing update metadata.' }, { status: 400 });
      }
      
      const { id, _id, email: rEmail, createdAt: rDate, ...safeUpdates } = updates;
      
      const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: safeUpdates },
        { returnDocument: 'after' }
      );
      
      if (!result) return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
      return NextResponse.json({ ...result, id: result._id.toString(), _id: undefined });
    }

    return NextResponse.json({ error: 'Unsupported operation.' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: `Server Error: ${e.message}` }, { status: 500 });
  }
}