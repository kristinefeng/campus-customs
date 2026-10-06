import sqlite3
import os
from typing import Optional, List

try:
    from models import ProductSearchResult, ProductDetails, InventoryItem
except ImportError:
    from .models import ProductSearchResult, ProductDetails, InventoryItem

DB_PATH = os.path.expanduser(os.environ.get("DATABASE_PATH", "~/Downloads/data 2/campus_customs.db"))

def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def search_products(query: str, limit: int = 10) -> List[ProductSearchResult]:
    """
    Search for products by keywords, type, or tags.

    Args:
        query: Search term (can match name, description, tags, or type)
        limit: Max number of results

    Returns:
        List of matching products
    """
    conn = get_db()
    cursor = conn.cursor()

    # Search across multiple fields using LIKE
    search_pattern = f"%{query}%"
    cursor.execute(
        """SELECT product_id, name, price, image_file_path, garment_type,
                  description, colors, search_tags
           FROM catalogue
           WHERE name LIKE ? OR description LIKE ? OR search_tags LIKE ? OR garment_type LIKE ?
           LIMIT ?""",
        (search_pattern, search_pattern, search_pattern, search_pattern, limit)
    )

    results = [ProductSearchResult(**dict(row)) for row in cursor.fetchall()]
    conn.close()
    return results

def get_product_details(product_id: str) -> Optional[ProductDetails]:
    """
    Get full details of a product including inventory.

    Args:
        product_id: The product ID to look up

    Returns:
        Product details with inventory, or None if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    # Get product info
    cursor.execute(
        """SELECT product_id, name, price, garment_type, description, colors,
                  search_tags, image_file_path
           FROM catalogue
           WHERE product_id = ?""",
        (product_id,)
    )

    product = cursor.fetchone()
    if not product:
        conn.close()
        return None

    product_dict = dict(product)

    # Get inventory
    cursor.execute(
        """SELECT size, quantity FROM inventory WHERE product_id = ? ORDER BY size""",
        (product_id,)
    )
    inventory = [InventoryItem(**dict(row)) for row in cursor.fetchall()]
    product_dict["inventory"] = inventory

    conn.close()
    return ProductDetails(**product_dict)

def check_inventory(product_id: str, size: Optional[str] = None) -> dict:
    """
    Check stock availability for a product.

    Args:
        product_id: The product ID
        size: Optional specific size to check (if None, returns all sizes)

    Returns:
        Dictionary with inventory info
    """
    conn = get_db()
    cursor = conn.cursor()

    # Get product name first
    cursor.execute("SELECT name FROM catalogue WHERE product_id = ?", (product_id,))
    product = cursor.fetchone()

    if not product:
        conn.close()
        return {"error": f"Product {product_id} not found"}

    product_name = product["name"]

    # Get inventory
    if size:
        cursor.execute(
            "SELECT quantity FROM inventory WHERE product_id = ? AND size = ?",
            (product_id, size)
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            qty = row["quantity"]
            return {
                "product_id": product_id,
                "product_name": product_name,
                "size": size,
                "quantity": qty,
                "in_stock": qty > 0,
                "status": f"{qty} in stock" if qty > 0 else "Out of stock"
            }
        else:
            return {
                "product_id": product_id,
                "product_name": product_name,
                "size": size,
                "quantity": 0,
                "in_stock": False,
                "status": f"Size {size} not available"
            }
    else:
        cursor.execute(
            "SELECT size, quantity FROM inventory WHERE product_id = ? ORDER BY size",
            (product_id,)
        )
        inventory = {row["size"]: row["quantity"] for row in cursor.fetchall()}
        conn.close()

        total_stock = sum(inventory.values())
        return {
            "product_id": product_id,
            "product_name": product_name,
            "sizes": inventory,
            "total_quantity": total_stock,
            "in_stock": total_stock > 0,
            "status": f"{total_stock} total in stock across all sizes"
        }

def get_popular_products(limit: int = 5) -> List[ProductSearchResult]:
    """
    Get a selection of popular/featured products.

    Args:
        limit: Number of products to return

    Returns:
        List of products
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """SELECT product_id, name, price, image_file_path, garment_type,
                  description, colors, search_tags
           FROM catalogue
           ORDER BY name
           LIMIT ?""",
        (limit,)
    )

    results = [ProductSearchResult(**dict(row)) for row in cursor.fetchall()]
    conn.close()
    return results
