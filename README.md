## Flash Sale System

A full-stack flash sale application demonstrating high-concurrency purchase handling with strict inventory guarantees.

### Assumptions
1. **Concurrency Scale**: The system is designed to handle thousands of concurrent requests. For higher scales (millions of requests), a different architectural approach would be required, such as Redis atomic operations or queue-based systems.
2. **Product Management**: Products are predefined and hardcoded in the frontend, with no product records stored in the backend database.
3. **Caching Strategy**: Since products are frontend-defined, no caching mechanism (in-memory database) is needed for product detail retrieval.

### Demo

#### Frontend UI
![Frontend UI](docs/images/frontend-ui.png)

The frontend provides a clean, intuitive interface that allows users to:
- View active flash sales with real-time remaining stock counts
- Purchase items with a single click when authenticated
- Monitor flash sale status and countdown timers

#### Stress Testing Results

A comprehensive stress test was conducted to compare purchase order handling before and after implementing the atomic decrement strategy. The test configuration was:
- **Total Users**: 100 concurrent users
- **Available Stock**: 50 items
- **Test Scenario**: 1,000 requests per second for 4 seconds (4,000 total requests)

##### Before Atomic Decrement Strategy Implementation
![Stress Test Before](docs/images/stress-test-before.png)

**Results**: 81 successful orders (HTTP 200 status) were processed, despite only 50 items being available in stock. This demonstrates a clear **overselling issue** where the system allowed more purchases than inventory available.

##### After Atomic Decrement Strategy Implementation
![Stress Test After](docs/images/stress-test-after.png)

**Results**: Exactly 50 successful orders (HTTP 200 status) were processed, matching the available stock perfectly. This confirms that the **atomic decrement strategy successfully prevents overselling** and maintains inventory consistency under high-concurrency conditions.


### Design Choices and Trade-offs

- **Strict Consistency on Purchases**: The backend performs atomic stock decrements within database transactions and inserts orders with unique constraints per user and sale. This approach guarantees no overselling and prevents duplicate orders for the same user.
  - **Trade-off**: While using the database for concurrency control (with row-level locking and conditional updates) might slow things down compared to keeping everything in memory, it guarantees that our data stays accurate and won't be lost. Plus, it's much easier to implement and maintain.
- **Drizzle ORM + PostgreSQL**: SQL-first modeling approach with clean migrations and the ability to express conditional updates.
- **Monorepo with Shared Types**: The `packages/shared` directory provides typed contracts across backend and frontend, reducing code duplication and improving developer experience.
- **Security & Developer Experience**: JWT-based authentication, CORS/Helmet security defaults, and Vitest for fast backend testing.

Key concurrency logic (high-level):
- Decrement stock only if `remainingStock > 0` then insert order, all inside a transaction; on conflict (user already purchased), revert the decrement. The implementation can be seen in [`orderService.ts`](apps/backend/src/services/orderService.ts#L24-L65) (lines 24-65).  

#### Tech Stack

##### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **Testing**: Vitest for unit and integration tests
- **Load Testing**: Artillery for stress testing

##### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: ShadCN/UI with Radix UI primitives
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS
- **Routing**: React Router

##### Project Structure
```
flash-sale-system/
├── apps/
│   ├── backend/                    # Node.js/Express API server
│   │   ├── src/
│   │   │   ├── controllers/        # Request handlers
│   │   │   ├── services/          # Business logic
│   │   │   ├── repositories/      # Data access layer
│   │   │   ├── routes/            # API route definitions
│   │   │   ├── middleware/        # Auth, validation, error handling
│   │   │   ├── db/               # Database schemas and connection
│   │   │   ├── utils/            # JWT, password utilities
│   │   │   └── types/            # TypeScript type definitions
│   │   ├── tests/                # Unit and integration tests
│   │   ├── migrations/           # Database migrations
│   │   └── package.json
│   │
│   └── frontend/                  # React web application
│       ├── src/
│       │   ├── components/        # Reusable UI components
│       │   │   └── ui/           # ShadCN UI components
│       │   ├── pages/            # Page components
│       │   ├── hooks/            # Custom React hooks
│       │   ├── apis/             # API client functions
│       │   ├── constants/        # Application constants
│       │   └── lib/              # Utility functions
│       └── package.json
│
├── packages/
│   └── shared/                    # Shared TypeScript types
│       ├── types/                # Common type definitions
│       └── package.json
│
├── stresstest/                    # Load testing with Artillery
│   ├── artillery/                # Test configurations and data
│   └── results/                  # Test results and reports
│
├── docker-compose.yml            # PostgreSQL container setup
├── package.json                  # Root package.json for workspace
└── README.md                     # Project documentation
```


### System diagram
```mermaid
graph TB
    %% Client Layer
    subgraph "Client Layer"
        WebApp[React Web App]
    end
    
    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        CDN[CDN]
        LB[Load Balancer]
        Gateway[API Gateway]
    end
    
    %% Flash Sale Service
    subgraph "Flash Sale Service"
        subgraph "Flash Sale API (Controller)"
            FlashSaleAPI[Flash Sale API]
            OrderAPI[Order API]
            AuthAPI[Auth API]
        end
        
        subgraph "Business Logic (Service)"
            FlashSaleService[Flash Sale Service]
            OrderService[Order Service]
            AuthService[Auth Service]
        end
        
        subgraph "Data Access (Repository)"
            FlashSaleRepo[Flash Sale Repository]
            OrderRepo[Order Repository]
            AuthRepo[Auth Repository]
        end
    end
    
    %% Data Layer
    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
    end
    
    %% External Services
    subgraph "External Services"
        JWT[JWT Service]
    end
    
    %% Connections
    WebApp --> CDN
    CDN --> LB
    LB --> Gateway
    
    Gateway --> FlashSaleAPI
    Gateway --> OrderAPI
    Gateway --> AuthAPI
    
    FlashSaleAPI --> FlashSaleService
    OrderAPI --> OrderService
    AuthAPI --> AuthService
    
    FlashSaleService --> FlashSaleRepo
    OrderService --> OrderRepo
    AuthService --> AuthRepo
    
    FlashSaleRepo --> Postgres
    OrderRepo --> Postgres
    AuthRepo --> Postgres
    
    AuthService --> JWT
    
    %% Styling
    classDef clientClass fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef infraClass fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    classDef apiClass fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    classDef serviceClass fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    classDef repoClass fill:#fce4ec,stroke:#e91e63,stroke-width:2px
    classDef dataClass fill:#e0f2f1,stroke:#009688,stroke-width:2px
    classDef externalClass fill:#f1f8e9,stroke:#8bc34a,stroke-width:2px
    
    class WebApp clientClass
    class CDN,LB,Gateway infraClass
    class FlashSaleAPI,OrderAPI,AuthAPI apiClass
    class FlashSaleService,OrderService,AuthService serviceClass
    class FlashSaleRepo,OrderRepo,AuthRepo repoClass
    class Postgres dataClass
    class JWT externalClass
```

#### System Diagram Explanation

The system diagram illustrates the layered architecture of the flash sale system, showing how different components interact to handle high-concurrency purchase requests. Here's a detailed breakdown of each layer:

**1. Client Layer**
- **React Web App**: The frontend application that users interact with to browse and purchase flash sale items
- Provides a responsive user interface for flash sale participation

**2. Infrastructure Layer (Not implemented locally)**
- **CDN (Content Delivery Network)**: Serves static assets and improves global performance
- **Load Balancer**: Distributes incoming traffic across multiple backend instances for scalability
- **API Gateway**: Central entry point that handles routing, rate limiting, and request validation

**3. Flash Sale System**
The flash sale system is organized into three distinct sub-layers following clean architecture principles:

- **API Layer (Controllers)**: 
  - **Flash Sale API**: Handles flash sale listing and details
  - **Order API**: Manages purchase requests and order operations
  - **Auth API**: Handles user authentication and authorization

- **Business Logic Layer (Services)**:
  - **Flash Sale Service**: Contains business rules for flash sale operations
  - **Order Service**: Implements purchase logic with inventory management
  - **Auth Service**: Manages user authentication and JWT token operations

- **Data Access Layer (Repositories)**:
  - **Flash Sale Repository**: Abstracts database operations for flash sale data
  - **Order Repository**: Handles order persistence and retrieval
  - **Auth Repository**: Manages user data and authentication records

**4. Data Layer**
- **PostgreSQL**: Primary database storing flash sales, orders, and user data
- Provides ACID compliance and strong consistency guarantees for inventory management

**5. External Services**
- **JWT Service**: Handles token generation, validation, and refresh operations

**Key Architectural Benefits:**
- **Separation of Concerns**: Each layer has a specific responsibility
- **Scalability**: Infrastructure components can be scaled independently
- **Maintainability**: Clean architecture makes the system easy to modify and extend
- **Reliability**: Database-level consistency ensures no overselling or duplicate orders

### Purchase Order Sequence Diagram

This diagram illustrates the specific flow of how the purchase order logic works in this system.

```mermaid
sequenceDiagram
    participant User as User (React App)
    participant Auth as Auth Service
    participant API as Order API
    participant Service as Order Service
    participant FlashRepo as Flash Sale Repository
    participant OrderRepo as Order Repository
    participant DB as PostgreSQL

    Note over User,DB: Purchase Flash Sale Flow

    %% Authentication Check
    alt User is not authenticated
        User->>Auth: Login Request
        Auth->>User: JWT Token
    end

    %% Purchase Request
    User->>API: POST /api/flash-sales/:id/purchase<br/>+ JWT Header
    API->>Service: purchaseFlashSale(flashSaleId, userId)

    %% Validation Checks
    Service->>FlashRepo: findById(flashSaleId)
    FlashRepo->>DB: SELECT * FROM flash_sales WHERE id = ?
    DB-->>FlashRepo: Flash Sale Data
    FlashRepo-->>Service: Flash Sale Object

    alt Flash Sale does not exist
        Service-->>API: 404 Not Found
        API-->>User: 404 Error
    else Flash Sale exists
        alt Flash Sale is not active
            Service-->>API: 400 Inactive
            API-->>User: 400 Error
        else Flash Sale is active
            alt Stock <= 0
                Service-->>API: 400 Out of Stock
                API-->>User: 400 Error
            else Stock > 0
                Note over Service,DB: Start Atomic Transaction
                
                %% Atomic Transaction
                Service->>FlashRepo: decrementStock(flashSaleId)
                FlashRepo->>DB: UPDATE flash_sales SET remaining_stock = remaining_stock - 1<br/>WHERE id = ? AND remaining_stock > 0
                DB-->>FlashRepo: Updated Rows Count
                FlashRepo-->>Service: Success

                Service->>OrderRepo: createOrder(flashSaleId, userId)
                OrderRepo->>DB: INSERT INTO orders (flash_sale_id, user_id, ...)<br/>ON CONFLICT (flash_sale_id, user_id) DO NOTHING
                DB-->>OrderRepo: Insert Result

                alt User already purchased (Conflict)
                    Note over Service,DB: Rollback Transaction
                    Service->>FlashRepo: incrementStock(flashSaleId)
                    FlashRepo->>DB: UPDATE flash_sales SET remaining_stock = remaining_stock + 1<br/>WHERE id = ?
                    DB-->>FlashRepo: Success
                    FlashRepo-->>Service: Success
                    Service-->>API: 400 Already Purchased
                    API-->>User: 400 Error
                else Order created successfully
                    Note over Service,DB: Commit Transaction
                    Service-->>API: 201 Order Created
                    API-->>User: 201 Success + Order Data
                end
            end
        end
    end
```

#### Sequence Diagram Explanation

The purchase order sequence diagram illustrates the complete flow of a flash sale purchase request, from user authentication to order creation. Here's a detailed breakdown:

**1. Authentication Phase**
- If the user is not authenticated, they must first login through the Auth Service
- The Auth Service returns a JWT token that will be used for subsequent authenticated requests

**2. Purchase Request Initiation**
- The authenticated user sends a POST request to `/api/flash-sales/:id/purchase` with the JWT token in the Authorization header
- The Order API receives the request and delegates it to the Order Service

**3. Validation Sequence**
The system performs three critical validations in sequence:
- **Existence Check**: Verifies the flash sale exists in the database
- **Active Status Check**: Ensures the flash sale is currently active
- **Stock Availability Check**: Confirms there's remaining stock available

**4. Atomic Transaction Process**
When all validations pass, the system executes an atomic transaction:
- **Stock Decrement**: Uses a conditional UPDATE with `WHERE remaining_stock > 0` to prevent race conditions
- **Order Creation**: Attempts to insert a new order with a unique constraint on `(flash_sale_id, user_id)`

**5. Conflict Resolution**
- If the user has already purchased this flash sale (unique constraint violation), the transaction is rolled back
- The stock counter is re-incremented to maintain data consistency
- An appropriate error message is returned to the user

**6. Success Path**
- If the order is created successfully, the transaction is committed
- The user receives a 201 status code with the order details

This design ensures **strict consistency** and **prevents overselling** by using database-level constraints and atomic transactions, making it suitable for high-concurrency flash sale scenarios.
        

## Getting started

### Prerequisites
- Node.js 18+ (uses workspaces)
- Docker (for Postgres)

### 1) Install dependencies
```bash
npm install
```

### 2) Start Postgres
```bash
docker compose up -d
```

Postgres will be available on port `35432` (container exposes `5432`).

### 3) Environment setup
This repo includes example env files. Copy them and initialize the database.
```bash
npm run setup
```
What it does:
- Copies `apps/backend/.env.example` -> `apps/backend/.env`
- Copies `apps/frontend/.env.example` -> `apps/frontend/.env`
- Resets and migrates the DB for backend

## Running the apps

### Backend (API)
```bash
npm run dev:backend
```
Defaults to `PORT=33000`. Health check: `GET http://localhost:33000/health`.

### Create Flash Sale Data
Use the following curl command to create flash sale data. The required payload includes `startDate`, `endDate`, and `totalStock`. 

**Important**: The `startDate` and `endDate` values must be in UTC timezone. For example, if you want to start a flash sale on October 7th, 2025 at 10:00 AM UTC+7 (Jakarta Time), you need to use `"2025-10-07T03:00:00.000Z"` as the `startDate` (UTC+7 to UTC conversion).

```bash
curl -X POST http://localhost:33000/api/flash-sales \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-10-01T10:00:00.000Z",
    "endDate": "2025-12-31T12:00:00.000Z",
    "totalStock": 50
  }'
```

### Frontend
```bash
npm run dev:frontend
```
Defaults to `http://localhost:38080`.

After running this command, you can access the application by navigating to `http://localhost:38080` in your browser.

## Testing
Run the test suite (unit test and integration test):
```bash
npm run test
```

## Stress Testing

We use Artillery to simulate flash sale traffic. There are two convenient test scripts available:

- **Single User Sanity Test**: Ensures that one user can only order once per flash sale:
```bash
npm run stresstest:single-user
```

- **Multiple Users Load Test**: 100 concurrent users with short burst traffic:
```bash
npm run stresstest:multiple-users
```

**Prerequisites**: Make sure to run the backend application first (`npm run dev:backend`) before executing stress tests.

These commands will:
1. Reset the database to a clean state.
2. Generate users and flash sale (50 total stock available) data under `stresstest/artillery/data`.
3. Run the scenario described in `stresstest/artillery/purchase.yml` against `http://localhost:33000` by default.
4. Produce results under `stresstest/results/*.json` and an HTML report.

If your backend runs on a different port, adjust `stresstest/artillery/purchase.yml` `config.target` or run the backend on `PORT=33000`.

### Expected outcome under load
- **No overselling**: Total successful orders never exceed the configured `remainingStock` for the flash sale.
- **No duplicate purchases per user**: Attempts beyond the first for a user result in `400` with a clear message.
- **Bounded errors**: When stock is exhausted, further requests receive `400` “out of stock”; overall error rate will rise accordingly but is expected and correct.
- **Throughput and latencies**: With DB-backed atomic operations, expect stable correctness with moderate TPS; tuning Postgres, pool size, and process concurrency can improve throughput if needed.

Artifacts:
- JSON and HTML reports saved in `stresstest/results/` with the run name specified via `--name`.

## Useful commands
- Start DB: `docker compose up -d`
- Stop DB: `docker compose down`
- DB studio (schema UI): `npm run db:studio`

## Notes
- CORS defaults allow localhost origins; adjust `CORS_ORIGINS` in backend `.env` as needed.
- Authentication uses JWT; the frontend stores the token in `localStorage` and sends it via `Authorization: Bearer <token>`.

## APIs Available:

### Authentication APIs

#### 1. User Registration
- **API URL**: `POST /api/auth/register`
- **Usage**: Register a new user account
- **Curl Sample**:
```bash
curl -X POST http://localhost:33000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```
- **Response Sample**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. User Login
- **API URL**: `POST /api/auth/login`
- **Usage**: Authenticate user and get JWT token
- **Curl Sample**:
```bash
curl -X POST http://localhost:33000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```
- **Response Sample**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Flash Sale APIs

#### 3. Get Current Flash Sale Status
- **API URL**: `GET /api/flash-sales/current`
- **Usage**: Get the current or closest upcoming flash sale with status
- **Curl Sample**:
```bash
curl -X GET http://localhost:33000/api/flash-sales/current
```
- **Response Sample**:
```json
{
  "flashSale": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "startDate": "2024-01-01T10:00:00.000Z",
    "endDate": "2024-01-01T12:00:00.000Z",
    "totalStock": 50,
    "remainingStock": 45,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "status": "active"
}
```

#### 4. Create Flash Sale
- **API URL**: `POST /api/flash-sales`
- **Usage**: Create a new flash sale (admin functionality)
- **Curl Sample**:
```bash
curl -X POST http://localhost:33000/api/flash-sales \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T10:00:00.000Z",
    "endDate": "2024-01-01T12:00:00.000Z",
    "totalStock": 50
  }'
```
- **Response Sample**:
```json
{
  "message": "Flash sale created successfully",
  "flashSale": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "startDate": "2024-01-01T10:00:00.000Z",
    "endDate": "2024-01-01T12:00:00.000Z",
    "totalStock": 50,
    "remainingStock": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 5. Purchase Flash Sale
- **API URL**: `POST /api/flash-sales/:id/purchase`
- **Usage**: Purchase a flash sale item (requires authentication)
- **Curl Sample**:
```bash
curl -X POST http://localhost:33000/api/flash-sales/123e4567-e89b-12d3-a456-426614174000/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Response Sample**:
```json
{
  "order": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "flashSaleId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Order APIs

#### 6. Get Order Details
- **API URL**: `GET /api/me/orders/:flashSaleId`
- **Usage**: Get order details for a specific flash sale (requires authentication)
- **Curl Sample**:
```bash
curl -X GET http://localhost:33000/api/me/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
- **Response Sample**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "flashSaleId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### System APIs

#### 7. Health Check
- **API URL**: `GET /health`
- **Usage**: Check if the API service is running
- **Curl Sample**:
```bash
curl -X GET http://localhost:33000/health
```
- **Response Sample**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "User Management API"
}
```
