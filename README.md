📦 Order Management System (OMS)
A single‑page Angular 18 web application designed to help Invenza Technologies staff manage customer orders end‑to‑end. The system provides an intuitive Bootstrap‑styled UI along with a lightweight Node.js + JSON file–based REST API for persistence.
The application supports full CRUD functionality:

➕ Create Orders
📄 Read Orders
✏️ Update Orders
❌ Delete Orders


🚀 Features
🌐 Frontend (Angular 18)

Single‑page application (SPA)
Order list, detail view, create/edit form
Form validation
Responsive UI using Bootstrap 5
Services for API interactions (GET/POST/PUT/DELETE)

🟦 Backend (Node.js)

Lightweight Express server
REST API endpoints for CRUD operations
Data stored in a local db.json file
CORS enabled for Angular integration


📁 Project Structure
Order-Management-System/
│
├── src/                 # Angular source code
├── server.js            # Node.js backend server
├── db.json              # Local JSON database
├── package.json         # Project dependencies
├── angular.json         # Angular workspace config
└── README.md            # Documentation


🛠️ Prerequisites
Make sure you have the following installed:

Node.js (v18 or later)
npm (v9 or later)
Angular CLI

Install Angular CLI globally if needed:
Shellnpm install -g @angular/cliShow more lines

⚙️ Installation
Clone the repository:
Shellgit clone https://github.com/PamelaG2199/Order-Management-System.gitcd Order-Management-SystemShow more lines
Install project dependencies:
Shellnpm installShow more lines

▶️ Running the Project
1️⃣ Start the Backend Server
Run Node.js server:
Shellnode server.jsShow more lines
Backend default URL:
http://localhost:3000


2️⃣ Start the Angular Frontend
Shellng serve``Show more lines
Angular app defaults to:
http://localhost:4200


🌐 API Endpoints (Node.js)
Get all orders
GET /orders

Get an order by ID
GET /orders/:id

Create a new order
POST /orders

Update an order
PUT /orders/:id

Delete an order
DELETE /orders/:id


🗄️ Sample Database (db.json)
JSON
{  "orders": [  
{      "id": 1,     
"customerName": "John Doe",     
"product": "Laptop",      
"quantity": 2,     
"status": "Pending"    }  ]}Show more lines

🧪 Running Unit Tests
Angular unit tests (Karma + Jasmine):
Shellng testShow more lines

🐞 Troubleshooting
    Issue	                                              Solution
CORS errors	                     -    Ensure backend runs on port 3000 with CORS enabled
Angular cannot reach backend	 -    Check API URLs in Angular services
"Port already in use"	         -    Kill process or change port in server.js / Angular config
ng serve fails	                 -    Delete node_modules and rerun npm install


🤝 Contributing
	1. Fork the repository
	2. Create a new branch
	3. Commit changes
	4. Submit a pull request


📜 License
This project is licensed under the MIT License.
