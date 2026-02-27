import { NextRequest, NextResponse } from 'next/server';

// This endpoint helps verify if Paystack API keys are working
export async function GET(request: NextRequest) {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json({
        success: false,
        message: 'PAYSTACK_SECRET_KEY is not set in environment variables',
        keyExists: false
      });
    }

    // Check key format
    const isTestKey = paystackSecretKey.startsWith('sk_test_');
    const isLiveKey = paystackSecretKey.startsWith('sk_live_');
    
    if (!isTestKey && !isLiveKey) {
      return NextResponse.json({
        success: false,
        message: 'Invalid API key format. Key should start with sk_test_ or sk_live_',
        keyExists: true,
        keyFormat: 'invalid',
        keyPrefix: paystackSecretKey.substring(0, 10) + '...'
      });
    }

    // Try to verify the key by making a simple API call
    try {
      const response = await fetch('https://api.paystack.co/bank', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'Paystack API key is valid and working',
          keyExists: true,
          keyFormat: isTestKey ? 'test' : 'live',
          keyPrefix: paystackSecretKey.substring(0, 10) + '...',
          apiStatus: 'connected'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: data.message || 'API key validation failed',
          keyExists: true,
          keyFormat: isTestKey ? 'test' : 'live',
          keyPrefix: paystackSecretKey.substring(0, 10) + '...',
          apiStatus: 'failed',
          error: data.message
        });
      }
    } catch (apiError: any) {
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to Paystack API',
        keyExists: true,
        keyFormat: isTestKey ? 'test' : 'live',
        keyPrefix: paystackSecretKey.substring(0, 10) + '...',
        apiStatus: 'connection_error',
        error: apiError.message
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Error verifying Paystack configuration',
      error: error.toString()
    });
  }
}

