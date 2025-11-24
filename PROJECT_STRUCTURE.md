# Project Structure & Implementation Details

## Overview
Full-stack email template builder with drag-and-drop functionality, authentication, and HTML export.

## Architecture

### Frontend (React)
```
client/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── components/             # Reusable components
│   │   ├── BlockEditor.js      # Edit block properties
│   │   ├── Canvas.js           # Drop zone for blocks
│   │   ├── DraggableCanvasBlock.js  # Individual draggable block
│   │   ├── Palette.js          # Block palette (left sidebar)
│   │   └── ProtectedRoute.js   # Route protection wrapper
│   ├── context/
│   │   └── AuthContext.js      # Global auth state
│   ├── pages/
│   │   ├── Login.js            # Login page
│   │   ├── Signup.js           # Signup page
│   │   ├── Dashboard.js        # Template list
│   │   └── Editor.js           # Main editor page
│   ├── utils/
│   │   └── htmlExport.js       # Convert blocks to HTML
│   ├── App.js                  # Main app with routing
│   └── index.js                # React entry point
└── package.json
```

### Backend (Node.js/Express)
```
server/
├── controllers/
│   ├── authController.js       # Signup/Login logic
│   └── templateController.js   # CRUD operations
├── middleware/
│   └── auth.js                 # JWT verification
├── models/
│   ├── User.js                 # User schema
│   └── Template.js             # Template schema
├── routes/
│   ├── authRoutes.js           # Auth endpoints
│   └── templateRoutes.js       # Template endpoints
├── tests/
│   ├── auth.test.js            # Auth API tests
│   └── template.test.js        # Template API tests
└── server.js                   # Express app setup
```

## Key Features Implementation

### 1. Authentication (JWT + bcrypt)
- **Signup**: Hash password with bcrypt, create user, return JWT
- **Login**: Verify password, return JWT
- **Middleware**: Verify JWT on protected routes
- **Frontend**: Store token in localStorage, add to request headers

### 2. Drag & Drop (React DnD)
- **Palette**: Draggable block items (text, image, button, divider)
- **Canvas**: Drop zone that accepts blocks
- **Reordering**: Drag blocks within canvas to reorder
- **State Management**: Blocks stored as array in component state

### 3. Block System
Each block has:
```javascript
{
  id: "uuid",
  type: "text|image|button|divider",
  content: "...",
  src: "...",  // for images
  styles: {
    color: "#000000",
    backgroundColor: "#4CAF50",
    fontSize: "16px",
    textAlign: "left"
  }
}
```

### 4. Template Storage (MongoDB)
- **Schema**: userId, name, blocks[]
- **CRUD APIs**: Create, Read, Update, Delete
- **Protection**: All routes require JWT authentication
- **User Isolation**: Users can only access their own templates

### 5. HTML Export
- Converts block JSON to table-based HTML
- Inline styles for email client compatibility
- Responsive design with max-width
- Download as .html file

### 6. Block Editor
- Click any block to open editor panel
- Edit content, colors, fonts, alignment
- Real-time preview in canvas
- Apply changes to update block

## API Endpoints

### Authentication
```
POST /api/auth/signup
Body: { name, email, password }
Response: { token, user }

POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Templates (Protected)
```
POST /api/templates
Headers: Authorization: Bearer <token>
Body: { name, blocks }
Response: { template }

GET /api/templates
Headers: Authorization: Bearer <token>
Response: { templates: [] }

GET /api/templates/:id
Headers: Authorization: Bearer <token>
Response: { template }

PUT /api/templates/:id
Headers: Authorization: Bearer <token>
Body: { name, blocks }
Response: { template }

DELETE /api/templates/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

## Data Flow

### Creating a Template
1. User drags blocks from palette to canvas
2. Blocks stored in component state
3. User clicks "Save"
4. POST request to /api/templates with blocks array
5. Server saves to MongoDB with userId
6. Navigate to editor with template ID

### Loading a Template
1. User clicks template in dashboard
2. Navigate to /editor/:id
3. GET request to /api/templates/:id
4. Load blocks into canvas state
5. Render blocks in canvas

### Exporting HTML
1. User clicks "Export HTML"
2. Call exportToHTML(blocks)
3. Generate table-based HTML with inline styles
4. Create blob and trigger download

## Testing

### Backend Tests (Jest + Supertest)
- Auth API: signup, login, validation
- Template API: CRUD operations, authentication
- Run: `npm test`

### Frontend Tests (Jest + React Testing Library)
- Component rendering
- DnD functionality
- HTML export utility
- Run: `cd client && npm test`

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret, 7-day expiry
3. **Protected Routes**: Middleware verifies token
4. **User Isolation**: Templates filtered by userId
5. **Input Validation**: Required fields checked

## Performance Considerations

1. **Lazy Loading**: Components loaded on demand
2. **Optimized Renders**: React.memo for heavy components
3. **Database Indexing**: userId indexed for fast queries
4. **Connection Pooling**: MongoDB connection reuse

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18 features
- HTML5 drag-and-drop API
- LocalStorage for token persistence

## Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Template preview mode
- [ ] More block types (columns, spacer, social icons)
- [ ] Template marketplace
- [ ] Email sending integration
- [ ] Collaborative editing
- [ ] Template versioning
- [ ] Custom CSS support
- [ ] Image upload to cloud storage
- [ ] Template analytics
