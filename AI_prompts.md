# AI Prompt Log — Campus Customs (HW4)

This file is the log of what I typed to the vibe coder while building Campus Customs. Prompts are reproduced verbatim (including typos). Runtime prompt files for the agent live in `backend/prompts/`.

> Note: two secrets were pasted into the chat during the assignment (a Portkey API key and a GitHub token). They are redacted below and are not stored anywhere in this repository.

---

## Assignment setup

> Hello, i want to partner with you on HW4. can you write a joke within the hw4 folder so i know we are working within the same space

> https://zlisto.github.io/mgt_409_fa26/hw4/p1.html heres the website of the hw assignment 1-13, can you see all the steps? ill work with you step by step problem by problem, but do you have a good understanding?

> @"/Users/kristinefeng/Downloads/data 3/"
> heres the scenario for the hw assingment. i have also attacehd the data.zip file (i unzipped it for you) it should just be called data 3.

---

## Problem 1 — Vibe coder prompts

- **Status:** Complete.
- **Prompt typed:**

  > Thanks. let's start with Problem 1: "Vibe coder prompts:
  > create an "AI_prompts.md" file now that you will keep updated as we work. this file is the log of what i've typed to you
  >
  > put one section for each problem. each section must include:
  >
  > * the problem number and title (i will provide)
  > * at least one prompt I typed
  > * one follow-up promt if i needed it (and one sentence on what was lacking after the first)

- **Follow-up prompts:**

  > thanks. i need you to fix a few things before i submit
  >
  > 1. AI_prompts.md does NOT currently satisfy Problem 1.
  >
  > The assignment explicitly requires one section per problem containing the actual prompt you typed, written in your own words, and a follow-up prompt plus a sentence explaining what was lacking if a follow-up was necessary.
  > Your file instead says things like:
  > "✅ COMPLETE & TESTED"
  > "Built complete authentication system"
  > "Built seamless chat-to-products integration"
  >
  > Those are descriptions of what was accomplished, not the prompts i gave you. please go back and update ai_prompts.md to cover all of the prompts ive given you

  > AI_prompts.md -- can you update this to include our entire prompt history?? it still is showing a summarized version

  > go back in our chat history for this hw4 and redo ai_prompts.md to satisfy the following:
  > create ai_prompts.md at the start of the assignment and keep it updated as we work. this file is the log of what i've typed to the vibe coder. put one section for each problem. each section must include
  >
  > * the problem number and title
  > * at least one prompt i typed
  > * one follow-up prompt if we needed it (and one sentence on what was lacking after the first)

  > @"/Users/kristinefeng/Desktop/AI Foundations for Managers/hw1 2/AI_prompts.md"
  > can you update with the WHOLE ENTIRE PROMPT. use the above file (past hw #2 assignment) as a reference for what i'm looking for in terms of structure. reconstruct something similar but with the prompts from this hw4 assignment.

  > you can parse the transcript file. take your time. go back and find all of the full prompts from our transcript history.

  > i still dont think you've captured the whole prompts in their entirety. can you add that in at a minimum

- **What was lacking after the first prompt:** The first version logged *outcomes* ("✅ COMPLETE & TESTED", "Built complete authentication system") instead of the prompts I actually typed, and later versions still showed only the opening line of each prompt rather than the full text.
- **Evidence of work:** This file. Prompts were recovered verbatim from the session transcript, including follow-ups that were attached to screenshots.

---

## Problem 2 — Analyze the database

- **Status:** Complete.
- **Prompt typed:**

  > great, let's tackle problem 2: "analyze the database"
  > look at the database "data/campus_customs.db" and understand the fields of each table. at a minimum you should understand "catalogue", "inventory", and "users"
  >
  > start the file "output/harness.md"
  > write down each table and its fields, and one short line on why each field matters for the shop or the chatbot. you will keep growing this harness file in later problems (models, tools, safety, specs)

- **What was lacking after the first prompt:** No follow-up was needed; the prompt named the database, the minimum tables, the output file, and the per-field rationale.
- **Evidence of work:** `output/harness.md` created with every table (`catalogue`, `inventory`, `users`, `chat_messages`), its fields, and one line per field on why it matters to the shop or the chatbot. The file was then grown in Problems 4–12 as instructed.

---

## Problem 3 — Build the Campus Customs website

- **Status:** Complete.
- **Prompt typed:**

  > yes, let's start problem 3 "build the campus customs website"
  > scaffold a "react + vite + typescript" front end for campus customs. put a nav bar at the top that links to the main pages:
  >
  > * home
  > * products
  > * about us
  > * log in
  > * create account
  >
  > pull campus customs-style wording from yalebulldogblue.com for Home and About Us, but write these pages in your own voice (do not copy the original site text)
  >
  > on the products page, show product images from the catalogue (use the image paths in the database) with basic product info (name, price, short description)
  >
  > make each product open a SINGLE ITEM PAGE (large image on one side, full product text on the other - description, price, sizes/stock when you have them). clicking a card on products should take the shopper there.
  >
  > add a chat interface in the bottom right of the site (floating chat panel is fine). it does not need to talk to an agent yet - a stub that will call your backend later is enough for this probelm
  >
  > you will need a small api SOON TO READ THE DATABASE. IT IS FINE TO START A SIMPLE FASTAPI APP IN "BACKEND/MAIN.PY" just to serve products and images, then grow it into the agent backend in problem 5

- **What was lacking after the first prompt:** No follow-up was needed for the scaffold itself; the prompt specified the stack, nav pages, product grid, single-item page, and the chat stub.
- **Evidence of work:** React + Vite + TypeScript front end with the nav bar, Home/About Us copy written in our own voice, a products grid rendering images via `GET /api/images/{filename}` from the catalogue paths, a single-item detail page (large image + full text), a floating chat panel in the bottom right, and `backend/main.py` serving products and images.

---

## Problem 4 — Create account and login

- **Status:** Complete.
- **Prompt typed:**

  > let's start problem 4: create account and login
  > build a normal create-account/login flow
  >
  > create account: first name, last name, email, password (add confirm password as an extra nice touch)
  > log in: email and password
  >
  > new accounts go into the "users" table
  > make sure to store passwords securely so hackers (human or ai) cannot access them
  >
  > the seed database already has a test user you can use while building:
  > email: test@campuscustoms.yale.edu
  > password: password
  >
  > confirm you can log in as that user, and that a brand new account you create also works
  >
  > update output/harness.md with how auth works (what you store for a user and how passwords are protected)

- **Follow-up prompts:**

  > the links above don't work for test existing user or create new account

  > the log in information doesn't work

  > i used : test@campuscustoms.yale.edu
  > password: password
  >
  > got the above message

  > 1. fails to connect

  > i'm still getting the same error message that says load failed. but when i try to create account it says that the email is already registered. so im not sure whats going on

  > did you update output/harness.md with how auth works (what you store for a user and how passwords are protected)

- **What was lacking after the first prompt:** The first build produced a login page I couldn't actually sign in from — the seeded test user failed to authenticate (its password used a PBKDF2 hash the verifier didn't handle) and there was no reachable Create Account form — so it took several rounds to get both flows working end to end.
- **Evidence of work:** `POST /api/auth/register` stores `first_name`, `last_name`, `email`, and a bcrypt hash (12 rounds) in `users`; `POST /api/auth/login` verifies bcrypt and legacy PBKDF2-SHA256 hashes so the seeded test user works; the front end has both a Log In form and a Create Account form (first name, last name, email, password) that toggle between each other; `output/harness.md` documents what is stored per user and how passwords are protected.

---

## Problem 5 — PydanticAI agent backend

- **Status:** Complete.
- **Prompt typed:**

  > problem 5: pydanticAI agent backend
  >
  > build the shop chatbot as a pydranticAI agent behind FastAPI, plugged into your front-end chat widget. put the API app in "backend/main.py" - that is the file you run with Uvicorn. keep the agent as these four files next to it (same idea as homework 3):
  >
  > "backend/prompts/prompt.md" - system prompt (grow this same file later)
  > "backend/agent.py" - agent entry/wiring
  > "backend/tools.py" - tools the agent cant call
  > "backend/models.py" - pydantic/pydanticAI structured types
  >
  > in "main.py", expose a chat route so a message from the website returns a reply from the agent (and whatever else you need for products/auth). i will need to give you my AI model API key for the agent
  >
  > put campus customs voice and safety basics into "prompts/prompt.md" (we will expand tools and safety later). start or update types in models.py for chat replies/product cards as needed.
  >
  > in output/harness.md, note how the front end talks to FastAPI and how the agent is loaded (prompt file + model).
  >
  > make sure the backend runs from the "backend/" folder like this:
  > uvicorn main:app --reload --port 8000

- **Follow-up prompts:**

  > portkey api key: [REDACTED]

  > how to start the backend?

  > can you start the backend for me

  > i dont see a chat button

  > the chat response is a little clunky. can you fix it. also add an option to be able to expand the chat screen

  > low quality of responses from the chatbot

  > i feel like the responses can come with a better UX design. it still feels clunky

  > amazing. can you double check - are all tasks for problem 5 completed? is there anything outstanding that we have not completed yet?

  And much later, when I checked the run command against the assignment:

  > I want to make sure my project can be run exactly the way the homework assignment requires. The assignment says the backend should be able to run from the backend folder using `uvicorn main:app --reload --port 8000`.
  >
  > Right now my README tells users to run `python3 -m backend.main`, and I think some of my relative imports might prevent the assignment's uvicorn command from working.
  >
  > Can you update the project so that `uvicorn main:app --reload --port 8000` works when run from inside the backend folder? Please make only the changes needed for this and make sure none of the existing backend functionality breaks. Also update the README instructions so they match the correct command.

- **What was lacking after the first prompt:** The agent was wired up but the chat widget wasn't visible and its replies were cramped and low quality, so follow-ups were needed for the chat button, an expand/maximize control, and better response formatting — and the required `uvicorn main:app` entry point was broken by relative imports until I called it out.
- **Evidence of work:** `backend/main.py` (FastAPI app with `/api/chat`), `backend/agent.py`, `backend/tools.py`, `backend/models.py`, and `backend/prompts/prompt.md` with Campus Customs voice and safety basics. Model is `gpt-4o-mini` via the Portkey gateway, key loaded from `.env`. Imports fall back between direct and relative form so the app starts both with `uvicorn main:app --reload --port 8000` from `backend/` and with `python3 -m backend.main` from the project root.

---

## Problem 6 — Tools: product info and stock

- **Status:** Complete.
- **Prompt typed:**

  > great, thank you. lets start problem 6 - "tools: product info and stock"
  > give the agent tools that look up real information from "campus_customs.db"
  >
  > * product description
  > * price
  > * how many are in stock (by size when the customer asks)
  >
  > the agent must use the database! it must not invent prices or quantities. if a size is out of stock, say so clearly.
  >
  > expand "prompts/prompt.md" so the agent knows to call these tools for price and stock questions. add or update return types in "models.py"
  >
  > in "output/harness.md", list each tool and explain which model fields you chose for lookup results and why

- **Follow-up prompt:**

  > great, did you add or update return types in models.py and in output/harness.md did you list each tool and explain which model fields you chose for lookup results and why?

- **What was lacking after the first prompt:** The tools worked, but I had to ask again to confirm the two paperwork items in the prompt — the `models.py` return types and the per-tool field rationale in `harness.md` — had actually been done rather than skipped.
- **Evidence of work:** Four tools in `backend/tools.py` (`search_products`, `get_product_details`, `check_inventory`, `get_popular_products`), all reading `campus_customs.db`. Return types `ProductSearchResult`, `ProductDetails`, `InventoryItem`, and `AvailabilityResult` added to `models.py`. Verified against real data: Basic Hoodie returns $68, and per-size stock returns XS:15, S:5, M:5, L:8, XL:2, XXL:25. Out-of-stock sizes are reported explicitly.

---

## Problem 7 — Chat search that updates the page

- **Status:** Complete.
- **Prompt typed (I jumped the gun on this one and asked for it during Problem 5):**

  > can you make it so when i ask "do you have blue hoodies" it returns an image, price, and link to the hoodie

  Then the actual Problem 7 prompt:

  > ok great. now lets start problem 7: chat search that updates the page
  >
  > this step calls for us to add a neat feature to the site. although, i feel like we may have already completed this step earlier just because i got excited. anyways ill tell you what the goals are and please complete any steps that we have not covered yet.
  > when a customer asks about a type of item (i.e. what hoodies do you have?") the agent should search the catalogue and the website should dynamically show those matching items as product cards (image, name, price, short info). this is an API contract: the agent returns structured product matches and then the front end renders them on the website.
  >
  > after the dynamic product cards are loaded, make the sure same SINGLE ITEM PAGE behavior we built in problem 3 still works: each product card should still open that detail view (large image + full info) when clicked.
  >
  > update prompts/promt.md and output/harness.md so it is clear how search results reach the page

- **Follow-up prompts:**

  > the images aren't loading on the product page

  > only one hoodie shows up. also they did not answer me the first time

  > i want to test these features on the front end. provide link?

- **What was lacking after the first prompt:** The first pass returned cards but the product images didn't render on the page, and a colour query like "blue hoodies" matched only one item because the search did exact colour matching instead of treating navy/cobalt/sky as blue.
- **Evidence of work:** `ChatResponse` carries a structured `products` array; the agent marks matches with `[PRODUCT: id]`, the backend resolves those to full product objects, and the front end renders them as cards on the Products page. Clicking a card still opens the Problem 3 single-item view. Image paths are normalised to filenames and served from `/api/images/{filename}`. `prompt.md` and `harness.md` document the contract.

---

## Problem 8 — Customer memory

- **Status:** Complete.
- **Prompt typed:**

  > sweet. lets start problem 8: "customer memory"
  >
  > when a shopper is logged in, save their chat history in the database in an appropriate table and reload it when they return. the agent should know WHO is chatting (name, email) - put that in agent deps (or an equivalent clear pattern) and/or tools the agent can call.
  > also pass enough PAGE CONTEXT that if someone is on a product page and asks "do you have this in pink?", the agent knows which item they are referring to. (put code into the agent context)
  > guests can still chat, but history only needs to persist for logged-in users.
  > document in "output/harness.md" how the user chat history is stored, what customer fields the agent sees, and how page context is passed

- **Follow-up prompts:**

  > it doesnt know what i mean

  > the view prodct button in the chat doesnt work

  > can you catch mistakes like that on your own without me having to call it out?

  > test all frontend features based off of the prompts ive given you 1-8

  And at review time, before submitting:

  > for problem 8 - it looks like there is a discrepancy. the assignment says "Guests can still chat, but history only needs to persist for logged-in users" but ai_prompts.md says "Disables chat input for guests, enables for logged-in users". the expected behavior is: Guest: can chat, but conversation doesn't need persistent history.
  > Logged-in user: can chat + conversation persists and reloads later.

- **What was lacking after the first prompt:** Page context was dropped as soon as I navigated back from a product to the grid, so "do you have this in pink?" lost its referent; the View Product button in chat cards did nothing; and the build had gone further than the prompt asked by *blocking* guests from chatting at all instead of just not persisting their history.
- **Evidence of work:** Chat history is stored in `chat_messages` (user_id, role, content, products_json, created_at) and reloaded on login via `GET /api/chat/history`. The agent receives `[Customer: Name (email)]` and `[Currently viewing product: Name]` context headers. A separate `contextProduct` state keeps the product referent alive after leaving the detail view. Guests can send messages; `POST /api/chat` only writes to the database when a `user_id` is present. `harness.md` documents storage, customer fields, and page-context passing.

---

## Problem 9 — Usability improvements

- **Status:** Complete.
- **Prompt typed:**

  > ok lets start- problem 9: usability improvements
  > now that the core shop works, improve it. choose and implement:
  >
  > * 2 front-end usability improvements
  > * 2 agent/backend usability improvements
  >
  > front-end improvements are things that make the site look better and make it easier to use.
  > agent/backend improvements are things that make the agent output better, more accurate, or safer. these could be new agent tools or things that make the agent run faster or cheaper.
  > write output/usability.md, before or as you build. for each of the improvements, say:
  >
  > * what you added
  > * why it helps a campus customs shopper or business
  >
  > then make sure all improvements actually show up in the running app. graders will read the write-up and look for features

- **Follow-up prompt:**

  > what 2 front end usability improvements did you implement?
  > and 2 agent/backend usability improvements did you implement?

- **What was lacking after the first prompt:** The work was done but not stated plainly, so I had to ask for the four improvements to be named back to me explicitly — which is exactly what a grader would look for.
- **Evidence of work:** `output/usability.md` documents four improvements with what-and-why. Front end: (1) a search/filter bar that filters the catalogue in real time by name or description, (2) a size selector on the detail page showing live per-size stock ("M (5 in stock)" / "Out of stock", with out-of-stock sizes disabled). Agent/backend: (3) `search_catalog` now attaches live availability to every result so the agent volunteers stock without a second round trip, (4) semantic colour matching so "blue" also matches navy, cobalt, and sky.

---

## Problem 10 — Style the website

- **Status:** Complete.
- **Prompt typed:**

  > ok, now lets start problem 10: style the website
  > add creative design so the site feels like a real Campus Customs storefront -- fronts, color, hierarchy, motion, product presentation, chat feel. The more imaginative and innovative you can be with the design the better.
  >
  > write output/design.md: what you changed and why it should help customers stick around and buy. keep it concrete and short.

- **What was lacking after the first prompt:** No follow-up was needed.
- **Evidence of work:** `frontend/src/App.css` rewritten around a CSS-variable palette (navy `#1a3a52`, red `#e74c3c`, gold `#f39c12`) with gradient navbar and buttons, lifted product cards on hover, larger type with tightened letter-spacing, 12–16px radii, and a 70px gradient chat button with a pulse on hover. `output/design.md` records each change and the reasoning.

---

## Problem 11 — Site testing (app check)

- **Status:** Complete.
- **Prompt typed:**

  > Thanks! Let's start Problem 11: site testing (app check)
  > test the live site and document it in "output/app_check.html" (a page you can double-click open). include clear screenshots and short captions for:
  >
  > 1. chat checking the INVENTORY LEVEL of an item (honest stock/price from the DB)
  > 2. the DYNAMIC SEARCH-RESULT CARDS appearing after a category question (i.e. hoodies)
  > 3. ONE of the usability features you added in problem 9
  >
  > make the HTML easy to grade: heading for each check, screenshot, one or two sentences on what the screenshot proves. put the screenshot image files in "output/app_check_images/" and link them from "app_check.html" with relative paths (for example "app_check_images/inventory.png")

- **Follow-up prompts:**

  > i cannot see the screenshots in the report link you shared above

  > i still cannot see the images. also the link doesn't open in my browser, it opens as a panel within claude

  > can you provide me the browser link so it doesnt open in claude

  > i can see the screenshots, but the screenshots are all the same and they don't reflect each of the three cateogires on the site

  > update the html with updated screenshots that accurately reflect the description

  > the first image is updated, but the second and third remain the same

  > for test 3 (size selector) the screenshot has a size section, but the section is empty/doesn't show any available sizes. can you update the app to include sizing and then update the screenshot afterwards to reflect the same

- **What was lacking after the first prompt:** This one took the most rounds. The relative image paths didn't render in the viewer I was opening the page in; then the three screenshots were near-identical instead of showing three different checks; and the size-selector screenshot exposed a real bug — the Available Sizes section was empty because the selected product came from the grid payload, which has no inventory.
- **Evidence of work:** `output/app_check.html` with a heading, screenshot, and caption for each of the three required checks. Screenshots are embedded as base64 data URIs so the page renders standalone, with the source files also kept in `output/app_check_images/`. The empty size selector was fixed by fetching `GET /api/products/{id}` when a product is selected so `inventory` is populated, and the screenshot was retaken to show real per-size stock.

---

## Problem 12 — Audit trail, safety, finish harness

- **Status:** Complete.
- **Prompt typed:**

  > great work. now lets start problem 12: audit trail, safety, finish harness
  > keep an append-only "output/audit_trail.json" of agent-loop activity (time, tool name, short args/result, stop reason). do not wipe it between runs. also, think of some safety rules to give the agent and put them in "prompts/prompt.md"
  > finish "output/harness.md" so it is clear how the system works.
  >
  > * model fields in "models.py" and why you chose them
  > * tools and abilities
  > * safety rules
  > * specs (loop limits, result caps, models, how to run front + back)

- **What was lacking after the first prompt:** No follow-up was needed; the four harness sections were listed explicitly in the prompt.
- **Evidence of work:** `log_audit_trail()` in `backend/agent.py` appends `{timestamp, tool, args_summary, result_summary, stop_reason}` to `output/audit_trail.json` on every tool call and on agent load, reading existing entries before writing so nothing is wiped between runs. Seven safety rules added to `backend/prompts/prompt.md` (database-first authority, data privacy, scope boundaries, honesty about stock, user respect, rate limiting, catalogue-only recommendations). `output/harness.md` completed with model-field rationale, tools and abilities, safety rules, and specs including loop limits, result caps, model name, and how to run the front and back ends.

---

## Problem 13 — Push to GitHub

- **Status:** Complete.
- **Prompt typed:**

  > thanks! let's work on problem 13: push to github and submit the URL
  >
  > put your code in a folder named "hw4" and push it to a PUBLIC github repository. do not put the real ".env", "campus_customs.db" or product images in the github repo. use ".gitignore". include ".env.example" with placeholders only
  >
  > reference the screenshot attached for expected file layout and additional criteria

- **Follow-up prompts:**

  > can you check this: https://github.com/kristinefeng/campus-customs
  > tell me next steps or upload the work on my behalf

  > i created a token: [REDACTED]

  > requirements.txt still does not exist in the public repo. the README now claims the project contains "requirements.txt" but the actual github root listing doesn't contain one.
  > also the README says "# Install Python dependencies (if requirements.txt exists)" followed by manually installing packages. so the README and repo are inconsistent.
  > can you add a real requirements.txt containing the Python packages your backend needs, such as FastAPI, uvicorn, PydanticAI, bcrypt, python-dotenv, etc.

  > also I don't see a frontend "Create Account" flow. the frontend App.tsx appears to only provide a Log In form. The login page has email, password, and a Log In button; I don't see a Create Account/Register form connected to /api/auth/register.

- **What was lacking after the first prompt:** The first push left the repo and the README out of sync — the README told users to `pip install` packages one by one "if requirements.txt exists" when no such file was committed — and the review also surfaced that the Create Account form promised back in Problem 4 had never actually been wired into the front end.
- **Evidence of work:** Public repository at https://github.com/kristinefeng/campus-customs. `.gitignore` excludes `.env`, `*.db`, and `products/`; `.env.example` ships placeholders only; `requirements.txt` lists fastapi, uvicorn, pydantic, pydantic-ai, bcrypt, python-dotenv, and aiohttp; `README.md` documents setup, architecture, and the `uvicorn main:app --reload --port 8000` run command. The Create Account form was added to `App.tsx` and posts to `/api/auth/register`.

---

## Summary

All 13 problems complete. The work is in this repository, with supporting documentation in `output/harness.md`, `output/usability.md`, `output/design.md`, `output/app_check.html`, and `output/audit_trail.json`.

**Repository:** https://github.com/kristinefeng/campus-customs
