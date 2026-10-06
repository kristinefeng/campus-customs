# Campus Customs - AI-Powered College Merchandise E-Commerce

A full-stack web application combining React frontend, FastAPI backend, and PydanticAI agent for an intelligent college merchandise shopping experience.

## Features

✨ **AI-Powered Shopping**
- PydanticAI agent (OpenAI gpt-4o-mini) understands customer intent
- Real-time inventory checking from SQLite database
- Semantic color matching ("blue" → navy, cobalt, sky blue)
- Context-aware recommendations based on viewed products

🛍️ **Smart E-Commerce**
- Product search with real-time filtering
- Dynamic product cards with images and prices
- Size selector showing real inventory levels
- Chat-based and traditional browse-based shopping

🔐 **Security & Safety**
- Database-first architecture (no hallucination)
- Append-only audit trail logging of all agent activity
- User authentication with bcrypt password hashing
- Chat history persistence
- Safety rules enforced at system prompt level

📊 **Documentation**
- Complete system architecture (harness.md)
- Design system and premium UX (design.md)
- Usability improvements (usability.md)
- App testing report (app_check.html)
- Audit trail of all agent tool usage

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- SQLite3
- Portkey API key (from https://portkey.ai/)

### 1. Backend Setup

```bash
# Clone and navigate to the project
git clone https://github.com/kristinefeng/campus-customs.git
cd campus-customs

# Create .env from the template
cp .env.example .env
```

Edit `.env` and set your `PORTKEY_API_KEY`. Also set `DATABASE_PATH` and
`PRODUCTS_PATH` to wherever you unzipped the course data, since the database
and product images are not committed to this repository:

```bash
PORTKEY_API_KEY=your_key_here
DATABASE_PATH=/path/to/campus_customs.db
PRODUCTS_PATH=/path/to/products
```

Then install dependencies and start the server:

```bash
pip install -r requirements.txt

# The backend runs from inside the backend/ folder
cd backend
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

### 2. Frontend Setup

```bash
# In a new terminal, from the repository root
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens on http://localhost:5173 (or next available port)
```

### 3. Test the Application

1. **Register an account** → Navigate to Login, create new account
2. **Browse products** → Click Products, use search bar to filter
3. **View product details** → Click any product card
   - See size selector with real inventory counts
   - Example: "M (5 in stock)" or "L (Out of stock)"
4. **Chat with AI** → Click red chat button
   - Ask: "Do you have hoodies?"
   - Ask: "What do you have in blue?"
   - Ask: "Do you have medium in the navy hoodie?"
5. **Check audit trail** → View `output/audit_trail.json`
   - Shows timestamp, tool, args, result for every agent call

## System Architecture

```
┌─ Frontend (React/Vite/TypeScript)
│  └─ localhost:5173
├─ Backend (FastAPI/PydanticAI)
│  └─ localhost:8000
├─ Agent (OpenAI gpt-4o-mini via Portkey)
│  └─ 4 database tools: search, get_product, check_availability, browse_popular
└─ Database (SQLite)
   ├─ catalogue (products)
   ├─ inventory (stock by size)
   ├─ users (auth & chat history)
   └─ chat_messages (conversation logs)
```

## Key Technologies

**Frontend:**
- React 18 with TypeScript
- Vite (fast bundler)
- CSS3 with variables (responsive design)
- Real-time search filtering
- Premium UI animations

**Backend:**
- FastAPI (async Python web framework)
- PydanticAI (agent framework)
- Portkey (OpenAI-compatible gateway)
- SQLite (local database)
- Bcrypt (password hashing)

**Agent:**
- OpenAI gpt-4o-mini model
- System prompt with safety rules (prompts/prompt.md)
- 4 database tools with real inventory access
- Append-only audit logging

## Database Setup

The project expects a SQLite database at `~/Downloads/data 2/campus_customs.db` with:

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    name TEXT
);

-- Products catalog
CREATE TABLE catalogue (
    product_id TEXT PRIMARY KEY,
    name TEXT,
    price FLOAT,
    description TEXT,
    colors TEXT,
    image_file_path TEXT
);

-- Inventory (stock by size)
CREATE TABLE inventory (
    product_id TEXT,
    size TEXT,
    quantity INTEGER
);

-- Chat history
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    role TEXT,
    content TEXT,
    created_at DATETIME
);
```

Product images should be in `~/Downloads/data 2/products/` directory.

## Documentation

- **[harness.md](output/harness.md)** - Complete system specification
  - Architecture overview
  - Data models (why each field)
  - Tools and abilities
  - Safety rules
  - Database schema
  - How to run full stack
  - Loop limits and specs

- **[design.md](output/design.md)** - Premium UI/UX design
  - Color system and typography
  - Product card interactions
  - Chat widget design
  - Animation and motion
  - Conversion impact metrics

- **[usability.md](output/usability.md)** - Problem 9 improvements
  - Search bar with real-time filtering
  - Size selector with inventory display
  - Semantic color matching
  - Auto-inventory awareness

- **[app_check.html](output/app_check.html)** - Testing report with screenshots
  - 3 core features tested and verified
  - Chat inventory checking
  - Dynamic search results
  - Size selector with real stock display

## Safety & Security

### Audit Trail
Every agent tool call is logged to `output/audit_trail.json` (append-only):
```json
{
  "timestamp": "2026-10-05T20:45:32.123456",
  "tool": "search_catalog",
  "args_summary": "{'query': 'navy hoodie'}",
  "result_summary": "Found 3 results",
  "stop_reason": "success"
}
```

### Safety Rules (7 Mandatory)
1. **Database-First Authority** - Never invent prices/inventory
2. **Data Privacy** - No passwords or payment info in chat
3. **Scope Boundaries** - Only help with shopping
4. **Honesty & Transparency** - Always report out-of-stock truthfully
5. **User Respect** - No harassment or discrimination
6. **Rate Limiting** - Prevent tool call abuse
7. **Content Integrity** - Only recommend products in catalog

See [harness.md](output/harness.md) for full safety documentation.

## Problems Completed

✅ **Problem 1-5:** Database analysis, schema design, schema execution, data validation, account/login  
✅ **Problem 6-8:** Chat integration, semantic search, context injection  
✅ **Problem 9:** Usability improvements (search bar, size selector, inventory awareness, color matching)  
✅ **Problem 10:** Premium design system (colors, typography, animations, premium feel)  
✅ **Problem 11:** App testing report with screenshots (3 core features verified)  
✅ **Problem 12:** Audit trail logging, safety rules, harness documentation  
✅ **Problem 13:** GitHub repository with public code (this repo)

## Project Structure

```
campus-customs/
├── README.md                    # This file
├── .env.example                 # Template for environment variables
├── .gitignore                   # Git ignore rules
├── AI_prompts.md                # Custom prompts documentation
├── requirements.txt             # Python dependencies
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── agent.py                 # PydanticAI agent with tools
│   ├── models.py                # Pydantic data models
│   ├── tools.py                 # Database query tools
│   └── prompts/
│       └── prompt.md            # System prompt with safety rules
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main React component
│   │   ├── App.css              # Premium styling
│   │   └── main.tsx             # React entry point
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   └── tsconfig.json            # TypeScript configuration
└── output/
    ├── harness.md               # Complete system documentation
    ├── design.md                # Design system documentation
    ├── usability.md             # Usability improvements (P9)
    ├── app_check.html           # Testing report with screenshots
    ├── app_check_images/        # Test screenshots
    └── audit_trail.json         # Append-only agent activity log
```

## Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
# Required: Your Portkey API key from https://portkey.ai/
PORTKEY_API_KEY=your_key_here

# Optional: Override database path
# DATABASE_PATH=/path/to/campus_customs.db

# Optional: Override products image directory
# PRODUCTS_PATH=/path/to/products
```

⚠️ **Important:** Never commit `.env` file to git. Use `.env.example` as template.

## Running Full Stack

**Terminal 1 - Backend** (from the repository root):
```bash
cd backend
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

**Terminal 2 - Frontend** (from the repository root):
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

Then visit http://localhost:5173 in your browser.

## Troubleshooting

**Backend won't start:**
- Check `PORTKEY_API_KEY` is set in `.env`
- Verify `DATABASE_PATH` in `.env` points at an existing `campus_customs.db`
- Check port 8000 is available: `lsof -i :8000`

**Frontend won't load products:**
- Ensure backend is running: `curl http://localhost:8000/`
- Check browser console for CORS errors
- Verify database has products in catalogue table

**Chat not working:**
- Check backend logs for agent errors
- Verify PORTKEY_API_KEY is valid
- Check audit_trail.json for failed tool calls

## License

This is a capstone project for "AI Foundations for Managers" at Yale SOM.

## Authors

- Claude Code (AI Assistant)
- Kristine Feng (Project Lead)

---

**Last Updated:** October 5, 2026  
**Status:** Production Ready (Problems 1-13 Complete)
