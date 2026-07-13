import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Create database connection pool to XAMPP MySQL
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // Default XAMPP password is empty
    database: "medicore",
    waitForConnections: true,
    connectionLimit: 10,
});

// ==========================================
// 1. GET: Fetch data lines for lists
// ==========================================
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dept = searchParams.get("dept");

        if (dept === "patients") {
            const [rows] = await pool.query("SELECT * FROM patients ORDER BY id DESC");
            return NextResponse.json(rows);
        } else if (dept === "appointments") {
            const [rows] = await pool.query("SELECT * FROM appointments ORDER BY id DESC");
            return NextResponse.json(rows);
        } else if (dept === "pharmacy") {
            // FIX: Pointing to your actual 'medicines' table from phpMyAdmin
            const [rows] = await pool.query("SELECT * FROM medicines ORDER BY id DESC");
            return NextResponse.json(rows);
        } else if (dept === "financial") {
            const [rows] = await pool.query("SELECT * FROM bills ORDER BY id DESC");
            return NextResponse.json(rows);
        }
        return NextResponse.json({ error: "Invalid department target node" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ==========================================
// 2. POST: Create New Entries
// ==========================================
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dept = searchParams.get("dept");
        const body = await request.json();

        if (dept === "patients") {
            const [res]: any = await pool.query(
                "INSERT INTO patients (name, dob, gender, contact, address, bloodGroup) VALUES (?, ?, ?, ?, ?, ?)",
                [body.name, body.dob, body.gender, body.contact, body.address, body.bloodGroup]
            );
            return NextResponse.json({ id: res.insertId, ...body });
        } else if (dept === "appointments") {
            const [res]: any = await pool.query(
                "INSERT INTO appointments (patientId, doctorId, appointmentDate, appointmentTime, status) VALUES (?, ?, ?, ?, ?)",
                [Number(body.patientId), Number(body.doctorId), body.appointmentDate, body.appointmentTime, body.status || "Scheduled"]
            );
            return NextResponse.json({ id: res.insertId, ...body });
        } else if (dept === "pharmacy") {
            // FIX: Inserting into the correct 'medicines' table
            const [res]: any = await pool.query(
                "INSERT INTO medicines (name, quantity, expiryDate, price) VALUES (?, ?, ?, ?)",
                [body.name, Number(body.quantity), body.expiryDate, Number(body.price)]
            );
            return NextResponse.json({ id: res.insertId, ...body });
        } else if (dept === "financial") {
            const [res]: any = await pool.query(
                "INSERT INTO bills (patientId, amount, billDate, status) VALUES (?, ?, ?, ?)",
                [Number(body.patientId), Number(body.amount), body.billDate, body.status || "Paid"]
            );
            return NextResponse.json({ id: res.insertId, ...body });
        }
        return NextResponse.json({ error: "Invalid write parameters" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ==========================================
// 3. PUT: Update Existing Database Rows
// ==========================================
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dept = searchParams.get("dept");
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: "Missing row target ID parameter" }, { status: 400 });
        }

        if (dept === "patients") {
            await pool.query(
                "UPDATE patients SET name = ?, dob = ?, gender = ?, contact = ?, address = ?, bloodGroup = ? WHERE id = ?",
                [body.name, body.dob?.split("T")[0], body.gender, body.contact, body.address, body.bloodGroup, body.id]
            );
        } else if (dept === "appointments") {
            await pool.query(
                "UPDATE appointments SET patientId = ?, doctorId = ?, appointmentDate = ?, appointmentTime = ?, status = ? WHERE id = ?",
                [Number(body.patientId), Number(body.doctorId), body.appointmentDate?.split("T")[0], body.appointmentTime, body.status, body.id]
            );
        } else if (dept === "pharmacy") {
            // FIX: Updating the correct 'medicines' table matching your exact columns
            await pool.query(
                "UPDATE medicines SET name = ?, quantity = ?, expiryDate = ?, price = ? WHERE id = ?",
                [body.name, Number(body.quantity), body.expiryDate?.split("T")[0], Number(body.price), body.id]
            );
        } else if (dept === "financial") {
            await pool.query(
                "UPDATE bills SET patientId = ?, amount = ?, billDate = ?, status = ? WHERE id = ?",
                [Number(body.patientId), Number(body.amount), body.billDate?.split("T")[0], body.status, body.id]
            );
        }

        return NextResponse.json({ success: true, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ==========================================
// 4. DELETE: Wipe Rows out of Server Logs
// ==========================================
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dept = searchParams.get("dept");
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing deletion key context" }, { status: 400 });

        // FIX: Map 'pharmacy' selection directly to the target 'medicines' string table block
        const tableName = dept === "patients" ? "patients" : dept === "appointments" ? "appointments" : dept === "pharmacy" ? "medicines" : "bills";

        await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}