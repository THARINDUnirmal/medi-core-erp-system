import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Create a connection pool to XAMPP MySQL
const pool = mysql.createPool({
    host: "localhost",
    user: "root", // Default XAMPP username
    password: "", // Default XAMPP password is empty
    database: "medicore",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// GET: Fetch all patients
export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM patients ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Add a new patient
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, dob, gender, contact, address, bloodGroup } = body;

        const [result]: any = await pool.query(
            "INSERT INTO patients (name, dob, gender, contact, address, bloodGroup) VALUES (?, ?, ?, ?, ?, ?)",
            [name, dob, gender, contact, address, bloodGroup]
        );

        return NextResponse.json({
            id: result.insertId,
            name, dob, gender, contact, address, bloodGroup
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update an existing patient record
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, dob, gender, contact, address, bloodGroup } = body;

        await pool.query(
            "UPDATE patients SET name = ?, dob = ?, gender = ?, contact = ?, address = ?, bloodGroup = ? WHERE id = ?",
            [name, dob, gender, contact, address, bloodGroup, id]
        );

        return NextResponse.json({ id, name, dob, gender, contact, address, bloodGroup });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a patient
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        await pool.query("DELETE FROM patients WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}