
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const messages = await db.collection('messages')
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      })
      .sort({ timestamp: 1 })
      .toArray();

    const formatted = messages.map(m => ({
      ...m,
      id: m._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(formatted);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const newMessage = {
      ...body,
      timestamp: Date.now(),
    };

    const result = await db.collection('messages').insertOne(newMessage);
    return NextResponse.json({ ...newMessage, id: result.insertedId.toString() });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to dispatch message' }, { status: 500 });
  }
}
