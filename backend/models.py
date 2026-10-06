from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductCard(BaseModel):
    """A product recommendation card for the frontend."""
    product_id: str
    name: str
    price: float
    image_file_path: str
    description: str

class ChatMessage(BaseModel):
    """A message in the chat history."""
    role: str  # "user" or "assistant"
    content: str
    products: Optional[List[ProductCard]] = None
    created_at: Optional[datetime] = None

class ChatRequest(BaseModel):
    """Request from frontend to chat endpoint."""
    message: str
    user_id: Optional[int] = None
    current_product_id: Optional[str] = None  # Product user is viewing
    current_product_name: Optional[str] = None  # For context

class ChatResponse(BaseModel):
    """Response from chat endpoint to frontend."""
    role: str  # "assistant"
    content: str
    products: Optional[List[ProductCard]] = None
    success: bool
    message: Optional[str] = None

class ProductSearchResult(BaseModel):
    """Result of a product search."""
    product_id: str
    name: str
    price: float
    image_file_path: str
    garment_type: str
    description: str
    colors: str
    search_tags: str

class InventoryItem(BaseModel):
    """Stock info for a product size."""
    size: str
    quantity: int
    in_stock: bool = False

    def __init__(self, **data):
        super().__init__(**data)
        self.in_stock = self.quantity > 0

class ProductDetails(BaseModel):
    """Full details of a product."""
    product_id: str
    name: str
    price: float
    garment_type: str
    description: str
    colors: str
    search_tags: str
    image_file_path: str
    inventory: List[InventoryItem]

class AvailabilityResult(BaseModel):
    """Stock availability result for a product (specific size or all sizes)."""
    product_id: str
    product_name: str
    total_quantity: Optional[int] = None  # Total stock across all sizes
    size: Optional[str] = None  # Specific size if requested
    quantity: Optional[int] = None  # Quantity for specific size
    sizes: Optional[dict] = None  # Dict of {size: quantity} for all sizes
    in_stock: bool  # Whether ANY stock exists
    status: str  # Human-readable status message

class ToolResponse(BaseModel):
    """Generic response from agent tools."""
    success: bool
    data: Optional[dict] = None
    message: str
