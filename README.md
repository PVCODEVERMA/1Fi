# LAMF LMS - Loan Management System

A complete full-stack Loan Management System for NBFCs (Non-Banking Financial Companies) specializing in LAMF (Lending Against Mutual Funds).

## Table of Contents
1. [Setup and Run Instructions](#i-setup-and-run-instructions)
2. [API Endpoints and Responses](#ii-api-endpoints-and-example-responses)
3. [Tech Stack Used](#iii-tech-stack-used)
4. [Database Schema](#iv-schema-used)

---

## i. Setup and Run Instructions

### Prerequisites
- Node.js v14+
- MongoDB 4.4+
- npm v6+
- Git

### Installation & Running

#### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (see Configuration section)
# Add required environment variables

# Start the server
npm start
# Runs on http://localhost:5000
```

#### Frontend Setup (Development)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
# Add: REACT_APP_API_URL=http://localhost:5000

# Start development server
npm start
# Runs on http://localhost:3000
```

#### Frontend Setup (Production Build)
```bash
cd client

# Build for production
npm run build

# The built files are in client/build folder
# Serve using any HTTP server

# Example: Using serve
npx serve -s build
```

### Demo Credentials

```
Email: borrower1@example.com
Password: user@123
```

### Verify Setup
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:3000
- Check MongoDB is running on localhost:27017

---

## Project Structure

```
.
├── client/
│   ├── build/          # Production frontend build
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service calls
│   │   ├── styles/     # CSS stylesheets
│   │   ├── App.js      # Main app component
│   │   └── index.js    # Entry point
│   ├── package.json
│   └── .env
├── server/
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   ├── config/      # Configuration files
│   │   └── index.js     # Server entry point
│   ├── package.json
│   └── .env
├── README.md
├── DEPLOYMENT.md
└── .gitignore
```

## Features

- 📊 **Loan Products Management** - Configure loan products with rates and terms
- 📝 **Loan Applications** - Apply for loans with real-time EMI calculation
- 💰 **Collateral Management** - Manage mutual fund collaterals
- 📈 **Ongoing Loans** - Track active loans and repayments
- 🔌 **Public APIs** - Fintech integration endpoints

---

## ii. API Endpoints and Example Responses

Base URL: `http://localhost:5000/api`
live URL: https://lamf-lms.netlify.app/

### Authentication Endpoints

#### Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "borrower1@example.com",
  "password": "user@123"
}

Response (200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "borrower1@example.com",
    "role": "borrower"
  }
}
```

#### Register
```
POST /auth/register
Content-Type: application/json

Request:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secure@123",
  "role": "borrower"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "borrower"
  }
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "borrower1@example.com",
    "role": "borrower",
    "createdAt": "2025-12-21T10:00:00Z"
  }
}
```

### Product Endpoints

#### Get All Products
```
GET /products

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Gold Loan",
      "description": "Loan against Gold",
      "minAmount": 10000,
      "maxAmount": 500000,
      "interestRate": 12.5,
      "tenure": 24,
      "processingFee": 2.5,
      "createdAt": "2025-12-21T10:00:00Z"
    }
  ]
}
```

#### Get Product By ID
```
GET /products/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Gold Loan",
    "description": "Loan against Gold",
    "minAmount": 10000,
    "maxAmount": 500000,
    "interestRate": 12.5,
    "tenure": 24,
    "processingFee": 2.5
  }
}
```

### Loan Endpoints

#### Create Loan Application
```
POST /loans
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "productId": "507f1f77bcf86cd799439020",
  "loanAmount": 100000,
  "tenure": 12,
  "purpose": "Personal use",
  "collateralValue": 150000
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "applicantId": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439020",
    "loanAmount": 100000,
    "tenure": 12,
    "emiAmount": 8750,
    "status": "pending",
    "createdAt": "2025-12-21T10:00:00Z"
  }
}
```

#### Get All Loan Applications
```
GET /loans
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "applicantId": "507f1f77bcf86cd799439011",
      "productId": "507f1f77bcf86cd799439020",
      "loanAmount": 100000,
      "tenure": 12,
      "emiAmount": 8750,
      "status": "pending"
    }
  ]
}
```

#### Get Loan Application By ID
```
GET /loans/:id
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "applicantId": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439020",
    "loanAmount": 100000,
    "tenure": 12,
    "emiAmount": 8750,
    "status": "pending",
    "reason": "Under review"
  }
}
```

#### Approve Loan
```
PATCH /loans/:id/approve
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "approvalDate": "2025-12-21"
}

Response (200 OK):
{
  "success": true,
  "message": "Loan approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "status": "approved",
    "approvedAmount": 100000,
    "approvalDate": "2025-12-21"
  }
}
```

#### Reject Loan
```
PATCH /loans/:id/reject
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "reason": "Insufficient collateral"
}

Response (200 OK):
{
  "success": true,
  "message": "Loan rejected successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "status": "rejected",
    "rejectionReason": "Insufficient collateral"
  }
}
```

### Collateral Endpoints

#### Get All Collaterals
```
GET /collaterals
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "loanId": "507f1f77bcf86cd799439030",
      "userId": "507f1f77bcf86cd799439011",
      "type": "Mutual Fund",
      "value": 150000,
      "status": "active"
    }
  ]
}
```

#### Add Collateral
```
POST /collaterals
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "loanId": "507f1f77bcf86cd799439030",
  "type": "Mutual Fund",
  "value": 150000,
  "description": "SIP units"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "loanId": "507f1f77bcf86cd799439030",
    "type": "Mutual Fund",
    "value": 150000,
    "status": "active"
  }
}
```

#### Update Collateral
```
PUT /collaterals/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "value": 160000
}

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "value": 160000,
    "updatedAt": "2025-12-21T10:00:00Z"
  }
}
```

#### Delete Collateral
```
DELETE /collaterals/:id
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Collateral deleted successfully"
}
```

---

## iii. Tech Stack Used

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| CSS3 | - | Styling |
| JavaScript (ES6+) | - | Programming language |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 14+ | Runtime environment |
| Express.js | 4.x | Web framework |
| MongoDB | 4.4+ | Database |
| Mongoose | 6.x | ODM for MongoDB |
| JWT | - | Authentication |
| bcryptjs | - | Password hashing |

### Development Tools
| Tool | Purpose |
|------|---------|
| npm | Package manager |
| Git | Version control |
| Nodemon | Dev server auto-reload |
| Postman | API testing |

### Key Dependencies

**Backend (server/package.json)**
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- nodemon

**Frontend (client/package.json)**
- react
- react-router-dom
- axios
- react-dom

---

## iv. Schema Used

### User Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phoneNumber: String,
  role: Enum ['borrower', 'lender', 'admin'],
  kycStatus: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### LoanProduct Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  minAmount: Number,
  maxAmount: Number,
  interestRate: Number (required),
  tenure: Number (in months),
  processingFee: Number (percentage),
  eligibilityCriteria: String,
  createdAt: Date,
  updatedAt: Date
}
```

### LoanApplication Schema
```javascript
{
  _id: ObjectId,
  applicantId: ObjectId (ref: User),
  productId: ObjectId (ref: LoanProduct),
  loanAmount: Number (required),
  tenure: Number (in months),
  purpose: String,
  emiAmount: Number (calculated),
  totalAmountPayable: Number,
  status: Enum ['pending', 'approved', 'rejected', 'disbursed', 'closed'],
  approvalDate: Date,
  rejectionReason: String,
  approvedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Collateral Schema
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplication),
  userId: ObjectId (ref: User),
  type: String (required), // e.g., 'Mutual Fund', 'Gold', 'Property'
  value: Number (required),
  description: String,
  status: Enum ['active', 'released', 'forfeited'],
  documentUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### RepaymentSchedule Schema
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplication),
  installmentNumber: Number,
  dueDate: Date,
  principalAmount: Number,
  interestAmount: Number,
  totalAmount: Number,
  status: Enum ['pending', 'paid', 'overdue'],
  paidDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Disbursement Schema
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplication),
  userId: ObjectId (ref: User),
  disbursementAmount: Number,
  disbursementDate: Date,
  bankName: String,
  accountNumber: String,
  status: Enum ['pending', 'processed', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

### FinancialEntry Schema
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplication),
  type: Enum ['debit', 'credit'],
  amount: Number,
  description: String,
  entryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Configuration

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/lamf_lms
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Deployment

### Production Frontend
The `client/build` folder contains the optimized production build. Serve it with any HTTP server:

```bash
# Using Node http-server
npx serve -s client/build

# Using Apache/Nginx
# Point DocumentRoot to client/build
```

### Production Backend
```bash
cd server
NODE_ENV=production npm start
```

## Database

MongoDB automatically seeds with sample data on first run.

## Support

For issues or questions, check the error logs in the backend terminal.

## License

MIT
