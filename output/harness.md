# Campus Customs Full-Stack Harness Documentation

**Status:** Problems 1-13 complete  
**Last verified:** October 6, 2026

## Executive Summary

Campus Customs is a full-stack AI-powered college merchandise e-commerce system combining React frontend, FastAPI backend, PydanticAI agent, and SQLite database with comprehensive safety auditing.

- **Frontend:** React + Vite + TypeScript (localhost:5178)
- **Backend:** FastAPI + PydanticAI + SQLite (localhost:8000)
- **Agent:** OpenAI gpt-4o-mini via Portkey with 4 database tools
- **Safety:** Append-only audit trail logging + system prompt guardrails

## Architecture

```
React (localhost:5178) 
    ↓ HTTP/JSON
FastAPI (localhost:8000)
    ↓ Agent calls tools
PydanticAI Agent (OpenAI gpt-4o-mini)
    ↓ Tool calls
SQLite Database
    ↓ Audit logging
output/audit_trail.json (append-only)
```

## Data Models (models.py) - Why Each Field

### ProductCard
```python
product_id: str           # Unique identifier from database
name: str                 # Display name for product cards
price: float              # Real price from catalogue (never guessed)
image_file_path: str      # Path to image file
description: str          # Short description for cards
```

### ChatRequest & ChatResponse
```python
# Request fields enable context injection
message: str              # User's question
user_id: Optional[int]    # For personalization & history
current_product_id: str   # Product being viewed (context)
current_product_name: str # Friendly product name

# Response carries products for dynamic display
content: str              # Agent's text (markdown)
products: List[ProductCard]  # Search results with [PRODUCT:] markers
success: bool             # Whether agent succeeded
message: Optional[str]    # Error message if failed
```

**Why:** ProductCard is lightweight for chat. ProductDetails includes full inventory for detail page (size selector). Request context enables personalization.

### ProductDetails + InventoryItem
```python
inventory: List[InventoryItem]  # All sizes with quantities
InventoryItem:
  size: str               # Size code (XS, S, M, L, XL, XXL)
  quantity: int           # Real stock count
  in_stock: bool          # Computed: quantity > 0
```

**Why:** Full model needed for product detail page showing size selector with real inventory.

## Tools & Abilities

### 4 Database Tools (All Logged to Audit Trail)

**1. search_catalog(query: str) → str**
- Finds products by keyword, color, garment type, search tags
- Returns 5 matching products with real-time stock status
- Database: Queries catalogue table
- Audit: Logged as "search_catalog" with query + result count
- Used for: "Do you have hoodies?" → Returns formatted list with stock

**2. get_product(product_id: str) → str**
- Gets complete product detail: name, price, description, colors, ALL sizes + quantities
- **CRITICAL:** Always call for price questions (never guess prices)
- Database: Queries catalogue + inventory JOIN
- Audit: Logged with product_id + found/not_found status
- Used for: Price queries, recommendation details, before suggesting items

**3. check_availability(product_id: str, size: Optional[str]) → str**
- Checks real stock levels for product (all sizes or specific size)
- **CRITICAL:** Always call for stock questions (never guess)
- Database: Queries inventory table
- Audit: Logged with product_id, size, and quantity result
- Used for: "Do you have medium?" → Returns exact count per size

**4. browse_popular() → str**
- Returns 10 featured products with prices and descriptions
- Database: Queries catalogue table
- Audit: Logged with result count
- Used for: "What do you recommend?" without specific search

## Safety Rules (Comprehensive)

### 7 Mandatory Rules Enforced in System Prompt

**Rule 1: Database-First Authority**
- NEVER invent prices, inventory, or product details
- SQLite database is the only source of truth
- All 4 tools query live database for real data
- If tool returns nothing, say so—don't fabricate results

**Rule 2: Data Privacy & Security**
- NEVER ask for or repeat passwords, credit card numbers, SSNs
- NEVER store sensitive data beyond what user provides
- NEVER access user info not in context brackets
- Warn users: "Please don't share full payment info in chat"

**Rule 3: Scope Boundaries**
- ONLY help with Campus Customs products and shopping
- NEVER provide: homework help, medical advice, legal advice, financial investing, political opinions
- For out-of-scope: Redirect to support@campuscustoms.yale.edu
- NEVER pretend to be human employee or leadership

**Rule 4: Honesty & Transparency**
- If out of stock: Say "Out of stock in size X" clearly—NEVER suggest unavailable alternatives unless asked
- If product not found: Say "Not in our catalog"—don't make one up
- If you don't know: Say so instead of guessing
- Be clear about limitations

**Rule 5: User Respect & Inclusivity**
- Keep all interactions respectful and free from harassment, discrimination, bias
- NEVER assume customer identity, preferences, or purchasing power
- Use customer names only if provided in context
- If customer frustrated, empathize and offer human support escalation

**Rule 6: Rate Limiting & Abuse Prevention**
- If customer makes >10 rapid tool calls: Slow down, ask clarifying questions
- If same query repeats >3 times: Offer support escalation instead of looping
- Audit trail tracks frequency; repeat patterns flagged for review

**Rule 7: Content Integrity**
- NEVER include external links except official campuscustoms.yale.edu domains
- NEVER recommend products not in our catalog (no outside stores)
- NEVER modify tool responses—quote database results exactly
- NEVER make up product variations (colors, sizes) that don't exist in inventory
- ALWAYS include [PRODUCT:] markers so frontend can display product cards

## Audit Trail System

### Location & Format
**File:** `output/audit_trail.json` (append-only, never cleared between runs)

**Structure:** Array of JSON objects, one per tool call
```json
[
  {
    "timestamp": "2026-10-05T20:45:32.123456",
    "tool": "search_catalog",
    "args_summary": "{'query': 'navy hoodie'}",
    "result_summary": "Found 3 results",
    "stop_reason": "success"
  },
  {
    "timestamp": "2026-10-06T03:02:53.580576",
    "tool": "get_product",
    "args_summary": "{'product_id': 'basic-hoodie-big-yale'}",
    "result_summary": "Retrieved: Basic Hoodie Big Yale",
    "stop_reason": "success"
  }
]
```

### What Gets Logged
- **timestamp:** UTC ISO format (sortable, queryable)
- **tool:** `search_catalog`, `get_product`, `check_availability`, `browse_popular`,
  or `system` (the last records agent load/load-failure at startup)
- **args_summary:** First 100 chars of arguments (prevents file bloat)
- **result_summary:** First 100 chars of result (outcome tracking)
- **stop_reason:** `success`, `not_found` (get_product found no such product), or
  `error` (check_availability returned an error, or the agent failed to load)

### Why Append-Only
- Complete immutable history of all agent activity
- Enables compliance & safety reviews
- Detects patterns (rate limits, scope violations, repeated errors)
- No data loss; can't be edited or deleted retroactively
- One entry per tool call for easy auditing

### Safety Review Workflow
1. **Real-time:** Backend logs each tool call as it happens
2. **Post-session:** Audit trail complete for review
3. **Weekly:** Analyst reviews for policy violations
4. **Monthly:** Trends analyzed (high rate limits, out-of-scope patterns, etc.)
5. **Quarterly:** Safety metrics reported to stakeholders

## System Specifications

### Frontend (React/Vite/TypeScript)
- **Port:** localhost:5178 (or next available)
- **Build:** npm install && npm run dev
- **Pages:**
  - Home: Brand intro + CTA
  - Products: Grid with real-time search bar
  - Product Detail: Image, description, size selector (real inventory)
  - Chat: Floating widget, red gradient button
- **State:** React hooks, localStorage auth
- **Design:** Problem 10 premium (gradients, animations, hover effects)
- **API Calls:** fetch to http://localhost:8000/api/*

### Backend (FastAPI/PydanticAI)
- **Port:** localhost:8000
- **Framework:** FastAPI (async)
- **Database:** SQLite; path from `DATABASE_PATH` in `.env`
  (falls back to `~/Downloads/data 2/campus_customs.db`)
- **Product images:** served from `PRODUCTS_PATH` in `.env`
- **Auth:** bcrypt password hashing (12 rounds)
- **Agent:** OpenAI gpt-4o-mini via Portkey gateway
- **Logging:** Audit trail to output/audit_trail.json

### Database Schema
```sql
-- Users table
users (id, first_name, last_name, email, password_hash, name)

-- Products catalog
catalogue (product_id, name, price, garment_type, description, colors, search_tags, image_file_path)

-- Real-time inventory
inventory (product_id, size, quantity)

-- Chat history
chat_messages (id, user_id, role, content, products_json, created_at)
```

### Agent Configuration
- **Model:** OpenAI gpt-4o-mini via Portkey
- **Tools:** search_catalog, get_product, check_availability, browse_popular
- **System Prompt:** backend/prompts/prompt.md (284 lines, including the 7 safety rules)
- **Context Injection:**
  ```
  [Customer: Sarah Chen (sarah@yale.edu)]
  [Currently viewing product: Basic Hoodie Big Yale]
  ```

## Customer Memory & Chat History

### How history is stored
Every exchange for a signed-in shopper is written to `chat_messages` as two rows
(one `user` role, one `assistant`), keyed by `user_id`. Any product cards returned
with a reply are serialised into `products_json` so the cards re-render exactly as
they first appeared. `POST /api/chat` only writes when the request carries a
`user_id`.

### Guests vs logged-in shoppers
Guests can chat normally — the input is live and the agent answers with the same
tools and data. Their conversation simply is not persisted, so it disappears on
refresh; the input placeholder reads "Ask something... (history not saved)".
Logged-in shoppers get the same chat plus persistence: `GET /api/chat/history`
reloads their last 50 messages in chronological order when they sign back in, and
logging out clears the panel.

### What the agent knows about the customer
`get_user_info()` reads `first_name`, `last_name`, and `email` from `users` and the
chat endpoint injects them as a context header. Password hashes are never loaded
into agent context.

```
[Customer: Sarah Chen (sarah@yale.edu)]
```

### How page context is passed
The front end sends `current_product_id` and `current_product_name` with each
message, prepended as a second context header. A separate `contextProduct` state
keeps the referent alive after the shopper navigates back to the grid, so a
follow-up like "do you have this in pink?" still resolves to the right item.

```
[Currently viewing product: Basic Hoodie Big Yale]
```

## How to Run Full Stack

### 1. Start Backend
```bash
# From the repository root, after `pip install -r requirements.txt`
# and filling in .env (PORTKEY_API_KEY, DATABASE_PATH, PRODUCTS_PATH)
cd backend
uvicorn main:app --reload --port 8000
# Verify: curl http://localhost:8000/ → {"message": "Campus Customs API"}
```

### 2. Start Frontend
```bash
# From the repository root
cd frontend
npm install
npm run dev
# Opens http://localhost:5178
```

### 3. Test the App
- Register account → Chat saved with history
- Browse products → Real-time search bar
- Click product → Size selector with real inventory
- Ask chat "Do you have hoodies?" → Product cards appear
- Click card → Navigate to product detail

### 4. Verify Audit Trail
```bash
cat output/audit_trail.json | jq '.'
# Shows: timestamp, tool, args, result, stop_reason for every tool call
```

## Loop Limits & Result Caps

Enforced in code:

| Cap | Value | Where |
|---|---|---|
| Agent tool calls per message | 20 | `AGENT_USAGE_LIMITS` in `backend/agent.py`, passed to `agent.run()` |
| Agent output tokens per reply | 2000 | same `UsageLimits` object |
| Results per `search_catalog` | 5 | `search_products(query, limit=5)` |
| Results per `browse_popular` | 10 | `get_popular_products(limit=10)` |
| Chat history reloaded on login | 50 most recent | `get_chat_history(user_id, limit=50)` |
| Audit `args_summary` / `result_summary` | 100 chars each | `log_audit_trail()` |

The tool-call cap is deliberately well above normal usage. One category question
("do you have hoodies?") legitimately costs about 7 calls — a single
`search_catalog` plus a `check_availability` per result — so 20 leaves headroom
for ordinary multi-product conversations while still halting a runaway loop.
Exceeding it raises `UsageLimitExceeded`, which `chat_with_agent()` catches and
returns to the shopper as a failed `ChatResponse` rather than a crash.

Not configured: there is no explicit SQLite query timeout and no connection pool.
Each request opens its own short-lived `sqlite3.connect()` and closes it, which is
adequate for a single-shop dataset of ~100 products but would need revisiting
under real concurrency.

## Problem 12 Completion Checklist

✅ **Audit Trail**
- Append-only JSON at output/audit_trail.json
- All four tools log: timestamp, tool, args, result, stop_reason
- Never cleared between runs — verified by restarting the backend repeatedly
  during testing and confirming the file only ever gained entries (0 deletions)
- Enables compliance review and pattern detection

✅ **Safety Rules**
- 7 mandatory rules in the system prompt (backend/prompts/prompt.md)
- Database-first authority enforced
- Data privacy, scope boundaries, honesty all documented
- Rule 6's soft rate-limiting guidance is backed by a hard `tool_calls_limit`
  of 20 enforced in code, so a looping agent is stopped regardless of the prompt
- Audit logging makes violations detectable

✅ **Harness Documentation**
- This file covers: architecture, models (why each field), tools, safety
- Specs: frontend, backend, agent, database
- How to run: backend + frontend + test
- Loop limits, result caps, configuration details
- Audit trail system fully documented

---

**Last Tested:** October 6, 2026 — backend started with
`uvicorn main:app --reload --port 8000` from `backend/`, served 102 catalogue
products, and answered live stock and price questions from the database.  
**Problems Complete:** 1-13 ✅
