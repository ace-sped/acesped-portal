# Quick Paystack Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Paystack Key
1. Go to [https://paystack.com](https://paystack.com) and sign up
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Public Key** (starts with `pk_test_`)

### Step 2: Add Environment Variable
Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
```

### Step 3: Test It!
```bash
npm run dev
```

Go to: `http://localhost:3000/application`

Fill the form and test payment with:
- **Test Card**: `4084 0840 8408 4081`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **PIN**: `1234`

## ✅ That's It!

No npm packages to install. The Paystack script loads automatically from their CDN.

## 📋 What's Changed

### Before (Manual Payment)
```
❌ Bank transfer details
❌ Manual payment method selection
❌ Manual reference entry
❌ Upload payment proof
❌ Wait for verification
```

### After (Paystack)
```
✅ One-click payment button
✅ Card/Bank/Mobile Money/USSD
✅ Automatic reference generation
✅ Instant payment verification
✅ Submit application immediately
```

## 🎯 Features

### Payment Page Now Has:
- 💳 **Paystack Payment Button** - Opens secure popup
- 🔒 **Multiple Payment Methods** - Card, Bank, Mobile Money, USSD
- ⚡ **Instant Verification** - No manual checking needed
- 🎉 **Success Confirmation** - Shows transaction reference
- 🚫 **Disabled Submit** - Until payment is completed

### User Experience:
1. User reaches payment step
2. Clicks "Pay ₦25,000 with Paystack"
3. Paystack popup opens
4. Selects payment method & pays
5. Payment confirmed instantly
6. Transaction reference saved
7. Submit button enabled
8. Application submitted!

## 💡 Testing Tips

### Test Mode (Development)
- Use `pk_test_` keys
- No real money charged
- Use test cards listed above

### Live Mode (Production)
- Switch to `pk_live_` key
- Complete Paystack business verification
- Real payments processed

## 🔧 Troubleshooting

### Payment button not working?
- ✅ Check `.env.local` file exists
- ✅ Verify public key is correct
- ✅ Restart dev server after adding `.env.local`
- ✅ Check browser console for errors

### "Payment declined"?
- In test mode: Use correct test card
- Check card details are correct
- Try different test card

### Button still disabled after payment?
- Check browser console for errors
- Verify callback is firing
- Clear browser cache

## 📚 Full Documentation

For detailed information, see:
- `PAYSTACK_SETUP.md` - Complete setup guide
- `APPLICATION_FLOW.md` - Application system overview

## 🆘 Support

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Test Cards**: https://paystack.com/docs/payments/test-payments

---

## Summary

✅ **No dependencies to install** - Uses Paystack CDN  
✅ **One environment variable** - Just add your public key  
✅ **Instant payments** - No manual verification  
✅ **Multiple payment methods** - Card, Bank, Mobile Money, USSD  
✅ **Secure** - PCI compliant, encrypted  
✅ **User-friendly** - Clean, modern interface  

**Ready to accept payments! 🎉**

