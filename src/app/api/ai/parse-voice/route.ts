import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, language, context } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Function Calling Schema definition (as requested in spec)
    const functionSchemas = [
      {
        name: 'create_transaction',
        description: 'Mencatat transaksi pengeluaran, pemasukan, atau transfer antar rekening',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['expense', 'income', 'transfer'] },
            amount: { type: 'number', description: 'Nominal transaksi dalam Rupiah' },
            category: { type: 'string', description: 'Nama kategori atau ID kategori' },
            account: { type: 'string', description: 'Nama akun asal' },
            to_account: { type: 'string', description: 'Nama akun tujuan jika transfer' },
            description: { type: 'string', description: 'Keterangan transaksi' },
          },
          required: ['type', 'amount'],
        },
      },
      {
        name: 'query_financial_summary',
        description: 'Mendapatkan laporan dan analisis ringkas kondisi finansial user',
        parameters: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['this_month', 'last_month', 'this_year', 'custom'] },
            metric: { type: 'string', enum: ['total_expense', 'total_income', 'balance', 'category_breakdown', 'overall_health'] },
          },
          required: ['period'],
        },
      },
    ];

    // Return structured payload
    return NextResponse.json({
      success: true,
      transcript,
      schemaReference: functionSchemas,
      message: 'Processed successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
