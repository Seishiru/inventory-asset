import os
from collections import defaultdict
from colorama import init, Fore, Style

# Initialize colorama
init(autoreset=True)

# List of folders to ignore
IGNORE_FOLDERS = {".git", "__pycache__", "node_modules", "venv", "sg_env", "sg_env310", ".vite", "deps"}

# Maximum number of sample files to display per file type
MAX_SAMPLES_PER_TYPE = 50

# Color mapping for some common file types
EXT_COLOR = {
    ".py": Fore.BLUE,
    ".js": Fore.YELLOW,
    ".ts": Fore.CYAN,
    ".json": Fore.MAGENTA,
    ".tsx" : Fore.GREEN,
    ".ts" : Fore.GREEN,
    ".html": Fore.RED,
    ".css": Fore.GREEN,
    ".md": Fore.WHITE + Style.BRIGHT,
}

def print_tree(start_path, indent=""):
    items = sorted(os.listdir(start_path))
    file_type_count = defaultdict(int)  # keep track of files displayed per extension

    for index, item in enumerate(items):
        path = os.path.join(start_path, item)

        # Skip ignored folders
        if os.path.isdir(path) and item in IGNORE_FOLDERS:
            continue

        # Determine prefix
        is_last = index == len(items) - 1
        prefix = "└── " if is_last else "├── "

        # If it’s a file, count by extension and colorize
        if os.path.isfile(path):
            _, ext = os.path.splitext(item)
            ext = ext.lower()
            # limit number of files per type
            if file_type_count[ext] >= MAX_SAMPLES_PER_TYPE:
                if file_type_count[ext] == MAX_SAMPLES_PER_TYPE:
                    print(indent + f"└── {Fore.RED}... ({ext} files omitted)")
                    file_type_count[ext] += 1  # so we don't repeat the "..."
                continue
            file_type_count[ext] += 1
            color = EXT_COLOR.get(ext, Fore.WHITE)
            print(indent + prefix + color + item + Style.RESET_ALL)
        else:
            # It's a folder, color directories
            print(indent + prefix + Fore.GREEN + item + Style.RESET_ALL)
            new_indent = indent + ("    " if is_last else "│   ")
            print_tree(path, new_indent)

# Change "." to your project folder path
print_tree(".")
