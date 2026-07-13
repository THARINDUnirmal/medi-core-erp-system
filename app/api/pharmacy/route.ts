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

// GET: Fetch complete stock inventory
export async function GET() {
    try {
        const [rows] = await pool.query("SELECT * FROM medicines ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Register a new medicine stock batch
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, quantity, expiryDate, price } = body;

        const [result]: any = await pool.query(
            "INSERT INTO medicines (name, quantity, expiryDate, price) VALUES (?, ?, ?, ?)",
            [name, Number(quantity), expiryDate, Number(price)]
        );

        return NextResponse.json({
            id: result.insertId,
            name,
            quantity: Number(quantity),
            expiryDate,
            price: Number(price)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Modify structural inventory item values (CRUD / Editing / Issuing)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, quantity, expiryDate, price } = body;

        await pool.query(
            "UPDATE medicines SET name = ?, quantity = ?, expiryDate = ?, price = ? WHERE id = ?",
            [name, Number(quantity), expiryDate, Number(price), id]
        );

        return NextResponse.json({ id, name, quantity: Number(quantity), expiryDate, price: Number(price) });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Terminate inventory record batch completely
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        await pool.query("DELETE FROM medicines WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}