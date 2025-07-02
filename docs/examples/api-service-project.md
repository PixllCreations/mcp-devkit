# Example: API Service Project

This example demonstrates building a REST API service for a blog platform using mcp-devkit's systematic development approach.

## Project Overview

**Goal**: Create a scalable blog API with user management, content creation, and real-time features.

**Tech Stack**: Node.js, Express.js, TypeScript, PostgreSQL, Redis, JWT Authentication

## Project Setup

```bash
# Initialize API service project
mcp-devkit init blog-api --template api-service
cd blog-api
```

**Generated Structure:**
```
blog-api/
├── .mcp/
│   ├── project.json
│   ├── tasks.md
│   └── templates/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── app.ts
├── tests/
├── docker/
├── docs/
├── package.json
└── README.md
```

## Development Journey

### Phase 1: Architecture Planning

**Multi-Agent Architecture Review:**
```typescript
await mcp_plan_refinement({
  agents: ['architect', 'reviewer', 'optimizer'],
  focus: 'API architecture and database design',
  iterations: 2
});
```

**Planning Outcomes:**

**Agent Contributions:**
- **Architect**: Proposed layered architecture with controllers, services, and repositories
- **Reviewer**: Suggested authentication middleware and input validation patterns  
- **Optimizer**: Recommended caching strategy and database indexing approach

**Final Architecture:**
```
┌─────────────────┐
│   Controllers   │ ← HTTP request handling
├─────────────────┤
│   Middleware    │ ← Auth, validation, logging
├─────────────────┤  
│   Services      │ ← Business logic
├─────────────────┤
│   Repositories  │ ← Data access layer
├─────────────────┤
│   Models        │ ← Database schemas
└─────────────────┘
```

### Phase 2: Database Design

**Technical Review for Data Modeling:**
```typescript
await mcp_technical_review({
  focus: 'architecture',
  questions: [
    'How should we structure user relationships?',
    'What indexing strategy for blog posts?',
    'How to handle content versioning?'
  ]
});
```

**Database Schema (PostgreSQL):**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  status post_status DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Optimized indexes based on AI recommendations
CREATE INDEX idx_posts_author_status ON posts(author_id, status);
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_posts_slug ON posts(slug) WHERE status = 'published';
```

### Phase 3: Implementation with Drift Prevention

**Initial Implementation Focus:**
```typescript
// Get next task prioritization
await mcp_next_task({ 
  category: 'implementation',
  priority: 'high',
  timeAvailable: 180 // 3 hours
});
```

**Task Response:**
```json
{
  "task": {
    "id": "TASK-005",
    "title": "Implement user authentication system",
    "description": "JWT-based auth with login, register, refresh tokens",
    "estimatedTime": 150,
    "dependencies": ["TASK-002", "TASK-003"],
    "acceptance_criteria": [
      "Secure password hashing with bcrypt",
      "JWT token generation and validation",
      "Refresh token rotation",
      "Rate limiting on auth endpoints"
    ]
  }
}
```

**Drift Detection During Implementation:**
```typescript
await mcp_check_drift({
  currentFocus: 'implementing OAuth providers (Google, GitHub, Twitter)',
  context: 'spent 4 hours setting up multiple OAuth integrations'
});
```

**Drift Alert:**
```json
{
  "isDrifting": true,
  "driftType": "scope",
  "originalPlan": "JWT authentication for MVP",
  "recommendation": "OAuth can be added post-MVP",
  "suggestedAction": "Complete JWT auth first, defer OAuth to Phase 2"
}
```

### Phase 4: API Development

**Core API Endpoints Implementation:**

```typescript
// Posts Controller guided by mcp-devkit standards
export class PostsController {
  async createPost(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, content, excerpt, status } = req.body;
      
      // Validation middleware ensures clean input
      const post = await this.postsService.create({
        title,
        content, 
        excerpt,
        authorId: req.user.id,
        status: status || 'draft'
      });
      
      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully'
      });
    } catch (error) {
      next(error); // Error middleware handles response
    }
  }
}
```

**Validation Results:**
```bash
mcp-devkit validate --strict --format json
```

```json
{
  "summary": {
    "filesValidated": 28,
    "errors": 0,
    "warnings": 3,
    "suggestions": 7
  },
  "issues": [
    {
      "type": "warning",
      "file": "src/controllers/PostsController.ts",
      "message": "Consider adding request rate limiting",
      "suggestion": "Add @RateLimit decorator to endpoints"
    },
    {
      "type": "suggestion", 
      "file": "src/services/PostsService.ts",
      "message": "Add caching for frequently accessed posts",
      "suggestion": "Implement Redis caching for published posts"
    }
  ]
}
```

### Phase 5: Performance Optimization

**Performance Review:**
```typescript
await mcp_technical_review({
  focus: 'performance',
  files: [
    'src/controllers/PostsController.ts',
    'src/services/PostsService.ts',
    'src/repositories/PostsRepository.ts'
  ]
});
```

**Performance Findings:**
```json
{
  "findings": [
    {
      "category": "Database",
      "severity": "warning",
      "description": "N+1 query problem in posts list with author info",
      "recommendation": "Use JOIN query or eager loading"
    },
    {
      "category": "Caching", 
      "severity": "info",
      "description": "No caching layer for published posts",
      "recommendation": "Implement Redis caching with TTL"
    },
    {
      "category": "Pagination",
      "severity": "error", 
      "description": "Missing pagination on posts list endpoint",
      "recommendation": "Add limit/offset pagination with cursor support"
    }
  ]
}
```

**Optimizations Implemented:**
1. **Database Query Optimization:**
```sql
-- Before: N+1 queries
SELECT * FROM posts WHERE status = 'published';
-- For each post: SELECT * FROM users WHERE id = ?;

-- After: Single JOIN query  
SELECT p.*, u.username, u.email 
FROM posts p 
JOIN users u ON p.author_id = u.id 
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 20 OFFSET 0;
```

2. **Redis Caching Layer:**
```typescript
export class CachedPostsService extends PostsService {
  async getPublishedPosts(page: number = 1, limit: number = 20) {
    const cacheKey = `posts:published:${page}:${limit}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fallback to database
    const posts = await super.getPublishedPosts(page, limit);
    
    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(posts));
    
    return posts;
  }
}
```

## API Documentation

**Enhanced API Docs:**
```bash
mcp-devkit enhance docs/api.md --agent openai --role architect
```

**Generated OpenAPI Specification:**
```yaml
openapi: 3.0.0
info:
  title: Blog API
  description: |
    A comprehensive blog platform API with user management, content creation, 
    and real-time features. Built with mcp-devkit for maintainable, scalable architecture.
  version: 1.0.0
  contact:
    name: API Support
    email: api@blogplatform.com

servers:
  - url: https://api.blogplatform.com/v1
    description: Production server
  - url: https://staging-api.blogplatform.com/v1  
    description: Staging server

paths:
  /auth/login:
    post:
      summary: User login
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        200:
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        401:
          $ref: '#/components/responses/Unauthorized'
        429:
          $ref: '#/components/responses/RateLimited'

  /posts:
    get:
      summary: List published posts
      tags: [Posts]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query  
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: search
          in: query
          schema:
            type: string
            description: Search in title and content
      responses:
        200:
          description: Posts retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PostsListResponse'

components:
  schemas:
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
          example: user@example.com
        password:
          type: string
          minLength: 8
          example: secretpassword

    AuthResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            user:
              $ref: '#/components/schemas/User'
            accessToken:
              type: string
              description: JWT access token (15min expiry)
            refreshToken:
              type: string
              description: Refresh token (7 days expiry)
```

## Testing Strategy

**Comprehensive Test Suite:**
```typescript
// Integration tests guided by mcp-devkit standards
describe('Posts API', () => {
  describe('POST /posts', () => {
    it('should create post with valid data', async () => {
      const userData = await createTestUser();
      const token = generateJWT(userData.id);
      
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        status: 'published'
      };
      
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.slug).toBe('test-post');
    });
    
    it('should reject post without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ title: 'Test' })
        .expect(401);
        
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
```

**Test Coverage Results:**
```bash
mcp-devkit validate --format json | jq '.testing'
```

```json
{
  "coverage": {
    "lines": 96.8,
    "functions": 98.2, 
    "branches": 94.1,
    "statements": 96.8
  },
  "testTypes": {
    "unit": 124,
    "integration": 48,
    "e2e": 12
  },
  "performance": {
    "averageResponseTime": "45ms",
    "memoryLeaks": "none detected",
    "concurrentUsers": "tested up to 100"
  }
}
```

## Deployment Configuration

**Docker Setup:**
```dockerfile
# Multi-stage build optimized with mcp-devkit recommendations
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

**Production Deployment:**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: blog_api
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Project Outcomes

### Performance Metrics
- **Response Time**: Average 45ms (95th percentile: 120ms)
- **Throughput**: 1,000 requests/second sustained
- **Uptime**: 99.9% (production 6 months)
- **Error Rate**: <0.1%

### Code Quality
- **Test Coverage**: 96.8% lines, 98.2% functions
- **TypeScript Strict**: 100% compliance
- **ESLint**: Zero violations
- **Security Audit**: No vulnerabilities

### Business Impact
- **API Adoption**: 50+ client applications
- **Request Volume**: 2M+ requests/month
- **Developer Experience**: 4.8/5 satisfaction rating
- **Documentation**: 95% self-service success rate

## Key Benefits of mcp-devkit

1. **Architecture Guidance**: Multi-agent review prevented major refactoring
2. **Scope Management**: Drift detection saved 2+ weeks of scope creep
3. **Quality Assurance**: Continuous validation maintained 96%+ test coverage
4. **Professional Documentation**: AI-enhanced API docs reduced integration time by 60%
5. **Performance Optimization**: Systematic reviews identified 8 critical bottlenecks

## Lessons Learned

1. **Early Architecture Review**: Multi-agent feedback prevented 3 major redesigns
2. **Incremental Validation**: Catching issues early reduced debugging time by 70%
3. **Documentation-First**: OpenAPI spec guided implementation and testing
4. **Performance from Start**: Early optimization prevented costly refactoring

## Future Enhancements

1. **GraphQL API**: Alternative interface for complex queries
2. **Real-time Features**: WebSocket support for live comments
3. **Content Management**: Rich text editor and media uploads
4. **Analytics API**: Comprehensive metrics and reporting
5. **Multi-tenancy**: Support for multiple blog instances

---

This API service project demonstrates how mcp-devkit enables systematic development of production-ready APIs with proper architecture, comprehensive testing, and professional documentation.