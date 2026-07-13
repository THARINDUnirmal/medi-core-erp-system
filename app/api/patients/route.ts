import { NextResponse } from 'next/server';

// Temporary mock database array
let patients = [
  { id: '#1', name: 'Tharindu Nirmal', dob: '1998-05-20', gender: 'Male', bloodGroup: 'A+', contact: '0703814047', address: 'Buttala' },
  { id: '#2', name: 'Kusalya', dob: '2003-11-12', gender: 'Female', bloodGroup: 'O+', contact: '0703814047', address: 'Homagama' }
];

export async function GET() {
  return NextResponse.json(patients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPatient = {
      id: `#${patients.length + 1}`,
      ...body
    };
    patients.push(newPatient);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Malformed patient data mapping' }, { status: 400 });
  }
}