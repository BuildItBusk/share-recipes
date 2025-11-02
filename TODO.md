# TODO - Technical Improvements & Maintenance

This document tracks non-feature work: technical debt, infrastructure improvements, refactoring, security hardening, and code quality enhancements.

**Note**: This is for maintenance tasks, not new features. Feature ideas go elsewhere.

**⚠️ This file is committed to the repository - DO NOT include secrets, credentials, or private information.**

---

## ✅ Completed

- [x] Security headers (CSP, X-Frame-Options, HSTS, etc.) - [commit 588449f](../../commit/588449f)
- [x] Input validation with Zod (200K character limits) - [commit dc7c366](../../commit/dc7c366)
- [x] Environment variable validation at startup
- [x] Rate limiting (Upstash Redis)
- [x] System prompt caching (performance)

---

## High Priority - Should Do Soon

### Error Handling
- [ ] Add error boundaries
  - [ ] Create `app/error.tsx` for root-level errors
  - [ ] Create `app/r/[id]/error.tsx` for recipe page errors
  - [ ] Create `app/global-error.tsx` for global error handler
  - [ ] Test error recovery and graceful degradation

### Monitoring & Observability
- [ ] Add error tracking (Sentry, Datadog, or similar)
  - [ ] Replace console.error() with structured logging
  - [ ] Track OpenAI API failures and costs
  - [ ] Monitor rate limit hits
  - [ ] Set up alerts for critical errors
- [ ] Add structured logging library (pino, winston, or similar)
  - [ ] Update all 8+ console.error() calls
  - [ ] Log request IDs for tracing
  - [ ] Add log levels (error, warn, info, debug)

### API Resilience
- [ ] Add timeouts to OpenAI API calls
  - [ ] Set reasonable timeout (30-60 seconds)
  - [ ] Handle timeout errors gracefully
- [ ] Add retry logic for transient failures
  - [ ] Retry OpenAI API calls (exponential backoff)
  - [ ] Retry database operations
- [ ] Add explicit request body size limits
  - [ ] Set in next.config.ts (currently defaults to 4MB)

### Health & Reliability
- [ ] Create health check endpoint
  - [ ] GET /api/health or /api/healthz
  - [ ] Check database connectivity
  - [ ] Check Redis connectivity
  - [ ] Return 200 if healthy, 503 if unhealthy

---

## Medium Priority - Nice to Have

### Database Optimization
- [ ] Add database indexes
  - [ ] Index on `createdAt` if querying by date
  - [ ] Consider compound indexes for common queries
- [ ] Review Prisma configuration
  - [ ] Disable query logging in production
  - [ ] Configure connection pooling for serverless
- [ ] Consider hash-based deduplication
  - [ ] More efficient than string comparison for duplicate detection

### SEO & Discovery
- [ ] Add `robots.txt`
  - [ ] Allow crawling of recipe pages
  - [ ] Block admin/API routes
- [ ] Add `sitemap.xml`
  - [ ] Dynamic sitemap generation
  - [ ] Include recipe pages
- [ ] Add Open Graph images
  - [ ] Generate OG images for shared recipes
  - [ ] Use recipe title/preview
- [ ] Add Schema.org structured data
  - [ ] Recipe markup for rich snippets
  - [ ] Better SEO for recipe searches

### Testing & CI/CD
- [ ] Add test coverage
  - [ ] API route tests
  - [ ] Validation schema tests
  - [ ] Component tests
- [ ] Add CI/CD pipeline
  - [ ] GitHub Actions or similar
  - [ ] Run tests on PR
  - [ ] Automated deployment to Vercel
- [ ] Document deployment process
  - [ ] Environment variable setup
  - [ ] Database migration strategy

---

## Low Priority - Eventually

### Performance
- [ ] Implement edge runtime for GET /api/recipe/[id]
  - [ ] Faster global response times
  - [ ] Lower costs
- [ ] Add caching headers to API routes
  - [ ] Cache formatted recipes
  - [ ] Set appropriate Cache-Control headers
- [ ] Consider Redis caching for recipes
  - [ ] Cache frequently accessed recipes
  - [ ] Reduce database load

### Security Improvements
- [ ] Improve recipe ID generation
  - [ ] Increase from 8 to 10 characters
  - [ ] Lower collision probability
- [ ] Add CORS configuration
  - [ ] If building public API
  - [ ] Restrict allowed origins
- [ ] Review OpenAI API error handling
  - [ ] Handle specific error types (rate limits, quota)
  - [ ] Implement circuit breaker pattern

### Business Logic
- [ ] Review OpenAI model configuration
  - [ ] Verify "gpt-5-nano" model name is correct
  - [ ] Consider fallback models
- [ ] Add cost controls
  - [ ] Set OpenAI API budget limits
  - [ ] Alert on unusual usage patterns
- [ ] Review validation "fail open" behavior
  - [ ] `validateIsRecipe` proceeds on error (line 44)
  - [ ] Consider if this is desired behavior

---

## Notes

### Cost Analysis (Current State)
- Model: gpt-5-nano ($0.05/1M input, $0.40/1M output)
- Input limit: 200K chars ≈ 50K tokens
- Rate limit: 30 requests/hour
- **Worst case cost**: ~$0.23/hour ($100/month if continuously abused)

### Security Posture
- ✅ Security headers implemented
- ✅ Input validation with length limits
- ✅ Rate limiting active
- ✅ Environment variables validated
- ✅ SQL injection prevented (Prisma ORM)
- ✅ XSS prevented (react-markdown)
- ⚠️ No error boundaries yet
- ⚠️ No monitoring/alerting yet

### Technical Debt
- System prompt file caching implemented ✅
- Database query logging still enabled in production
- 8+ console.error() calls need structured logging
- No test coverage (0 tests)
