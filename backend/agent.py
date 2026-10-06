import os
import sys
import json
from pathlib import Path
from typing import Optional
from datetime import datetime
from pydantic_ai import Agent, RunContext
from pydantic_ai.usage import UsageLimits

# Caps documented in output/harness.md. Sized above real usage -- a single
# category question legitimately costs ~7 calls (one search plus an
# availability check per result) -- so this only trips on a runaway loop.
AGENT_USAGE_LIMITS = UsageLimits(tool_calls_limit=20, output_tokens_limit=2000)

try:
    from models import ChatResponse
    from tools import search_products, get_product_details, check_inventory, get_popular_products
except ImportError:
    from .models import ChatResponse
    from .tools import search_products, get_product_details, check_inventory, get_popular_products

# Load the system prompt
PROMPT_PATH = Path(__file__).parent / "prompts" / "prompt.md"
with open(PROMPT_PATH, "r") as f:
    SYSTEM_PROMPT = f.read()

def create_agent():
    """Create and configure the PydanticAI agent with Portkey."""

    # Get API key from environment
    portkey_api_key = os.environ.get("PORTKEY_API_KEY")

    if not portkey_api_key:
        # Try to load from .env file
        env_path = Path(__file__).parent.parent / ".env"
        if env_path.exists():
            from dotenv import load_dotenv
            load_dotenv(env_path)
            portkey_api_key = os.environ.get("PORTKEY_API_KEY")

    if not portkey_api_key:
        raise ValueError(
            "PORTKEY_API_KEY not found. Set it in .env or as environment variable."
        )

    # Set environment variables for OpenAI client (Portkey uses OpenAI API format)
    os.environ["OPENAI_API_KEY"] = portkey_api_key
    os.environ["OPENAI_BASE_URL"] = "https://api.portkey.ai/v1"

    # Create agent - PydanticAI will auto-detect OpenAI and use env vars
    agent = Agent(
        model="openai:gpt-4o-mini",
        system_prompt=SYSTEM_PROMPT,
    )

    # Register tools
    @agent.tool
    async def search_catalog(ctx: RunContext[None], query: str) -> str:
        """Search the product catalog for items matching keywords, colors, or tags. Includes inventory status."""
        results = search_products(query, limit=5)
        result_count = len(results)
        log_audit_trail("search_catalog", {"query": query}, f"Found {result_count} results", "success")

        if not results:
            return f"No products found matching '{query}'. Try a different search."

        formatted = "Found these products with real-time stock:\n"
        for p in results:
            # For each search result, check inventory to include availability
            inv_data = check_inventory(p.product_id, None)
            if "sizes" in inv_data:
                available = [s for s, q in inv_data["sizes"].items() if q > 0]
                stock_info = f"(Available: {', '.join(available)})" if available else "(Out of stock)"
            else:
                stock_info = f"({inv_data.get('quantity', 0)} in stock)"
            # product_id must be surfaced: the system prompt requires the model to
            # emit [PRODUCT: product-id], and without it the model guesses the slug.
            formatted += (
                f"- **{p.name}** — **${p.price}** {stock_info} - {p.description} "
                f"[product_id: {p.product_id}]\n"
            )
        return formatted

    @agent.tool
    async def get_product(ctx: RunContext[None], product_id: str) -> str:
        """Get complete details about a specific product including all available sizes and stock levels."""
        product = get_product_details(product_id)
        log_audit_trail("get_product", {"product_id": product_id},
                       f"Retrieved: {product.name if product else 'NOT_FOUND'}",
                       "success" if product else "not_found")
        if not product:
            return f"Product '{product_id}' not found in catalog."

        inventory_lines = []
        for inv in product.inventory:
            status = "✓ In stock" if inv.quantity > 0 else "✗ Out of stock"
            inventory_lines.append(f"  - Size {inv.size}: {inv.quantity} available {status}")

        inventory_str = "\n".join(inventory_lines) if inventory_lines else "  No inventory data"

        return f"""
**{product.name}**
Price: ${product.price}
Type: {product.garment_type}
Description: {product.description}
Colors Available: {product.colors}

Stock by Size:
{inventory_str}
"""

    @agent.tool
    async def check_availability(ctx: RunContext[None], product_id: str, size: Optional[str] = None) -> str:
        """Check if a product is in stock and what sizes are available."""
        result = check_inventory(product_id, size)
        log_audit_trail("check_availability", {"product_id": product_id, "size": size},
                       "error" if "error" in result else f"Stock: {result.get('quantity', 'N/A')}",
                       "success" if "error" not in result else "error")
        if "error" in result:
            return result["error"]

        if "sizes" in result:
            in_stock_sizes = [f"{s}: {q}" for s, q in result["sizes"].items() if q > 0]
            if in_stock_sizes:
                return f"**{result['product_name']}** is available in: {', '.join(in_stock_sizes)}"
            else:
                return f"**{result['product_name']}** is currently out of stock in all sizes."
        else:
            qty = result.get("quantity", 0)
            status = "in stock" if qty > 0 else "out of stock"
            return f"**{result['product_name']}** (Size {result['size']}): {qty} units {status}"

    @agent.tool
    async def browse_popular(ctx: RunContext[None]) -> str:
        """Get a list of popular or featured products from the catalog."""
        products = get_popular_products(limit=10)
        log_audit_trail("browse_popular", {}, f"Found {len(products)} results", "success")
        if not products:
            return "No products available in catalog."

        formatted = "Here are some featured products:\n"
        for p in products:
            formatted += (
                f"- **{p.name}** (${p.price}) - {p.garment_type} "
                f"[product_id: {p.product_id}]\n"
            )
        return formatted

    return agent

def log_audit_trail(tool_name: str, args: dict, result: any, stop_reason: str = "success"):
    """Append-only logging of agent tool usage for safety audit."""
    audit_path = Path(__file__).parent.parent / "output" / "audit_trail.json"
    audit_path.parent.mkdir(parents=True, exist_ok=True)

    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "tool": tool_name,
        "args_summary": str(args)[:100],  # First 100 chars of args
        "result_summary": str(result)[:100] if result else None,
        "stop_reason": stop_reason
    }

    try:
        # Read existing entries if file exists
        entries = []
        if audit_path.exists():
            with open(audit_path, 'r') as f:
                try:
                    entries = json.load(f)
                except json.JSONDecodeError:
                    entries = []

        # Append new entry
        entries.append(entry)

        # Write back (append-only)
        with open(audit_path, 'w') as f:
            json.dump(entries, f, indent=2)
    except Exception as e:
        print(f"⚠ Audit logging error: {e}", file=sys.stderr)

# Create agent instance on module load
try:
    agent = create_agent()
    log_audit_trail("system", {"action": "agent_loaded"}, "PydanticAI initialized", "success")
    print("✓ PydanticAI agent loaded successfully with tools", file=sys.stderr)
except Exception as e:
    log_audit_trail("system", {"action": "agent_load_failed"}, str(e), "error")
    print(f"⚠ Agent initialization error: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    agent = None

async def chat_with_agent(
    message: str,
    user_id: int | None = None,
    user_name: str | None = None,
    user_email: str | None = None,
    current_product_id: str | None = None,
    current_product_name: str | None = None
) -> ChatResponse:
    """
    Send a message to the agent and get a response.

    Args:
        message: User's message
        user_id: Optional user ID for context

    Returns:
        ChatResponse with agent's reply and any product recommendations
    """
    if not agent:
        return ChatResponse(
            role="assistant",
            content="The chatbot is not available. Please check your API key configuration.",
            success=False,
            message="Agent not initialized"
        )

    try:
        # Build customer context for the agent
        context_lines = []
        if user_name or user_email:
            name_part = user_name if user_name else "Guest"
            email_part = f" ({user_email})" if user_email else ""
            context_lines.append(f"[Customer: {name_part}{email_part}]")
        if current_product_id and current_product_name:
            context_lines.append(f"[Currently viewing product: {current_product_name}]")
        
        # Prepend context to message if we have any
        if context_lines:
            full_message = "\n".join(context_lines) + "\n\n" + message
        else:
            full_message = message
        
        # Run the agent
        result = await agent.run(full_message, usage_limits=AGENT_USAGE_LIMITS)

        # Extract response - get the output property from RunResult
        if hasattr(result, 'output'):
            response_text = result.output
        else:
            response_text = str(result) if result else "No response from agent"

        # Extract product IDs from response (look for patterns like [PRODUCT: product-id])
        import re
        product_ids = re.findall(r'\[PRODUCT:\s*([^\]]+)\]', response_text)

        # Fetch product details for recommended products
        products = None
        if product_ids:
            products = []
            for product_id in product_ids:
                product_id = product_id.strip()
                product = get_product_details(product_id)
                if product:
                    # Extract filename from path
                    filename = product.image_file_path.split('/').pop() if '/' in product.image_file_path else product.image_file_path
                    products.append({
                        "product_id": product.product_id,
                        "name": product.name,
                        "price": product.price,
                        "image_file_path": filename,
                        "description": product.description
                    })

            # Remove the [PRODUCT: ...] markers from the response text
            response_text = re.sub(r'\[PRODUCT:\s*[^\]]+\]', '', response_text).strip()

        return ChatResponse(
            role="assistant",
            content=response_text,
            products=products,
            success=True
        )

    except Exception as e:
        print(f"Agent error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return ChatResponse(
            role="assistant",
            content=f"Sorry, I encountered an error: {str(e)}",
            success=False,
            message=str(e)
        )
