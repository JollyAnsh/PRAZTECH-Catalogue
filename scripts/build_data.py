import re
import json

def clean_text(val):
    if not val:
        return ""
    val = val.strip()
    val = re.sub(r'\bKit sEt\b', 'Kit Set', val)
    val = re.sub(r'\bsEt\b', 'Set', val)
    val = re.sub(r'\bllmm\b', '11mm', val)
    val = re.sub(r'4°\s*long', '4" long', val)
    return val

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

with open('Praztech 2027 Extracted Text.md.txt', 'r', encoding='utf-8') as f:
    content = f.read()

splits = re.split(r'Catalogue Page (\d+)\s*\([^)]*\)\s*—\s*([^\n]+)', content)
pages = {}
for i in range(1, len(splits), 3):
    p_num = int(splits[i])
    p_title = splits[i+1].strip()
    p_body = splits[i+2].strip()
    pages[p_num] = {'title': p_title, 'body': p_body}

def parse_bullet_section(body, section_header):
    pattern = rf'\*\s*{re.escape(section_header)}:\s*\n((?:\s+\*\s+[^\n]+\n*)+)'
    m = re.search(pattern, body, re.IGNORECASE)
    if not m:
        return []
    raw_lines = m.group(1).splitlines()
    items = []
    for l in raw_lines:
        l = l.strip()
        if l.startswith('*'):
            items.append(clean_text(l[1:].strip()))
    return items

def parse_simple_field(body, field_name):
    pattern = rf'\*\s*{re.escape(field_name)}:\s*([^\n]+)'
    m = re.search(pattern, body, re.IGNORECASE)
    if m:
        return clean_text(m.group(1))
    return None

def parse_multiline_field(body, field_name, stop_fields):
    stop_pattern = "|".join([re.escape(s) for s in stop_fields])
    pattern = rf'\*\s*{re.escape(field_name)}:\s*(.*?)(?=\n\*\s*(?:{stop_pattern})|\Z)'
    m = re.search(pattern, body, re.IGNORECASE | re.DOTALL)
    if m:
        val = m.group(1).strip()
        # Clean leading bullet if present
        lines = [clean_text(l) for l in val.splitlines() if l.strip()]
        return " ".join(lines)
    return None

print(f"Loaded {len(pages)} catalogue pages.")
