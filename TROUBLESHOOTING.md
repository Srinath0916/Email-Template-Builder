# Troubleshooting Guide

## Common Issues & Solutions

### Installation Issues

#### Problem: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json

# Reinstall
npm run install-all
```

#### Problem: Python/node-gyp errors during bcrypt installation
**Solution:**
```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential

# Or use bcryptjs instead (pure JavaScript)
npm uninstall bcrypt
npm install bcryptjs
# Update imports in authController.js
```

### MongoDB Issues

#### Problem: MongoDB connection refused
**Symptoms:** `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
```bash
# macOS
brew services list
brew services start mongodb-community

# Linux
sudo systemctl status mongod
sudo systemctl start mongod

# Or run directly
mongod
```

2. Verify connection string in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/email-builder
```

3. Check MongoDB port:
```bash
# Default is 27017
lsof -i :27017
```

#### Problem: Authentication failed
**Solution:**
If MongoDB has authentication enabled:
```
MONGODB_URI=mongodb://username:password@localhost:27017/email-builder
```

#### Problem: Database not found
**Solution:**
MongoDB creates databases automatically. Just ensure the connection string is correct.

### Server Issues

#### Problem: Port already in use
**Symptoms:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change port in `.env`:
```
PORT=5001
```

2. Or kill the process using the port:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or find and kill manually
lsof -i :5000
kill -9 <PID>
```

#### Problem: CORS errors
**Symptoms:** `Access-Control-Allow-Origin` errors in browser console

**Solution:**
Ensure CORS is enabled in `server/server.js`:
```javascript
const cors = require('cors');
app.use(cors());
```

For production, specify allowed origins:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

#### Problem: JWT token invalid
**Symptoms:** 401 Unauthorized errors

**Solutions:**
1. Check JWT_SECRET in `.env` matches between environments
2. Token might be expired (7-day expiry)
3. Clear localStorage and login again:
```javascript
localStorage.clear();
```

### Frontend Issues

#### Problem: React app won't start
**Symptoms:** `Error: Cannot find module 'react-scripts'`

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Problem: Proxy not working
**Symptoms:** API calls fail with 404

**Solution:**
Ensure `proxy` is set in `client/package.json`:
```json
"proxy": "http://localhost:5000"
```

Restart the React dev server after changing proxy.

#### Problem: Drag and drop not working
**Solutions:**
1. Check React DnD is installed:
```bash
cd client
npm list react-dnd react-dnd-html5-backend
```

2. Ensure DndProvider wraps components:
```javascript
<DndProvider backend={HTML5Backend}>
  <YourComponent />
</DndProvider>
```

3. Check browser console for errors

#### Problem: Images not loading
**Solutions:**
1. Check image URL is valid and accessible
2. Check CORS on image host
3. Use placeholder service for testing:
```
https://via.placeholder.com/600x200
```

### Authentication Issues

#### Problem: Can't login after signup
**Solution:**
1. Check password is being hashed:
```javascript
// In authController.js
const hashedPassword = await bcrypt.hash(password, 10);
```

2. Check password comparison:
```javascript
const isPasswordValid = await bcrypt.compare(password, user.password);
```

3. Check JWT secret is set in `.env`

#### Problem: Token not persisting
**Solution:**
Check localStorage is working:
```javascript
// In browser console
localStorage.getItem('token')
```

If null, check AuthContext is saving token:
```javascript
localStorage.setItem('token', token);
```

#### Problem: Redirected to login constantly
**Solutions:**
1. Check token is in localStorage
2. Check token is being sent in headers:
```javascript
headers: { Authorization: `Bearer ${token}` }
```

3. Check middleware is verifying correctly

### Template Issues

#### Problem: Templates not saving
**Solutions:**
1. Check JWT token is valid
2. Check MongoDB connection
3. Check browser console for errors
4. Check server logs for errors

#### Problem: Templates not loading
**Solutions:**
1. Check template ID is correct
2. Check user owns the template
3. Check MongoDB query:
```javascript
Template.findOne({ _id: id, userId: userId })
```

#### Problem: Blocks not rendering
**Solutions:**
1. Check block structure matches schema
2. Check block type is valid (text/image/button/divider)
3. Check console for errors
4. Verify blocks array in state

### Export Issues

#### Problem: HTML export not downloading
**Solutions:**
1. Check browser allows downloads
2. Check blob creation:
```javascript
const blob = new Blob([html], { type: 'text/html' });
```

3. Try different browser
4. Check browser console for errors

#### Problem: Exported HTML looks wrong
**Solutions:**
1. Open HTML in browser to test
2. Check inline styles are applied
3. Test in email client (Gmail, Outlook)
4. Validate HTML structure

### Test Issues

#### Problem: Tests failing
**Solutions:**
1. Check MongoDB test database:
```
MONGODB_URI=mongodb://localhost:27017/email-builder-test
```

2. Ensure test database is separate from dev
3. Check JWT_SECRET in test environment
4. Run tests individually:
```bash
npm test -- auth.test.js
```

#### Problem: Test timeout
**Solution:**
Increase timeout in test:
```javascript
jest.setTimeout(10000); // 10 seconds
```

### Development Issues

#### Problem: Hot reload not working
**Solutions:**
1. Restart dev server
2. Check file is saved
3. Clear browser cache
4. Check for syntax errors

#### Problem: Changes not reflecting
**Solutions:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Check correct file is being edited
4. Restart dev server

### Production Issues

#### Problem: Build fails
**Solutions:**
1. Check for console.log statements
2. Check for unused imports
3. Fix all warnings
4. Run build locally first:
```bash
cd client
npm run build
```

#### Problem: Environment variables not working
**Solutions:**
1. Check `.env` file exists
2. Restart server after changing `.env`
3. For React, prefix with `REACT_APP_`:
```
REACT_APP_API_URL=https://api.example.com
```

4. Access in React:
```javascript
process.env.REACT_APP_API_URL
```

## Debugging Tips

### Backend Debugging
```javascript
// Add logging
console.log('Request body:', req.body);
console.log('User ID:', req.userId);
console.log('Token:', req.headers.authorization);

// Use debugger
debugger;

// Check MongoDB queries
const result = await Template.find({ userId });
console.log('Found templates:', result);
```

### Frontend Debugging
```javascript
// Check state
console.log('Blocks:', blocks);
console.log('Selected block:', selectedBlock);

// Check API calls
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Network Debugging
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Test API endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Check with token
curl -X GET http://localhost:5000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Getting Help

### Check Logs
```bash
# Server logs
npm run server

# Client logs
cd client && npm start

# MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Verify Setup
```bash
# Check Node version (should be 14+)
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check if MongoDB is running
ps aux | grep mongod
```

### Clean Install
If all else fails, start fresh:
```bash
# Backup your .env file
cp .env .env.backup

# Remove everything
rm -rf node_modules client/node_modules
rm package-lock.json client/package-lock.json

# Reinstall
npm run install-all

# Restore .env
cp .env.backup .env

# Start fresh
npm run dev
```

## Still Having Issues?

1. Check the error message carefully
2. Search for the error online
3. Check GitHub issues for similar problems
4. Review the documentation files
5. Check browser console for frontend errors
6. Check server terminal for backend errors
7. Verify all dependencies are installed
8. Ensure MongoDB is running
9. Check environment variables are set
10. Try the clean install steps above

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `ECONNREFUSED` | MongoDB not running | Start MongoDB |
| `EADDRINUSE` | Port already in use | Change port or kill process |
| `Invalid token` | JWT expired or wrong | Login again |
| `User already exists` | Email in use | Use different email |
| `Cannot find module` | Missing dependency | Run `npm install` |
| `Unauthorized` | No/invalid token | Check authentication |
| `Template not found` | Wrong ID or not owner | Check template ID |
| `Network Error` | Server not running | Start server |
| `CORS error` | CORS not configured | Enable CORS |
| `MongoError` | Database issue | Check MongoDB |
