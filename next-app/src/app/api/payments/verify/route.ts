import { NextResponse } from 'next/server';
import crypto from 'crypto';

const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    // Handle Mock verification (when no keys are provided)
    if (isMock || razorpay_order_id?.startsWith('order_mock_')) {
      return NextResponse.json({ verified: true, paymentId: razorpay_payment_id || `pay_mock_${Date.now()}` });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay parameters' }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });

  } catch (error: any) {
    console.error('Payment Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment', details: error.message }, { status: 500 });
  }
}
