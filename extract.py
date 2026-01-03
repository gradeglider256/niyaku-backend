import os
import re
import json

def extract_code_context(file_path, line_number, window=5):
    """Extracts the specific line and surrounding context from a file."""
    if not os.path.exists(file_path):
        return "File not found."
    
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
            start = max(0, line_number - window)
            end = min(len(lines), line_number + window)
            context = "".join(lines[start:end])
            return context.strip()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def generate_training_data(log_file, src_root):
    """
    Parses error.log for stack traces and maps them to actual source code.
    """
    training_rows = []
    
    # Regex to find NestJS file paths and line numbers in stack traces
    # Example: /src/user/user.service.ts:50:34
    path_regex = r"(/src/[\w/\.-]+\.ts):(\num+):(\num+)"
    
    print(f"Log file: {log_file}")
    print(f"Source root: {src_root}")
    print(f"Path regex: {path_regex}")

    with open(log_file, 'r') as f:
        log_content = f.read()
        print(f"Log content: {log_content}")
        # Split by timestamp to get individual error blocks
        blocks = re.split(r'\[\d{4}-\d{2}-\d{2}.*?\]', log_content)

        for block in blocks:
            if "Error" in block:
                match = re.search(path_regex, block)
                if match:
                    full_path = match.group(1)
                    line_num = int(match.group(2))
                    
                    # Resolve local path (assuming script is run from project root)
                    local_path = os.path.join(src_root, full_path.lstrip('/'))
                    code_snippet = extract_code_context(local_path, line_num)

                    # Create a structured row for fine-tuning
                    row = {
                        "log": block.strip(),
                        "file": full_path,
                        "line": line_num,
                        "code_context": code_snippet
                    }
                    training_rows.append(row)

    return training_rows

# --- RUN THE SCRIPT ---
# Adjust 'error.log' and './' to your local paths
results = generate_training_data('logs/error.log', './')

# Save as a JSON for your dataset preparation
with open('extracted_contexts.json', 'w') as out:
    json.dump(results, out, indent=2)

print(f"Successfully extracted {len(results)} context blocks for fine-tuning.")