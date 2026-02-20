
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get('all') === 'true';

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Only return verified items to normal users
    const query = showAll ? {} : { isVerified: true };
    
    const items = await db.collection('items')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    const formattedItems = items.map(item => ({
      ...item,
      id: item._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(formattedItems);
  } catch (e: any) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const newItem = {
      ...body,
      isVerified: false, // Force moderation
      createdAt: Date.now(),
    };

    const result = await db.collection('items').insertOne(newItem);
    return NextResponse.json({ ...newItem, id: result.insertedId.toString() });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

// Fixed: Allow generic field updates instead of being restricted to status only
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, ...updates } = body;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Clean updates object to prevent identifier mutations
    delete (updates as any).id;
    delete (updates as any)._id;
    delete (updates as any).createdAt;
    
    const result = await db.collection('items').findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (!result) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ ...result, id: result._id.toString(), _id: undefined });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { itemId, isVerified } = await request.json();
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const result = await db.collection('items').findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: { isVerified } },
      { returnDocument: 'after' }
    );
    
    if (!result) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ ...result, id: result._id.toString(), _id: undefined });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to verify item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection('items').deleteOne({ _id: new ObjectId(itemId) });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
