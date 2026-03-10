# Tech Spec: [Feature Name]

**Feature ID:** [FEAT-YYYYMMDD-slug]
**PRD:** `docs/features/[feature]/prd.md`
**Author:** Architect
**Status:** Draft / In Review / Approved
**Date:** [YYYY-MM-DD]

## Overview

[Brief technical summary of what this feature requires. Reference the PRD for product context.]

## Architecture

### System Context
[How does this feature fit into the existing system? Which components are affected?]

### Component Diagram
```
[ASCII or Mermaid diagram showing component interactions]
```

### Data Flow
[Step-by-step description of how data moves through the system for the primary use case.]

## Data Model / ERD

### New Tables
```sql
CREATE TABLE [table_name] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- columns
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### Schema Changes to Existing Tables
[Describe any ALTER TABLE operations needed]

### RLS Policies
```sql
-- Policy: [table]_[action]_[description]
CREATE POLICY [policy_name] ON [table]
  FOR [SELECT/INSERT/UPDATE/DELETE]
  USING (auth.uid() = user_id);
```

## API Contracts

### [Endpoint Name]
- **Method:** GET / POST / PUT / DELETE
- **Path:** `/api/[resource]`
- **Auth:** Required / Public
- **Request Body:**
  ```json
  { "field": "type" }
  ```
- **Response (200):**
  ```json
  { "field": "type" }
  ```
- **Error Responses:** 400, 401, 404, 500

## Task Breakdown

| Task ID | Description | Dependencies | Est. Complexity |
|---------|-------------|--------------|-----------------|
| TASK-001 | [Description] | None | S / M / L |
| TASK-002 | [Description] | TASK-001 | S / M / L |

## Non-Functional Requirements

- **Security:** [Auth, RLS, input validation requirements]
- **Performance:** [Latency targets, query optimization notes]
- **Scalability:** [Concurrency expectations, indexing strategy]
- **Observability:** [Logging, error tracking requirements]

## Migration Strategy

[How will this be deployed? Any data backfill needed? Feature flags?]

## Open Questions

- [ ] [Unresolved technical question]
