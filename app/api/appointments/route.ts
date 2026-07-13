import { NextResponse } from 'next/server';

let appointments = [
  { id: '#1', patientId: 'Patient #1', doctorId: 'Doc #101', dateTime: '2026-06-27 (10:57:00)', status: 'Scheduled' }
];

export async function GET() {
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAppointment = {
      id: `#${appointments.length + 1}`,
      ...body
    };
    appointments.push(newAppointment);
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Malformed appointment schema' }, { status: 400 });
  }
}