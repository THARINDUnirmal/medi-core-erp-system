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

// GET: Fetch all billing invoices
export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM bills ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create/Generate a new patient invoice record
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { patientId, amount, billDate, status } = body;

        const [result]: any = await pool.query(
            "INSERT INTO bills (patientId, amount, billDate, status) VALUES (?, ?, ?, ?)",
            [Number(patientId), Number(amount), billDate, status || "Unpaid"]
        );

        return NextResponse.json({
            id: result.insertId,
            patientId: Number(patientId),
            amount: Number(amount),
            billDate,
            status: status || "Unpaid",
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Modify an existing invoice configuration (CRUD / Status Updates)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, patientId, amount, billDate, status } = body;

        await pool.query(
            "UPDATE bills SET patientId = ?, amount = ?, billDate = ?, status = ? WHERE id = ?",
            [Number(patientId), Number(amount), billDate, status, id]
        );

        return NextResponse.json({ id, patientId: Number(patientId), amount: Number(amount), billDate, status });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Void/Erase an invoice record entirely
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        await pool.query("DELETE FROM bills WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}