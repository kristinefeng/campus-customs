import sqlite3
import os
import bcrypt
import secrets
import hashlib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv
import asyncio

# Must run before importing agent/tools, which read these paths at import time.
load_dotenv(Path(__file__).parent.parent / ".env")

try:
    from agent import chat_with_agent
    from models import ChatRequest, ChatResponse
except ImportError:
    from .agent import chat_with_agent
    from .models import ChatRequest, ChatResponse

app = FastAPI(title="Campus Customs API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the database
DB_PATH = os.path.expanduser(os.environ.get("DATABASE_PATH", "~/Downloads/data 2/campus_customs.db"))
PRODUCTS_PATH = os.path.expanduser(os.environ.get("PRODUCTS_PATH", "~/Downloads/data 2/products"))

# Pydantic models for auth
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    user_id: Optional[int] = None
    token: Optional[str] = None
    message: str

def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash (supports bcrypt and PBKDF2)."""
    # Handle bcrypt hashes
    if password_hash.startswith('$2'):
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

    # Handle PBKDF2-SHA256 hashes (Django format: pbkdf2_sha256$salt$hash)
    if password_hash.startswith('pbkdf2_sha256$'):
        parts = password_hash.split('$')
        if len(parts) == 3:
            salt = parts[1]
            expected_hash = parts[2]
            # Compute PBKDF2-SHA256 with 260000 iterations (Django default for hw4testsalt)
            computed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 260000)
            return computed.hex() == expected_hash

    return False

def generate_token() -> str:
    """Generate a secure token for session management."""
    return secrets.token_urlsafe(32)

@app.get("/")
def root():
    return {"message": "Campus Customs API", "status": "online"}

@app.get("/api/products")
def get_products(skip: int = 0, limit: int = 100):
    """Get all products with pagination."""
    conn = get_db()
    cursor = conn.cursor()

    # Get total count
    cursor.execute("SELECT COUNT(*) as count FROM catalogue")
    total = cursor.fetchone()["count"]

    # Get products
    cursor.execute(
        "SELECT * FROM catalogue ORDER BY name LIMIT ? OFFSET ?",
        (limit, skip)
    )
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "products": products
    }

@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    """Get a single product with inventory."""
    conn = get_db()
    cursor = conn.cursor()

    # Get product info
    cursor.execute("SELECT * FROM catalogue WHERE product_id = ?", (product_id,))
    product = cursor.fetchone()

    if not product:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    product_dict = dict(product)

    # Get inventory (sizes and quantities)
    cursor.execute(
        "SELECT size, quantity FROM inventory WHERE product_id = ? ORDER BY size",
        (product_id,)
    )
    inventory = [{"size": row["size"], "quantity": row["quantity"]} for row in cursor.fetchall()]
    product_dict["inventory"] = inventory

    conn.close()
    return product_dict

@app.get("/api/images/{filename}")
def get_image(filename: str):
    """Serve product images."""
    # Sanitize filename to prevent directory traversal
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    image_path = os.path.join(PRODUCTS_PATH, filename)

    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(image_path)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint powered by PydanticAI agent with customer context."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get user info if logged in
    user_name = None
    user_email = None
    if request.user_id:
        user_info = get_user_info(request.user_id)
        if user_info:
            user_name = f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}".strip()
            user_email = user_info.get('email')

    # Call the agent with customer context
    response = await chat_with_agent(
        request.message,
        user_id=request.user_id,
        user_name=user_name,
        user_email=user_email,
        current_product_id=request.current_product_id,
        current_product_name=request.current_product_name
    )

    # Save message to database if user is logged in
    if request.user_id and response.success:
        import json
        if response.products:
            # Convert ProductCard models to dicts for JSON serialization
            products_dict = [p.model_dump() if hasattr(p, 'model_dump') else dict(p) for p in response.products]
            products_json = json.dumps(products_dict)
        else:
            products_json = None
        save_chat_message(request.user_id, "user", request.message)
        save_chat_message(request.user_id, "assistant", response.content, products_json)

    return response

@app.post("/api/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    """Create a new user account."""
    conn = get_db()
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    password_hash = hash_password(req.password)

    # Create token
    token = generate_token()

    # Insert new user
    try:
        cursor.execute(
            """INSERT INTO users (first_name, last_name, email, password_hash, name)
               VALUES (?, ?, ?, ?, ?)""",
            (req.first_name, req.last_name, req.email, password_hash, f"{req.first_name} {req.last_name}")
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()

        return AuthResponse(
            success=True,
            user_id=user_id,
            token=token,
            message="Account created successfully"
        )
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """Log in a user."""
    conn = get_db()
    cursor = conn.cursor()

    # Find user by email
    cursor.execute("SELECT id, password_hash FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate token
    token = generate_token()

    return AuthResponse(
        success=True,
        user_id=user["id"],
        token=token,
        message="Logged in successfully"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Chat history functions
def save_chat_message(user_id: int, role: str, content: str, products_json: Optional[str] = None):
    """Save a chat message to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO chat_messages (user_id, role, content, products_json, created_at)
           VALUES (?, ?, ?, ?, datetime('now'))""",
        (user_id, role, content, products_json)
    )
    conn.commit()
    conn.close()

def get_chat_history(user_id: int, limit: int = 50) -> list:
    """Get chat history for a user."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        """SELECT role, content, products_json, created_at
           FROM chat_messages
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT ?""",
        (user_id, limit)
    )
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    # Reverse to get chronological order (oldest first)
    return list(reversed(messages))

def get_user_info(user_id: int) -> Optional[dict]:
    """Get user info (name, email) for agent context."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        """SELECT first_name, last_name, email FROM users WHERE id = ?""",
        (user_id,)
    )
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

@app.get("/api/chat/history")
async def get_history(user_id: int):
    """Get chat history for a logged-in user."""
    if not user_id:
        return {"messages": [], "error": "User not logged in"}
    
    try:
        messages = get_chat_history(user_id)
        return {"messages": messages, "success": True}
    except Exception as e:
        return {"messages": [], "error": str(e), "success": False}
