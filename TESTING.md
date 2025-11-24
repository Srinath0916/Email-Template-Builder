# Testing Guide

## Test Coverage

### Backend Tests
- Authentication (signup, login)
- Template CRUD operations
- JWT middleware
- Error handling

### Frontend Tests
- Component rendering
- Drag-and-drop functionality
- HTML export utility
- Block rendering

## Running Tests

### All Backend Tests
```bash
npm test
```

### All Frontend Tests
```bash
cd client
npm test
```

### Watch Mode (Frontend)
```bash
cd client
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Manual Testing Checklist

### Authentication Flow
- [ ] Sign up with new account
- [ ] Sign up with existing email (should fail)
- [ ] Sign up with invalid email format (should fail)
- [ ] Sign up with short password (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Logout and verify redirect to login
- [ ] Access protected route without token (should redirect)

### Dashboard
- [ ] View empty state when no templates
- [ ] Create new template button works
- [ ] View list of templates
- [ ] Template cards show correct info
- [ ] Edit button navigates to editor
- [ ] Delete button shows confirmation
- [ ] Delete button removes template
- [ ] Templates sorted by update date

### Editor - Drag & Drop
- [ ] Drag text block from palette to canvas
- [ ] Drag image block from palette to canvas
- [ ] Drag button block from palette to canvas
- [ ] Drag divider block from palette to canvas
- [ ] Reorder blocks within canvas
- [ ] Drop zone highlights on drag over
- [ ] Empty state shows when no blocks

### Editor - Block Editing
- [ ] Click text block to open editor
- [ ] Edit text content
- [ ] Change text color
- [ ] Change font size
- [ ] Change text alignment
- [ ] Click button block to open editor
- [ ] Edit button text
- [ ] Change button background color
- [ ] Click image block to open editor
- [ ] Change image URL
- [ ] Image displays correctly
- [ ] Close editor panel

### Editor - Block Management
- [ ] Hover over block shows delete button
- [ ] Delete button removes block
- [ ] Selected block has highlight
- [ ] Click outside deselects block

### Template Operations
- [ ] Save new template
- [ ] Update template name
- [ ] Save changes to existing template
- [ ] Load template from dashboard
- [ ] Template loads with all blocks
- [ ] Back button returns to dashboard

### HTML Export
- [ ] Export button downloads file
- [ ] File has correct name
- [ ] HTML is valid
- [ ] Text blocks render correctly
- [ ] Image blocks render correctly
- [ ] Button blocks render correctly
- [ ] Divider blocks render correctly
- [ ] Styles are inline
- [ ] Email-safe table layout
- [ ] Open HTML in browser to verify

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Palette scrolls on small screens
- [ ] Canvas scrolls on small screens

### Error Handling
- [ ] Network error shows message
- [ ] Invalid token redirects to login
- [ ] Failed save shows error
- [ ] Failed load shows error
- [ ] Failed delete shows error

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## API Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Template
```bash
curl -X POST http://localhost:5000/api/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Template","blocks":[]}'
```

### Get Templates
```bash
curl -X GET http://localhost:5000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Template by ID
```bash
curl -X GET http://localhost:5000/api/templates/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Template
```bash
curl -X PUT http://localhost:5000/api/templates/TEMPLATE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Updated Template","blocks":[]}'
```

### Delete Template
```bash
curl -X DELETE http://localhost:5000/api/templates/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Testing with Postman

### Setup
1. Import collection (create from cURL commands above)
2. Create environment variable for `token`
3. Create environment variable for `baseUrl` = `http://localhost:5000`

### Test Sequence
1. Signup → Save token
2. Login → Verify token
3. Create Template → Save template ID
4. Get Templates → Verify list
5. Get Template by ID → Verify data
6. Update Template → Verify changes
7. Delete Template → Verify deletion

## Performance Testing

### Load Testing with Artillery
Install: `npm install -g artillery`

Create `load-test.yml`:
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Template CRUD"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/templates"
          headers:
            Authorization: "Bearer {{ token }}"
```

Run: `artillery run load-test.yml`

## Security Testing

### Check for Common Vulnerabilities
- [ ] SQL Injection (N/A - using MongoDB)
- [ ] XSS (sanitize user input)
- [ ] CSRF (use CORS properly)
- [ ] JWT expiration works
- [ ] Password hashing works
- [ ] Unauthorized access blocked
- [ ] Rate limiting (if implemented)

### Tools
- `npm audit` - Check dependencies
- OWASP ZAP - Security scanning
- Burp Suite - Penetration testing

## Continuous Integration

### GitHub Actions Example
Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install-all
      
      - name: Run backend tests
        run: npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test-secret
      
      - name: Run frontend tests
        run: cd client && npm test -- --coverage
```

## Test Data

### Sample User
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Sample Template
See `sample-template.json` in project root

## Debugging Tests

### Backend
```bash
# Run specific test file
npm test -- server/tests/auth.test.js

# Run with verbose output
npm test -- --verbose

# Run in watch mode
npm test -- --watch
```

### Frontend
```bash
cd client

# Run specific test
npm test -- BlockEditor.test.js

# Update snapshots
npm test -- -u

# Debug in browser
npm test -- --debug
```

## Known Issues & Limitations

1. Drag-and-drop may not work in automated tests (requires manual testing)
2. File download testing requires manual verification
3. LocalStorage testing requires jsdom setup
4. Image loading may be slow in tests (use mocks)

## Test Maintenance

- Update tests when adding new features
- Remove tests for deprecated features
- Keep test data realistic
- Mock external dependencies
- Use factories for test data generation
- Keep tests independent and isolated
