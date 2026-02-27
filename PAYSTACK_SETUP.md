# Paystack Payment Integration Setup

This guide will help you set up Paystack payment integration for the application form.

## Environment Variables Required

You need to add the following environment variables to your `.env.local` file:

```env
# Paystack Secret Key (from your Paystack dashboard)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Your application URL (for production, use your actual domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Your Paystack Keys

1. **Sign up/Login to Paystack**: Go to [https://paystack.com](https://paystack.com) and create an account or login.

2. **Get Your API Keys**:
   - Go to your Paystack Dashboard
   - Navigate to **Settings** → **API Keys & Webhooks**
   - Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
   - For testing, use the **Test Secret Key**

3. **Add to Environment Variables**:
   - Create or edit `.env.local` in your project root
   - Add the `PAYSTACK_SECRET_KEY` variable
   - Add the `NEXT_PUBLIC_APP_URL` variable

## Testing the Integration

1. **Test Mode**: Use test keys (starts with `sk_test_`)
   - Test card: `4084084084084081`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - PIN: Any 4 digits
   - OTP: `123456`

2. **Live Mode**: Use live keys (starts with `sk_live_`)
   - Only use in production
   - Real payments will be processed

## How It Works

1. User fills out the application form
2. User clicks "Pay ₦25,000 with Paystack" button
3. System initializes a Paystack transaction via API
4. User is redirected to Paystack payment page
5. User completes payment on Paystack
6. User is redirected back to application page with payment reference
7. Submit button is enabled after successful payment

## Troubleshooting

### Error: "Please enter a valid Key" or "Invalid API key"
1. **Verify the key is set correctly**:
   - Make sure `PAYSTACK_SECRET_KEY` is set in your `.env.local` file
   - The key should start with `sk_test_` for test mode or `sk_live_` for live mode
   - No extra spaces, quotes, or newlines around the key

2. **Get a fresh key from Paystack**:
   - Go to [Paystack Dashboard](https://dashboard.paystack.com)
   - Navigate to **Settings** → **API Keys & Webhooks**
   - Click **Reset** next to your test secret key to generate a new one
   - Copy the new key and update your `.env.local` file

3. **Restart your server**:
   - Stop your development server (Ctrl+C)
   - Run `npm run dev` again to load the new environment variables

4. **Test the key**:
   - Visit `http://localhost:3000/api/payments/verify` in your browser
   - This will verify if your API key is working correctly

### Error: "Payment service is not configured"
- Check that `PAYSTACK_SECRET_KEY` exists in your `.env.local` file
- Make sure you're using the correct key format (starts with `sk_test_` or `sk_live_`)
- Restart your development server after adding the environment variable

### Error: "Invalid API key format"
- Your key must start with `sk_test_` (for test) or `sk_live_` (for live)
- Make sure there are no extra characters or spaces
- Copy the key directly from Paystack dashboard without modifications

### Payment not redirecting
- Check browser console for errors (F12 → Console tab)
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in `.env.local`
- Make sure the API route `/api/payments/initialize` is accessible
- Check the Network tab in browser DevTools to see the API response

### Test Keys Not Working
If your test keys are not working:

1. **Verify you're using test keys**:
   - Test keys start with `sk_test_`
   - Live keys start with `sk_live_`
   - Make sure you're using the correct one for your environment

2. **Check Paystack account status**:
   - Make sure your Paystack account is active
   - Verify you haven't exceeded any rate limits
   - Check if your account has any restrictions

3. **Try resetting the key**:
   - In Paystack Dashboard → Settings → API Keys & Webhooks
   - Click **Reset** to generate a new test secret key
   - Update your `.env.local` with the new key
   - Restart your server

4. **Check server logs**:
   - Look at your terminal/console where the dev server is running
   - Check for any error messages related to Paystack API calls
   - The logs will show detailed error information

5. **Test the API directly**:
   - Visit `http://localhost:3000/api/payments/verify` to test your key
   - This endpoint will tell you if your key is valid and working

## Security Notes

- **Never commit** `.env.local` to version control
- Use test keys for development
- Use live keys only in production
- Keep your secret keys secure and never expose them in client-side code
