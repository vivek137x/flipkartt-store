# 🚀 Deploy Guide — Flipkart Store with Cashfree Payment

## Payment Gateway: Cashfree (Production)
- App ID: `12819579c067580e`  
- Environment: PRODUCTION
- Cards, UPI, Net Banking, Wallets — sab work karega
- Payment directly tumhare Cashfree account me aayega

---

## Option 1: Render.com (FREE — Recommended)

### Step 1: GitHub pe upload karo
1. [github.com](https://github.com) → New repository → "flipkart-store"
2. Upload all files from this zip (drag & drop)
3. Commit

### Step 2: Render.com pe deploy
1. [render.com](https://render.com) → Sign up (free)
2. "New Web Service" → Connect GitHub → Select "flipkart-store"
3. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Environment Variables add karo:
   - `CASHFREE_APP_ID` = `12819579c067580e`
   - `CASHFREE_SECRET_KEY` = `cfsk_ma_prod_c6567ced394e015447165a80863a70dd_3ac6ec21`
   - `NODE_ENV` = `production`
5. "Create Web Service" → Deploy!

✅ Tumhe milega: `https://flipkart-store.onrender.com`

---

## Option 2: Railway.app (Easier)

1. [railway.app](https://railway.app) → Login with GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add Environment Variables (same as above)
5. Deploy!

✅ Tumhe milega: `https://flipkart-store.up.railway.app`

---

## Cashfree Dashboard me Return URL set karo

1. Login → [merchant.cashfree.com](https://merchant.cashfree.com)
2. Settings → Payment Gateway → Return URL
3. Set: `https://YOUR-APP-URL.onrender.com/payment-return`

---

## Test Payment (Pehle test karo)

Cashfree Test Cards:
- Card: `4111 1111 1111 1111`
- Expiry: `12/2026`  
- CVV: `123`
- OTP: `123456`

UPI Test: `success@cashfree`
