
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const DB_NAME = process.env.MONGODB_DB_NAME || 'aau_lost_found';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const items = await db.collection('items')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    const formattedItems = items.map(item => ({
      ...item,
      id: item._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(formattedItems);
  } catch (e: any) {
    console.error("Critical API Error [GET /api/items]:", e);
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
      createdAt: Date.now(),
    };

    const result = await db.collection('items').insertOne(newItem);
    return NextResponse.json({ ...newItem, id: result.insertedId.toString() });
  } catch (e: any) {
    console.error("Critical API Error [POST /api/items]:", e);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { itemId, status } = await request.json();
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const result = await db.collection('items').findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    
    if (!result) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ ...result, id: result._id.toString(), _id: undefined });
  } catch (e: any) {
    console.error("Critical API Error [PUT /api/items]:", e);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
