import sqlite3
import os
import re
from typing import Optional, List

try:
    from models import ProductSearchResult, ProductDetails, InventoryItem
except ImportError:
    from .models import ProductSearchResult, ProductDetails, InventoryItem

DB_PATH = os.path.expanduser(os.environ.get("DATABASE_PATH", "~/Downloads/data 2/campus_customs.db"))

# Shoppers ask for "blue"; the catalogue says "Navy". Each key expands to the
# shades actually used in catalogue.colors and the product descriptions.
COLOR_SYNONYMS = {
    "blue": ["navy", "royal", "cobalt", "sky", "denim"],
    "grey": ["gray", "charcoal", "heather", "slate", "ash"],
    "gray": ["grey", "charcoal", "heather", "slate", "ash"],
    "red": ["crimson", "maroon", "burgundy", "scarlet"],
    "green": ["forest", "olive", "hunter", "sage"],
    "white": ["cream", "ivory", "natural", "bone"],
    "black": ["onyx", "jet", "charcoal"],
    "yellow": ["gold", "mustard"],
    "purple": ["violet", "plum", "lavender"],
    "pink": ["rose", "blush"],
    "orange": ["rust", "burnt"],
    "brown": ["tan", "khaki", "camel", "chocolate"],
}

# Words that would match nearly every row and dilute an AND-ed search.
_STOPWORDS = {
    "a", "an", "the", "do", "does", "you", "your", "have", "has", "got", "any",
    "is", "are", "in", "of", "for", "me", "i", "we", "with", "some", "show",
    "looking", "want", "need", "there", "what", "whats", "got",
}

_SEARCH_COLUMNS = ("name", "description", "search_tags", "garment_type", "colors")

# Garment sizes don't sort alphabetically (L, M, S, XL, XS, XXL is nonsense).
SIZE_RANK = {"XS": 0, "S": 1, "M": 2, "L": 3, "XL": 4, "XXL": 5, "2XL": 5, "XXXL": 6, "3XL": 6}


def size_sort_key(size: str):
    return (SIZE_RANK.get(str(size).upper().strip(), 99), str(size))



def _is_color(token: str) -> bool:
    return token in COLOR_SYNONYMS or any(token in v for v in COLOR_SYNONYMS.values())


def _expand_token(token: str) -> List[str]:
    """A token plus its colour synonyms and a naive singular form."""
    variants = [token]
    if token.endswith("s") and len(token) > 3:
        variants.append(token[:-1])           # hoodies -> hoodie
    for base in list(variants):
        variants.extend(COLOR_SYNONYMS.get(base, []))
    return list(dict.fromkeys(variants))


def _columns_for(token: str):
    """
    Colour words match the colours column only. Descriptions mention colours
    that aren't the garment's own -- the Harvard/Yale tee describes "navy Yale
    helmets" on a grey shirt -- so searching prose for a colour returns junk.
    """
    return ("colors", "name") if _is_color(token) else _SEARCH_COLUMNS


def _build_search_clause(query: str):
    """
    Build an AND-of-ORs WHERE clause so "blue hoodies" means
    (blue OR navy OR royal ...) AND (hoodies OR hoodie).

    Returns (sql_fragment, params), or (None, None) when the query has no
    usable tokens, in which case the caller falls back to a plain match.
    """
    tokens = [t for t in re.findall(r"[a-z0-9]+", query.lower()) if t not in _STOPWORDS]
    if not tokens:
        return None, None

    clauses, params = [], []
    for token in tokens:
        variant_sql = []
        for variant in _expand_token(token):
            variant_sql.append(" OR ".join(f"{col} LIKE ?" for col in _SEARCH_COLUMNS))
            params.extend([f"%{variant}%"] * len(_SEARCH_COLUMNS))
        clauses.append("(" + " OR ".join(variant_sql) + ")")
    return " AND ".join(clauses), params

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

    select = """SELECT product_id, name, price, image_file_path, garment_type,
                       description, colors, search_tags
                FROM catalogue WHERE """

    where, params = _build_search_clause(query)
    if where is None:
        where = " OR ".join(f"{col} LIKE ?" for col in _SEARCH_COLUMNS)
        params = [f"%{query}%"] * len(_SEARCH_COLUMNS)

    cursor.execute(select + where + " LIMIT ?", (*params, limit))
    results = [ProductSearchResult(**dict(row)) for row in cursor.fetchall()]

    # An AND across every token can be too strict ("navy quarter zip pullover").
    # Fall back to matching any single token rather than returning nothing.
    if not results:
        tokens = [t for t in re.findall(r"[a-z0-9]+", query.lower()) if t not in _STOPWORDS]
        if tokens:
            ors, loose = [], []
            for token in tokens:
                for variant in _expand_token(token):
                    ors.append(" OR ".join(f"{col} LIKE ?" for col in _SEARCH_COLUMNS))
                    loose.extend([f"%{variant}%"] * len(_SEARCH_COLUMNS))
            cursor.execute(select + " OR ".join(ors) + " LIMIT ?", (*loose, limit))
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
    inventory.sort(key=lambda i: size_sort_key(i.size))
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
        rows = sorted(cursor.fetchall(), key=lambda r: size_sort_key(r["size"]))
        inventory = {row["size"]: row["quantity"] for row in rows}
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
