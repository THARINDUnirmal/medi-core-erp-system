import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET /Api/financial        → list all bills
// GET /Api/financial?id=1   → get one bill
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM bills WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM bills ORDER BY createdAt DESC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /Api/financial → create a new bill
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.patientId || !body.amount || !body.billDate) {
    return NextResponse.json(
      { error: "patientId, amount, and billDate are required" },
      { status: 400 }
    );
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO bills (patientId, amount, billDate, status) VALUES (?, ?, ?, ?)",
      [body.patientId, body.amount, body.billDate, body.status || "Unpaid"]
    );

    return NextResponse.json(
      { id: result.insertId, ...body, status: body.status || "Unpaid" },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PUT /Api/financial → update an existing bill (e.g. mark as paid)
export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await pool.query(
      "UPDATE bills SET patientId = ?, amount = ?, billDate = ?, status = ? WHERE id = ?",
      [body.patientId, body.amount, body.billDate, body.status, body.id]
    );
    return NextResponse.json({ message: "Bill updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /Api/financial?id=1 → delete a bill
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await pool.query("DELETE FROM bills WHERE id = ?", [id]);
    return NextResponse.json({ message: "Bill deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}