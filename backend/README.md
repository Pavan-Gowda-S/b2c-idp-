# B2C Construction Monitoring Backend

Node.js, Express, MongoDB, JWT, bcrypt, and Multer backend for the existing `b2c_fixed2.html` frontend.

## Setup

1. Install MongoDB locally or set `MONGO_URI` to a MongoDB Atlas connection string.
2. Copy `.env.example` to `.env`.
3. Install dependencies:

```bash
npm install
```

4. Seed a demo builder and customer project:

```bash
npm run seed
```

5. Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## Demo Credentials

- Builder username: `demo_builder`
- Builder password: `demo_builder_123456`
- Customer project code: `9823456712`

The current frontend bridge also supports quick builder onboarding: entering a new builder name in the existing UI will register that builder automatically with an internal generated password.

## Main API Groups

- `/api/auth` builder and customer authentication
- `/api/projects` project creation, listing, dashboards, activity
- `/api/progress` daily work updates and image upload
- `/api/estimations` domain-wise estimations
- `/api/uploads` planned images, bills, documents, building plans
- `/api/feedback` customer suggestions
- `/api/approvals` approval requests and customer decisions
- `/api/delays` delay and issue reporting
- `/api/tasks` pending task management
- `/api/notifications` notification center
- `/api/ai` future AI integration placeholders

## AI-Ready Architecture

`src/ai-services/ai.service.js` contains integration-ready service functions for image analysis, progress estimation, timeline prediction, material prediction, and chatbot replies. These endpoints return stable response contracts now and can later call OpenAI or any vision/model provider without changing dashboard routes.
