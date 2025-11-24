# 🚀 Installation & Setup Guide

## Complete Setup Instructions for Production-Grade Email Builder

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** v14 or higher
- ✅ **MongoDB** installed and running
- ✅ **npm** or **yarn** package manager

---

## 🔧 Step-by-Step Installation

### 1️⃣ Install Backend Dependencies

```bash
# From project root
npm install
```

**New dependencies installed:**
- `cookie-parser` - Parse HTTP cookies
- `express-rate-limit` - Rate limiting middleware
- `nodemailer` - Email sending

### 2️⃣ Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

**Frontend already has:**
- `framer-motion` - Animations
- `react-icons` - Icons
- `react-toastify` - Toast notifications
- `tailwindcss` - Utility CSS

### 3️⃣ Configure Environment Variables

The `.env` file has been updated with new variables:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/email-builder

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_ACCESS_SECRET=your_access_token_secret_min_32_chars_change_in_production_abc123
JWT_REFRESH_SECRET=your_refresh_token_secret_min_32_chars_change_in_production_xyz789

# Email Configuration (Development - uses Ethereal)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="EmailBuilder Pro <noreply@emailbuilder.com>"

# Cookie Domain
COOKIE_DOMAIN=localhost
```

**For Development:**
- Leave SMTP fields empty to use Ethereal (fake SMTP for testing)
- Email preview URLs will be logged to console

**For Production:**
- Set real SMTP credentials (Gmail, SendGrid, AWS SES, etc.)
- Change JWT secrets to strong random strings
- Set NODE_ENV=production

### 4️⃣ Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod

# Linux
sudo systemctl start mongod
```

### 5️⃣ Start the Application

```bash
# Start both backend and frontend
npm run dev
```

This will start:
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:3000

---

## 🧪 Testing the Implementation

### Test Authentication Flow

1. **Signup**:
   ```
   - Go to http://localhost:3000/signup
   - Create an account
   - Should redirect to /home
   - Check browser DevTools → Application → Cookies
   - You should see: refreshToken, accessToken (httpOnly)
   ```

2. **Login**:
   ```
   - Go to http://localhost:3000/login
   - Login with credentials
   - Should redirect to /home
   - Cookies should be set
   ```

3. **Token Refresh** (Automatic):
   ```
   - Wait 15 minutes (or change expiry in tokenUtils.js for testing)
   - Make any API request
   - Check Network tab - should see automatic /api/auth/refresh call
   - New tokens issued automatically
   ```

4. **Logout**:
   ```
   - Click user menu → Logout
   - Cookies should be cleared
   - Should redirect to /login
   ```

### Test Forgot Password Flow

1. **Request OTP**:
   ```
   - Click "Forgot password?" on login page
   - Enter your email
   - Check console for Ethereal preview URL
   - Open URL to see OTP email
   ```

2. **Verify OTP**:
   ```
   - Copy 6-digit code from email
   - Enter in modal
   - Should proceed to password reset
   ```

3. **Reset Password**:
   ```
   - Enter new password
   - Confirm password
   - Should show success message
   - Login with new password
   ```

### Test Template Sharing

1. **Share Template**:
   ```
   - Create/edit a template
   - Click "Share" button
   - Enter recipient email
   - Check console for Ethereal preview URL
   - Verify email contains template HTML
   ```

### Test Chat & Favourites

1. **Save Chat** (via API):
   ```bash
   curl -X POST http://localhost:5001/api/chats \
     -H "Content-Type: application/json" \
     -H "Cookie: accessToken=YOUR_TOKEN" \
     -d '{"role":"user","message":"Hello world"}'
   ```

2. **View Chats**:
   ```
   - Go to /chats
   - Should see saved messages
   - Click heart to favourite
   - Click trash to delete
   ```

3. **View Favourites**:
   ```
   - Go to /favourites
   - Should see favourited items
   - Filter by type (templates/chats)
   ```

---

## 📁 Project Structure

```
email-template-builder/
├── server/
│   ├── controllers/
│   │   ├── authController.js       ✨ NEW - Complete auth
│   │   ├── chatController.js       ✨ NEW
│   │   ├── favouriteController.js  ✨ NEW
│   │   ├── shareController.js      ✨ NEW
│   │   └── templateController.js
│   ├── middleware/
│   │   ├── auth.js                 ✏️ UPDATED
│   │   └── rateLimiter.js          ✨ NEW
│   ├── models/
│   │   ├── User.js                 ✏️ UPDATED
│   │   ├── Template.js             ✏️ UPDATED
│   │   ├── ChatMessage.js          ✨ NEW
│   │   └── Favourite.js            ✨ NEW
│   ├── routes/
│   │   ├── authRoutes.js           ✏️ UPDATED
│   │   ├── chatRoutes.js           ✨ NEW
│   │   ├── favouriteRoutes.js      ✨ NEW
│   │   ├── shareRoutes.js          ✨ NEW
│   │   └── templateRoutes.js
│   ├── utils/
│   │   ├── tokenUtils.js           ✨ NEW
│   │   ├── emailService.js         ✨ NEW
│   │   └── htmlExport.js           ✨ NEW
│   └── server.js                   ✏️ UPDATED
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── modals/
│       │   │   ├── ForgotPasswordModal.js  ✨ NEW
│       │   │   └── ShareModal.js           ✨ NEW
│       │   └── ui/
│       │       └── Navbar.js               ✏️ UPDATED
│       ├── context/
│       │   └── AuthContext.js              ✏️ UPDATED
│       ├── pages/
│       │   ├── Login.js                    ✏️ UPDATED
│       │   ├── Signup.js                   ✏️ UPDATED
│       │   ├── Dashboard.js                ✏️ UPDATED
│       │   ├── Editor.js                   ✏️ UPDATED
│       │   ├── Chats.js                    ✨ NEW
│       │   └── Favourites.js               ✨ NEW
│       └── App.js                          ✏️ UPDATED
│
├── .env                                    ✏️ UPDATED
├── .env.example                            ✏️ UPDATED
├── package.json                            ✏️ UPDATED
├── PRODUCTION_AUTH_IMPLEMENTATION.md       ✨ NEW
└── INSTALLATION_GUIDE.md                   ✨ NEW (this file)
```

---

## 🔐 Security Features

### Implemented Security Measures:

1. **Token Security**:
   - ✅ Access tokens: 15 minutes
   - ✅ Refresh tokens: 7 days
   - ✅ httpOnly cookies (XSS protection)
   - ✅ Secure flag (HTTPS only in production)
   - ✅ SameSite=Lax (CSRF protection)
   - ✅ Token rotation on refresh
   - ✅ Hashed storage in database

2. **Password Security**:
   - ✅ bcrypt hashing (10 salt rounds)
   - ✅ Minimum 6 characters
   - ✅ Never stored in plain text

3. **Rate Limiting**:
   - ✅ Auth endpoints: 5 req/15min
   - ✅ Forgot password: 3 req/hour
   - ✅ Refresh: 10 req/15min
   - ✅ General API: 100 req/15min

4. **OTP Security**:
   - ✅ 6-digit numeric code
   - ✅ 10-minute expiry
   - ✅ Hashed storage
   - ✅ One-time use

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/signup           - Create account
POST   /api/auth/login            - Login
POST   /api/auth/refresh          - Refresh tokens
POST   /api/auth/logout           - Logout
POST   /api/auth/forgot-password  - Send OTP
POST   /api/auth/verify-otp       - Verify OTP
POST   /api/auth/reset-password   - Reset password
GET    /api/auth/me               - Get current user
```

### Templates
```
GET    /api/templates             - List templates
POST   /api/templates             - Create template
GET    /api/templates/:id         - Get template
PUT    /api/templates/:id         - Update template
DELETE /api/templates/:id         - Delete template
```

### Chats
```
GET    /api/chats                 - List chats
POST   /api/chats                 - Save chat
DELETE /api/chats/:id             - Delete chat
PATCH  /api/chats/:id/favourite   - Toggle favourite
```

### Favourites
```
GET    /api/favourites            - List favourites
POST   /api/favourites            - Toggle favourite
DELETE /api/favourites/:id        - Remove favourite
```

### Share
```
POST   /api/share                 - Share template via email
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error
**Solution:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod

# Or with Homebrew
brew services start mongodb-community
```

### Issue: Port Already in Use
**Solution:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change PORT in .env
PORT=5002
```

### Issue: Cookies Not Being Set
**Solution:**
- Check CORS configuration in `server/server.js`
- Ensure `credentials: true` in axios config
- Verify `CLIENT_URL` in `.env` matches frontend URL

### Issue: Email Not Sending
**Solution:**
- Check console for Ethereal preview URL (development)
- For production, verify SMTP credentials
- Test with a service like Mailtrap first

### Issue: Token Refresh Not Working
**Solution:**
- Check browser DevTools → Application → Cookies
- Verify `refreshToken` cookie exists
- Check console for errors
- Ensure axios interceptor is set up

---

## 📚 Additional Documentation

- **PRODUCTION_AUTH_IMPLEMENTATION.md** - Complete feature documentation
- **README.md** - Project overview
- **QUICKSTART.md** - Quick setup guide
- **UI_UPGRADE_SUMMARY.md** - UI redesign details

---

## 🚀 Production Deployment

### Before Deploying:

1. **Generate Strong JWT Secrets**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Environment Variables**:
   - Set `NODE_ENV=production`
   - Use real SMTP credentials
   - Set correct `CLIENT_URL`
   - Set `COOKIE_DOMAIN` to your domain

3. **Enable HTTPS**:
   - Required for secure cookies
   - Use Let's Encrypt or cloud provider SSL

4. **Database**:
   - Use MongoDB Atlas or managed MongoDB
   - Set up backups
   - Create indexes

5. **Build Frontend**:
   ```bash
   cd client
   npm run build
   ```

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] MongoDB connection successful
- [ ] Can signup new user
- [ ] Can login
- [ ] Cookies are set (check DevTools)
- [ ] Can create template
- [ ] Can save template
- [ ] Can logout
- [ ] Forgot password sends email
- [ ] OTP verification works
- [ ] Password reset works
- [ ] Token refresh works automatically
- [ ] Share template sends email
- [ ] Chat history works
- [ ] Favourites work

---

## 🎉 You're Ready!

Your production-grade Email Template Builder is now fully set up with:

✅ Secure authentication
✅ Token rotation
✅ Password reset
✅ Chat history
✅ Favourites
✅ Email sharing
✅ Rate limiting
✅ Premium UI

**Start building amazing email templates!** 🚀
