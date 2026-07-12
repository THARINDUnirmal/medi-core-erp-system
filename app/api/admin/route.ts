import { NextResponse } from 'next/server';

export async function GET() {
  // In production, you would run aggregation database queries here
  const systemsMetricsSummary = {
    totalPatients: 2,
    activeAppointments: 1,
    settledCashFlowValuation: 2500.00,
    systemStatus: 'Operational',
    lastSystemBackup: new Date().toISOString()
  };

  return NextResponse.json(systemsMetricsSummary);
}