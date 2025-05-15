import { NextResponse } from 'next/server';
import { pool } from '@/lib/mariadb/conn';

async function testDbConnecion() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const result = await testDbConnecion();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
