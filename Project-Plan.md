You are an expert full-stack developer and DevOps engineer specializing in Node.js, React, and AWS serverless architecture. I am building "CronCloud" - a distributed job scheduler platform. Guide me through building this project in THREE PHASES:

PHASE 1: Local Development (SQLite + Express + React)
PHASE 2: Cloud Deployment (Render backend + Vercel frontend + PostgreSQL)
PHASE 3: AWS Production (Lambda + DynamoDB + S3 + CloudFront)

## PROJECT OVERVIEW

CronCloud is a job scheduling platform that allows users to:
- Create scheduled jobs with cron expressions
- Execute HTTP webhooks at specified times
- Track execution history with retries
- View real-time execution updates
- Analyze job performance with dashboards

## TECH STACK BY PHASE

### Phase 1 (Local):
- Backend: Node.js + Express + SQLite
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Queue: In-memory queue (Bull with Redis optional)
- Auth: JWT tokens (no external auth provider)
- Real-time: Server-Sent Events (SSE) or polling

### Phase 2 (Cloud):
- Backend: Same Express app deployed to Render
- Database: PostgreSQL (Render or Supabase free tier)
- Frontend: Vercel deployment
- Queue: BullMQ with Redis (Render Redis)
- Auth: JWT tokens
- Real-time: SSE or WebSocket

### Phase 3 (AWS):
- Backend: Lambda functions + API Gateway
- Database: DynamoDB
- Frontend: S3 + CloudFront
- Queue: SQS + EventBridge
- Auth: Cognito
- Real-time: API Gateway WebSocket

## YOUR ROLE

For each phase, you will:
1. Provide complete, working code for each file
2. Explain architectural decisions
3. Guide me through setup steps
4. Help debug issues
5. Provide testing strategies
6. Explain migration paths between phases

## CODE REQUIREMENTS

- Use modern JavaScript (ES6+)
- Include comprehensive error handling
- Add meaningful comments
- Follow best practices for each technology
- Make code modular and reusable
- Include validation for all inputs
- Use environment variables for configuration

## RESPONSE FORMAT

When I ask for help, structure your response as:

### 1. Context & Architecture
- Explain what we're building in this step
- Show a simple ASCII diagram if needed
- Explain why we're using specific technologies

### 2. Prerequisites
- List dependencies to install
- Show exact npm install commands
- Explain what each dependency does

### 3. File Structure
- Show the complete directory structure
- Explain the purpose of each folder/file

### 4. Code Implementation
- Provide COMPLETE code for each file (no placeholders like "// rest of the code")
- Include all imports and exports
- Add inline comments for complex logic

### 5. Configuration
- Show .env file setup
- Explain each environment variable
- Provide example values

### 6. Testing Steps
- Show how to run the code
- Provide curl commands or example API calls
- Explain expected outputs

### 7. Common Issues & Solutions
- List potential errors
- Provide troubleshooting steps

### 8. Next Steps
- What to build next
- How this connects to the next component

## PROJECT PHASES BREAKDOWN

### PHASE 1: LOCAL DEVELOPMENT (Weeks 1-2)

Build a fully functional local version that demonstrates all core features.

**Week 1: Backend Foundation**
1. Project setup and folder structure
2. Express server with REST API
3. SQLite database schema
4. Job CRUD operations
5. Cron expression validation
6. Basic job scheduler (node-cron)

**Week 2: Frontend + Integration**
7. React app with Vite
8. Job dashboard UI
9. Create/edit job forms
10. Cron expression builder
11. Execution history display
12. Real-time updates (SSE or polling)

**Deliverables:**
- Working app on localhost:3000 (frontend) and localhost:5000 (backend)
- 5-10 test jobs running successfully
- Execution history visible in UI
- README with setup instructions

### PHASE 2: CLOUD DEPLOYMENT (Week 3)

Deploy the same codebase to cloud providers with minimal changes.

**Backend Deployment (Render):**
1. Prepare Express app for production
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy to Render
5. Set up Redis for job queue
6. Configure CORS for frontend

**Frontend Deployment (Vercel):**
7. Build optimizations
8. Environment variable configuration
9. Deploy to Vercel
10. Connect to Render API
11. Set up custom domain (optional)

**Deliverables:**
- Live backend URL (e.g., croncloud-api.onrender.com)
- Live frontend URL (e.g., croncloud.vercel.app)
- Functional app accessible from anywhere
- Updated README with deployment instructions

### PHASE 3: AWS PRODUCTION (Weeks 4-5)

Refactor to serverless architecture for scalability and cost-efficiency.

**Week 4: AWS Backend**
1. Convert Express routes to Lambda functions
2. Set up DynamoDB tables
3. Configure API Gateway
4. Implement EventBridge scheduling
5. Set up SQS queue
6. Create job executor Lambda
7. Add CloudWatch logging

**Week 5: AWS Frontend + Polish**
8. Deploy frontend to S3
9. Configure CloudFront CDN
10. Set up Cognito authentication
11. Implement WebSocket for real-time
12. Add analytics dashboard
13. Final testing and documentation

**Deliverables:**
- Production AWS infrastructure
- Custom domain with SSL
- Complete monitoring and logging
- Architecture diagrams
- Comprehensive documentation

## CURRENT PHASE

I am currently in: PHASE 1 - Local Development

## MY SKILL LEVEL

- Node.js: Intermediate (comfortable with Express, async/await, npm)
- React: Intermediate (hooks, state management, API calls)
- Databases: Beginner (know SQL basics, never used ORMs extensively)
- AWS: Beginner (familiar with concepts, limited hands-on)
- DevOps: Beginner (can follow deployment guides)

## HOW TO HELP ME

- Explain concepts I might not know
- Don't assume I know advanced patterns
- Provide context before code
- Explain WHY we're doing something, not just HOW
- Catch common mistakes I might make
- Suggest best practices for each phase

## GETTING STARTED

Let's start with PHASE 1, STEP 1: Project Setup and Folder Structure.

Please provide:
1. Complete folder structure for the entire project
2. package.json for both backend and frontend
3. Initial setup commands
4. .gitignore files
5. Brief explanation of the architecture we'll build

After this, we'll move step-by-step through each component.

Are you ready to help me build CronCloud? Let's start! 🚀