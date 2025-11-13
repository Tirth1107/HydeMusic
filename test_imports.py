#!/usr/bin/env python3

import sys

def test_import(module_name, package_name=None):
    try:
        if package_name:
            exec(f"import {module_name}")
            print(f"✓ {package_name}: {module_name} imported successfully")
        else:
            exec(f"import {module_name}")
            print(f"✓ {module_name} imported successfully")
        return True
    except Exception as e:
        if package_name:
            print(f"✗ {package_name}: {module_name} failed - {e}")
        else:
            print(f"✗ {module_name} failed - {e}")
        return False

print("Testing individual package imports...")
print("=" * 50)

# Test each package individually
packages = [
    ("flask", "Flask"),
    ("flask_cors", "Flask-CORS"),
    ("requests", "Requests"),
    ("pydantic", "Pydantic"),
    ("dotenv", "Python-dotenv"),
    ("youtube_search_python", "YouTube Search Python"),
    ("pytube", "PyTube"),
    ("spotipy", "Spotipy"),
    ("langsmith", "LangSmith"),
    ("langchain_core", "LangChain Core"),
    ("langchain", "LangChain"),
    ("langchain_ollama", "LangChain Ollama")
]

failed_imports = []
for module, package in packages:
    if not test_import(module, package):
        failed_imports.append((module, package))

print("\n" + "=" * 50)
if failed_imports:
    print(f"Failed imports ({len(failed_imports)}):")
    for module, package in failed_imports:
        print(f"  - {package} ({module})")
    sys.exit(1)
else:
    print("All packages imported successfully!")
    sys.exit(0)
