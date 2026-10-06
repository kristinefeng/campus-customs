import re

with open("/Users/kristinefeng/Desktop/AI Foundations for Managers/hw4/backend/agent.py", 'r') as f:
    content = f.read()

# Find the try block and insert context building code
old_code = """    try:
        # Run the agent
        result = await agent.run(message)"""

new_code = """    try:
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
            full_message = "\\n".join(context_lines) + "\\n\\n" + message
        else:
            full_message = message
        
        # Run the agent
        result = await agent.run(full_message)"""

content = content.replace(old_code, new_code)

with open("/Users/kristinefeng/Desktop/AI Foundations for Managers/hw4/backend/agent.py", 'w') as f:
    f.write(content)

print("✓ Added customer context injection to agent")
