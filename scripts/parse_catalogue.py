import re
import json

def clean_text(text):
    if not text:
        return text
    # Approved typo fixes
    text = re.sub(r'\bKit sEt\b', 'Kit Set', text)
    text = re.sub(r'\bsEt\b', 'Set', text)
    text = re.sub(r'\bllmm\b', '11mm', text)
    text = re.sub(r'4°\s*long', '4" long', text)
    return text.strip()

def parse_catalogue():
    with open('Praztech 2027 Extracted Text.md.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into sections by Catalogue Page
    page_splits = re.split(r'(Catalogue Page \d+.*)', content)
    
    pages = []
    for i in range(1, len(page_splits), 2):
        header = page_splits[i].strip()
        body = page_splits[i+1].strip() if i+1 < len(page_splits) else ""
        pages.append((header, body))
        
    print(f"Total raw pages found: {len(pages)}")
    return pages

pages = parse_catalogue()
