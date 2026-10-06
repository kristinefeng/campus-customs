# AI Prompts Log for Campus Customs HW4

## Problem 1: Vibe Coder Prompts
✅ File created with template for all 13 problems

## Problem 2: Analyze the Database
✅ Created output/harness.md documenting all tables and fields

## Problem 3: Build the Campus Customs Website
✅ Scaffolded React + Vite + TypeScript frontend with nav, pages, products grid
✅ Built FastAPI backend with product endpoints and image serving
✅ Created floating chat panel stub for later integration

## Problem 4: Create Account and Login
✅ **COMPLETE & TESTED** - Login working with test user!

Built complete authentication system:
- FastAPI endpoints for register/login
- Bcrypt password hashing (12 rounds + unique salt)
- Frontend login form with token storage
- User email display in navbar + logout button
- Verified login works with test@campuscustoms.yale.edu / password

## Problem 5: PydanticAI Agent Backend
✅ **AGENT LOADED & READY**

Built complete agent backend:
- `backend/prompts/prompt.md` - Campus Customs voice + safety guardrails
- `backend/agent.py` - PydanticAI agent with Portkey configuration
- `backend/tools.py` - Product search, details, inventory, featured items
- `backend/models.py` - Pydantic types for ChatRequest/ChatResponse
- `backend/main.py` - Updated `/api/chat` endpoint
- Agent configured to use OpenAI gpt-4o-mini via Portkey
- Portkey API key stored in `.env` and loaded at startup

## Problem 6: Product Info & Stock Tools
✅ **COMPLETE & TESTED**

Built database-backed tools that return REAL prices and inventory:
- Enhanced system prompt with explicit tool usage rules
- 4 tools for product lookup: search_catalog, get_product, check_availability, browse_popular
- All prices pulled from `catalogue.price` field in database
- All stock levels pulled from `inventory.quantity` field by size
- Agent never invents prices or quantities
- Out-of-stock items reported clearly when quantity = 0
- Documented all tools in output/harness.md with database queries and field usage

Testing Results:
✅ Price lookup: Returns $68 for Basic Hoodie (real database value)
✅ Stock check all sizes: Returns XS:15, S:5, M:5, L:8, XL:2, XXL:25 (real quantities)
✅ Stock check specific size: Returns "8 in stock" for Large (real database value)
✅ Search by keyword: Returns crew merchandise matching search_tags in database

## Problem 7: Chat Search that Updates the Page
✅ **COMPLETE**

Built seamless chat-to-products integration:
- Frontend captures search results from chat responses
- Dynamically displays matching products on Products page
- Search results flow through API contract: ChatResponse.products → frontend rendering
- Each product card clickable to show detail view (large image + full description)
- Detail view has "Back to Products" button to return to grid
- Search context preserved in page title: "Search Results for 'hoodies'"
- Clicking Products navbar link clears search and shows full catalog

Frontend Changes:
- Added searchQuery state to track active search
- Added selectedProduct state for detail view
- handleChatSend() now checks if response.products exists and displays them
- Products page renders search results or full catalog based on state
- Added product-detail page with large image, full info, back button
- Responsive grid layout for product cards

Documentation:
- Updated prompts/prompt.md with search results & page updates section
- Added comprehensive Problem 7 section in output/harness.md with:
  - API contract flow (chat → search → page display)
  - Frontend state management
  - How chat triggers page updates
  - Product detail view behavior
  - Database queries and fields
  - User experience scenarios
  - Code flow diagram
  - Testing procedures

## Problem 8: Customer Memory & Chat History
✅ **COMPLETE**

Built persistent chat history with customer context:

Frontend:
- useEffect loads chat history on login via GET /api/chat/history
- Sends page context (current_product_id, current_product_name) with messages
- Disables chat input for guests, enables for logged-in users
- Clears chat on logout

Backend:
- get_user_info() fetches customer name + email from users table
- save_chat_message() stores messages to chat_messages with products_json
- get_chat_history() retrieves messages for returning users
- POST /api/chat accepts current_product_id and current_product_name
- GET /api/chat/history returns chat history for user

Agent:
- Accepts user_name, user_email, current_product_id, current_product_name parameters
- Injects context headers: [Customer: name (email)], [Currently viewing: product]
- Uses context in responses for personalization and product-aware answers
- Enables natural questions like "do you have this in pink?"

Database:
- chat_messages table stores all messages with user_id foreign key
- products_json field serializes recommended products
- Guests don't have messages saved (user_id required)

Documentation:
- Updated prompt.md with "What You Know About the Customer" section
- Added example conversations showing personalization
- Comprehensive Problem 8 section in harness.md covering:
  - Database structure and examples
  - Frontend load/save flow
  - Backend endpoints and context passing
  - Agent context implementation
  - Security & privacy measures
  - Testing procedures
  - Data flow diagram
