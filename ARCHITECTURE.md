# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    (React Frontend)                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Login     │  │  Dashboard   │  │    Editor    │     │
│  │    Signup    │  │  (Templates) │  │  (DnD Canvas)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │           AuthContext (JWT Token)                 │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                               │
│                   (Express.js Backend)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │                  Middleware                       │      │
│  │  • CORS                                          │      │
│  │  • JSON Parser                                   │      │
│  │  • JWT Verification (Protected Routes)          │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────┐              ┌──────────────┐           │
│  │ Auth Routes  │              │Template Routes│           │
│  │ /api/auth/*  │              │/api/templates/*│          │
│  └──────────────┘              └──────────────┘           │
│         │                              │                    │
│         ▼                              ▼                    │
│  ┌──────────────┐              ┌──────────────┐           │
│  │    Auth      │              │  Template    │           │
│  │ Controller   │              │ Controller   │           │
│  └──────────────┘              └──────────────┘           │
│         │                              │                    │
│         └──────────────┬───────────────┘                   │
│                        ▼                                    │
│              ┌──────────────────┐                          │
│              │  Mongoose Models │                          │
│              │  • User          │                          │
│              │  • Template      │                          │
│              └──────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│                      (MongoDB)                               │
│                                                              │
│  ┌──────────────┐              ┌──────────────┐           │
│  │    users     │              │  templates   │           │
│  │              │              │              │           │
│  │ • email      │              │ • userId     │           │
│  │ • password   │              │ • name       │           │
│  │ • name       │              │ • blocks[]   │           │
│  └──────────────┘              └──────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.js (Router)
│
├── AuthProvider (Context)
│   └── Provides: user, token, login(), logout()
│
├── Login Page
│   └── Form → POST /api/auth/login → Store token
│
├── Signup Page
│   └── Form → POST /api/auth/signup → Store token
│
├── Dashboard (Protected)
│   ├── GET /api/templates → List templates
│   ├── DELETE /api/templates/:id → Delete template
│   └── Navigate to Editor
│
└── Editor (Protected)
    ├── DndProvider (React DnD)
    │
    ├── Palette (Left Sidebar)
    │   └── Draggable Blocks (text, image, button, divider)
    │
    ├── Canvas (Center)
    │   ├── Drop Zone
    │   ├── DraggableCanvasBlock (Reorderable)
    │   └── Block Rendering
    │
    ├── BlockEditor (Right Sidebar)
    │   └── Edit Properties (content, colors, styles)
    │
    └── Actions
        ├── Save → POST/PUT /api/templates
        ├── Load → GET /api/templates/:id
        └── Export → Generate HTML → Download
```

## Data Flow

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend → POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend includes token in all API requests
   ↓
7. Backend verifies token via middleware
```

### Template Creation Flow

```
1. User drags blocks to canvas
   ↓
2. Blocks stored in component state
   ↓
3. User clicks "Save"
   ↓
4. Frontend → POST /api/templates
   ↓
5. Backend verifies JWT token
   ↓
6. Backend saves to MongoDB with userId
   ↓
7. Backend returns saved template
   ↓
8. Frontend updates UI
```

### Template Loading Flow

```
1. User clicks template in dashboard
   ↓
2. Navigate to /editor/:id
   ↓
3. Frontend → GET /api/templates/:id
   ↓
4. Backend verifies JWT token
   ↓
5. Backend queries MongoDB
   ↓
6. Backend returns template data
   ↓
7. Frontend loads blocks into canvas
   ↓
8. User can edit and save changes
```

### HTML Export Flow

```
1. User clicks "Export HTML"
   ↓
2. Frontend calls exportToHTML(blocks)
   ↓
3. Utility converts blocks to table-based HTML
   ↓
4. Generate Blob from HTML string
   ↓
5. Create download link
   ↓
6. Trigger download
   ↓
7. User receives .html file
```

## API Endpoints

### Authentication
```
POST /api/auth/signup
├── Input: { name, email, password }
├── Process: Hash password → Create user → Generate JWT
└── Output: { token, user }

POST /api/auth/login
├── Input: { email, password }
├── Process: Verify password → Generate JWT
└── Output: { token, user }
```

### Templates (All Protected)
```
POST /api/templates
├── Auth: JWT required
├── Input: { name, blocks }
├── Process: Create template with userId
└── Output: { template }

GET /api/templates
├── Auth: JWT required
├── Process: Find all templates for user
└── Output: { templates: [] }

GET /api/templates/:id
├── Auth: JWT required
├── Process: Find template by id and userId
└── Output: { template }

PUT /api/templates/:id
├── Auth: JWT required
├── Input: { name, blocks }
├── Process: Update template
└── Output: { template }

DELETE /api/templates/:id
├── Auth: JWT required
├── Process: Delete template
└── Output: { message }
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Password Security                                        │
│     • bcrypt hashing (10 salt rounds)                       │
│     • Never store plain text passwords                      │
│                                                              │
│  2. Authentication                                           │
│     • JWT tokens (7-day expiry)                             │
│     • Signed with secret key                                │
│     • Stored in localStorage                                │
│                                                              │
│  3. Authorization                                            │
│     • verifyToken middleware                                │
│     • Validates JWT on protected routes                     │
│     • Extracts userId from token                            │
│                                                              │
│  4. Data Isolation                                           │
│     • Templates filtered by userId                          │
│     • Users can only access own data                        │
│     • MongoDB queries include userId                        │
│                                                              │
│  5. Input Validation                                         │
│     • Required fields checked                               │
│     • Email format validation                               │
│     • Password length requirements                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         users                                │
├─────────────────────────────────────────────────────────────┤
│ _id          : ObjectId (Primary Key)                       │
│ email        : String (Unique, Required)                    │
│ password     : String (Hashed, Required)                    │
│ name         : String (Required)                            │
│ createdAt    : Date (Auto)                                  │
│ updatedAt    : Date (Auto)                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       templates                              │
├─────────────────────────────────────────────────────────────┤
│ _id          : ObjectId (Primary Key)                       │
│ userId       : ObjectId (Foreign Key → users._id)           │
│ name         : String (Required)                            │
│ blocks       : Array of Objects                             │
│   ├─ id      : String (UUID)                                │
│   ├─ type    : String (text|image|button|divider)          │
│   ├─ content : String                                       │
│   ├─ src     : String (for images)                          │
│   └─ styles  : Object                                       │
│       ├─ color           : String                           │
│       ├─ backgroundColor : String                           │
│       ├─ fontSize        : String                           │
│       └─ textAlign       : String                           │
│ createdAt    : Date (Auto)                                  │
│ updatedAt    : Date (Auto)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Stack                          │
├─────────────────────────────────────────────────────────────┤
│ • React 18              - UI framework                      │
│ • React Router v6       - Client-side routing               │
│ • React DnD             - Drag and drop                     │
│ • Axios                 - HTTP client                       │
│ • Context API           - State management                  │
│ • UUID                  - Unique IDs                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Backend Stack                           │
├─────────────────────────────────────────────────────────────┤
│ • Node.js               - Runtime                           │
│ • Express.js            - Web framework                     │
│ • MongoDB               - Database                          │
│ • Mongoose              - ODM                               │
│ • JWT                   - Authentication                    │
│ • bcrypt                - Password hashing                  │
│ • CORS                  - Cross-origin requests             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Testing Stack                           │
├─────────────────────────────────────────────────────────────┤
│ • Jest                  - Test framework                    │
│ • Supertest             - API testing                       │
│ • React Testing Library - Component testing                │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Setup                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                                           │
│  │   Client     │ (Browser)                                 │
│  └──────────────┘                                           │
│         │                                                    │
│         │ HTTPS                                             │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │    Nginx     │ (Reverse Proxy + SSL)                    │
│  └──────────────┘                                           │
│         │                                                    │
│         │ HTTP                                              │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   Node.js    │ (Express Server)                         │
│  │   + PM2      │ (Process Manager)                        │
│  └──────────────┘                                           │
│         │                                                    │
│         │ MongoDB Protocol                                  │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   MongoDB    │ (Database)                               │
│  │   Atlas      │ (Cloud or Local)                         │
│  └──────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

- **Frontend**: React.memo for expensive components
- **Backend**: Connection pooling for MongoDB
- **Database**: Indexes on userId for fast queries
- **Caching**: LocalStorage for auth token
- **Optimization**: Lazy loading of routes
- **Bundling**: Production build minification

## Scalability

- **Horizontal Scaling**: Multiple Node.js instances with PM2
- **Load Balancing**: Nginx or cloud load balancer
- **Database**: MongoDB replica sets
- **CDN**: Static assets served from CDN
- **Caching**: Redis for session management (future)
