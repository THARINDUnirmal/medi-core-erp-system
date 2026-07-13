import { NextResponse } from 'next/server';

let pharmacyInventory = [
  { id: '#1', name: 'Amoxicillin 500mg', quantity: 100, unitPrice: 100.00, expiryDate: '2029-02-24' }
];

export async function GET() {
  return NextResponse.json(pharmacyInventory);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = {
      id: `#${pharmacyInventory.length + 1}`,
      ...body
    };
    pharmacyInventory.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Malformed item formulation payload' }, { status: 400 });
  }
}