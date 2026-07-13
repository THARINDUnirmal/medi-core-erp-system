import { NextResponse } from 'next/server';

let financials = [
  { id: '#1', patientId: 'Patient File #1', billDate: '2026-06-24', amount: 2500.00, status: 'Paid' }
];

export async function GET() {
  return NextResponse.json(financials);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBill = {
      id: `#${financials.length + 1}`,
      ...body
    };
    financials.push(newBill);
    return NextResponse.json(newBill, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Malformed financial ledger request' }, { status: 400 });
  }
}