import re
import json

with open('Praztech 2027 Extracted Text.md.txt', 'r', encoding='utf-8') as f:
    content = f.read()

splits = re.split(r'Catalogue Page (\d+)\s*\([^)]*\)\s*—\s*([^\n]+)', content)
# splits: [preamble, page_num1, title1, body1, page_num2, title2, body2, ...]
print("Splits count:", len(splits))
pages = []
for i in range(1, len(splits), 3):
    p_num = int(splits[i])
    p_title = splits[i+1].strip()
    p_body = splits[i+2].strip()
    pages.append({'page': p_num, 'title': p_title, 'body': p_body})

print(f"Extracted {len(pages)} pages.")
for p in pages[:5]:
    print(p['page'], p['title'], len(p['body']))
