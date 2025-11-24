# Quick Start Guide

## Prerequisites
- Node.js v14+ installed
- MongoDB installed and running

## Installation & Setup (5 minutes)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start MongoDB
If you have MongoDB installed locally:
```bash
# macOS/Linux
mongod

# Or if using Homebrew on macOS
brew services start mongodb-community
```

### 3. Configure Environment
The `.env` file is already created with default values. You can modify if needed:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/email-builder
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### 4. Start the Application
```bash
npm run dev
```

This starts:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### 5. Use the Application

1. Open http://localhost:3000
2. Click "Sign up" to create an account
3. Login with your credentials
4. Click "Create New Template"
5. Drag blocks from the left palette to the canvas
6. Click blocks to edit their properties
7. Save your template
8. Export to HTML

## Testing

Run backend tests:
```bash
npm test
```

Run frontend tests:
```bash
cd client
npm test
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check the connection string in `.env`

### Port Already in Use
- Change the PORT in `.env` to another port (e.g., 5001)

### Module Not Found
- Run `npm run install-all` again
- Delete `node_modules` folders and reinstall

## Features to Try

1. **Drag & Drop**: Drag blocks from palette to canvas
2. **Reorder**: Drag blocks within canvas to reorder
3. **Edit**: Click any block to edit its properties
4. **Delete**: Hover over a block and click the X button
5. **Save**: Save your template to MongoDB
6. **Load**: Load existing templates from dashboard
7. **Export**: Export your template as HTML file

Enjoy building email templates! 🎨
