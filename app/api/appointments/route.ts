import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "medicore",
    waitForConnections: true,
    connectionLimit: 10,
});

// GET: Fetch all appointments
export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM appointments ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Book a new appointment
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { patientId, doctorId, appointmentDate, appointmentTime, status } = body;

        const [result]: any = await pool.query(
            "INSERT INTO appointments (patientId, doctorId, appointmentDate, appointmentTime, status) VALUES (?, ?, ?, ?, ?)",
            [patientId, doctorId, appointmentDate, appointmentTime, status || "Scheduled"]
        );

        return NextResponse.json({
            id: result.insertId,
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            status: status || "Scheduled",
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Reschedule or alter appointment configuration
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, patientId, doctorId, appointmentDate, appointmentTime, status } = body;

        await pool.query(
            "UPDATE appointments SET patientId = ?, doctorId = ?, appointmentDate = ?, appointmentTime = ?, status = ? WHERE id = ?",
            [patientId, doctorId, appointmentDate, appointmentTime, status, id]
        );

        return NextResponse.json({ id, patientId, doctorId, appointmentDate, appointmentTime, status });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Cancel/Remove appointment completely
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        await pool.query("DELETE FROM appointments WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}