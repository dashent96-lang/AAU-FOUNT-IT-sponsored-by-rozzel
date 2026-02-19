import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, name, userId, updates } = body;
    
    // Connect to Pool
    let client;
    try {
      client = await clientPromise;
    } catch (connError: any) {
      return NextResponse.json({ 
        error: `Infrastructure Error: ${connError.message}` 
      }, { status: 503 });
    }

    const db = client.db(DB_NAME);
    const normalizedEmail = email?.trim().toLowerCase();

    // Sign Up Logic
    if (action === 'signup') {
      if (!normalizedEmail || !name) {
        return NextResponse.json({ error: 'Name and email are mandatory.' }, { status: 400 });
      }

      // Check for existing user efficiently
      const existing = await db.collection('users').findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json({ error: 'This university email is already registered. Please sign in.' }, { status: 409 });
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

    // Login Logic
    if (action === 'login') {
      if (!normalizedEmail) {
        return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
      }
      
      const user = await db.collection('users').findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json({ error: 'Account not found. Ensure you used the correct university email.' }, { status: 404 });
      }
      
      return NextResponse.json({ ...user, id: user._id.toString(), _id: undefined });
    }

    // Update Logic
    if (action === 'update') {
      if (!userId || !updates) {
        return NextResponse.json({ error: 'Required fields missing for update.' }, { status: 400 });
      }
      
      const { id, _id, email: rEmail, createdAt: rDate, ...safeUpdates } = updates;
      
      const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: safeUpdates },
        { returnDocument: 'after' }
      );
      
      if (!result) return NextResponse.json({ error: 'Target user record not found.' }, { status: 404 });
      return NextResponse.json({ ...result, id: result._id.toString(), _id: undefined });
    }

    return NextResponse.json({ error: 'Requested action not recognized.' }, { status: 400 });
  } catch (e: any) {
    console.error("Auth API Error:", e);
    return NextResponse.json({ 
      error: `Service Interruption: ${e.message || 'Unknown internal error'}` 
    }, { status: 500 });
  }
}