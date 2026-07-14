import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

let razorpay: Razorpay | null = null;
if (razorpayKeyId && razorpayKeyId !== 'rzp_test_placeholder') {
  try {
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  } catch (e) {
    console.warn('Razorpay initialization failed:', e);
  }
}

export async function POST(req: Request) {
  try {
    const { plan } = await req.json().catch(() => ({}));
    let amount = 14900; // default ₹149 (Launch Offer)
    if (plan === 'regular') {
      amount = 29900; // ₹299
    } else if (plan === 'premium') {
      amount = 49900; // ₹499
    }

    // If no real keys are provided, we simulate a successful order creation for test mode
    if (!razorpay) {
      console.log('No real Razorpay keys found, simulating order creation.');
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount,
        currency: 'INR',
        keyId: razorpayKeyId, // sending placeholder key
        isMock: true
      });
    }

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId
    });
  } catch (error: any) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order', details: error.message }, { status: 500 });
  }
}
