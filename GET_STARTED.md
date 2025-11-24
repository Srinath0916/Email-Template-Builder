# 🚀 Get Started in 3 Minutes

## Quick Setup

### 1️⃣ Install Everything
```bash
npm run install-all
```
This installs all dependencies for both backend and frontend.

### 2️⃣ Start MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod
```

### 3️⃣ Start the App
```bash
npm run dev
```

This starts:
- ✅ Backend API on http://localhost:5000
- ✅ Frontend React app on http://localhost:3000

### 4️⃣ Open Your Browser
Navigate to: **http://localhost:3000**

## First Steps

1. **Sign Up** - Create your account
2. **Login** - Access the dashboard
3. **Create Template** - Click "Create New Template"
4. **Drag Blocks** - Drag blocks from left palette to canvas
5. **Edit Blocks** - Click any block to customize it
6. **Save** - Click "Save" button
7. **Export** - Click "Export HTML" to download

## What You Can Do

### 📝 Text Block
- Add headings, paragraphs, any text
- Customize color, size, alignment

### 🖼️ Image Block
- Add images via URL
- Displays in email template

### 🔘 Button Block
- Create call-to-action buttons
- Customize text, colors

### ➖ Divider Block
- Add horizontal separators
- Organize your content

## Tips

- **Reorder blocks**: Drag blocks up/down in canvas
- **Delete blocks**: Hover and click the X button
- **Edit properties**: Click any block to open editor
- **Save often**: Changes are saved to MongoDB
- **Export HTML**: Download email-ready HTML

## Need Help?

- 📖 Full docs: See `README.md`
- 🏃 Quick guide: See `QUICKSTART.md`
- 🧪 Testing: See `TESTING.md`
- 🚀 Deploy: See `DEPLOYMENT.md`

## Troubleshooting

**MongoDB not connecting?**
- Make sure MongoDB is running: `mongod`
- Check `.env` file has correct `MONGODB_URI`

**Port already in use?**
- Change `PORT` in `.env` to 5001 or another port

**Module not found?**
- Run `npm run install-all` again

## Sample Template

Want to see an example? Check `sample-template.json` for a complete template structure.

## What's Next?

- Build your first email template
- Export and test in email client
- Deploy to production (see `DEPLOYMENT.md`)
- Add more features!

---

**Enjoy building beautiful email templates! 🎨**
