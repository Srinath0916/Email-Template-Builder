# Email Template Builder

A drag and drop email template builder for creating responsive email templates easily.

## What it does

This is my project for building email templates without writing HTML code. You can drag blocks like text, images, buttons etc and create email templates. It also has user authentication and you can save your templates.

## Features

- Drag & Drop Builder - add text, images, buttons, dividers
- User Login/Signup with JWT tokens
- Save and edit templates
- Export to HTML
- Send templates to email addresses
- Mark templates as favourites
- Password reset (OTP via email)

## Technologies Used

**Frontend:**
- React
- React DnD for drag and drop
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API calls

**Backend:**
- Node.js + Express
- MongoDB database
- JWT for authentication
- Nodemailer for sending emails
- bcrypt for password hashing

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed or MongoDB Atlas account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd email-template-builder
```

2. Install server dependencies
```bash
npm install
```

3. Install client dependencies
```bash
cd client
npm install
cd ..
```

4. Create .env file in root directory
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
PORT=5001
```

5. Run the application
```bash
# Run both client and server
npm run dev

# Or run separately:
# Server: npm run server
# Client: cd client && npm start
```

## How to Use

1. Sign up for an account
2. Login with your credentials
3. Click "Create New Template"
4. Drag blocks from left panel to canvas
5. Click on blocks to edit their properties
6. Save your template
7. Export as HTML or send via email

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── utils/         # Helper functions
│   └── public/
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Helper functions
└── package.json

```

## Known Issues

- Sometimes the drag and drop can be a bit glitchy on slower computers
- Email sending uses Ethereal in development (fake emails)

## Future Improvements

- Add more block types (columns, spacers)
- Template preview before sending
- Bulk email sending
- Template categories/tags
- Better mobile responsiveness

## License

MIT
