import re
import json
import os

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
raw_pages = {}
for i in range(1, len(splits), 3):
    p_num = int(splits[i])
    p_title = splits[i+1].strip()
    p_body = splits[i+2].strip()
    raw_pages[p_num] = {'title': p_title, 'body': p_body}

def get_bullets(body, header):
    pattern = rf'\*\s*{re.escape(header)}:\s*\n((?:\s+\*\s+[^\n]+\n*)+)'
    m = re.search(pattern, body, re.IGNORECASE)
    if not m:
        return []
    res = []
    for line in m.group(1).splitlines():
        line = line.strip()
        if line.startswith('*'):
            res.append(clean_text(line[1:].strip()))
    return res

def get_field(body, header):
    pattern = rf'\*\s*{re.escape(header)}:\s*([^\n]+)'
    m = re.search(pattern, body, re.IGNORECASE)
    if m:
        return clean_text(m.group(1))
    return ""

def get_multiline(body, header, next_headers):
    stop = "|".join([re.escape(h) for h in next_headers])
    pattern = rf'\*\s*{re.escape(header)}:\s*(.*?)(?=\n\*\s*(?:{stop})|\Z)'
    m = re.search(pattern, body, re.IGNORECASE | re.DOTALL)
    if m:
        val = m.group(1).strip()
        lines = [clean_text(l) for l in val.splitlines() if l.strip()]
        # remove bullet signs if line starts with *
        clean_lines = []
        for l in lines:
            if l.startswith('*'):
                clean_lines.append(l[1:].strip())
            else:
                clean_lines.append(l)
        return " ".join(clean_lines)
    return ""

categories = [
    {
        "id": "cat-valve-seat-grinding",
        "name": "Valve Seat Grinding Tools",
        "slug": "valve-seat-grinding-tools",
        "description": "Precision valve seat grinding kits, diamond dressers, stones, pilots, holders, and heavy-duty stands for engine rebuilding and restoration.",
        "displayOrder": 1,
        "parentCategory": "Engine Repair & Restoration"
    },
    {
        "id": "cat-honing-boring",
        "name": "Honing & Boring Tools",
        "slug": "honing-and-boring-tools",
        "description": "Engine cylinder honing stone holders, silicon carbide and diamond honing stones, and carbide tip boring bits.",
        "displayOrder": 2,
        "parentCategory": "Engine Cylinder Machining"
    },
    {
        "id": "cat-valve-seat-cutting",
        "name": "Valve Seat Cutting Tools",
        "slug": "valve-seat-cutting-tools",
        "description": "Multi-angle carbide-tipped valve seat cutters and HSS/HCS cutter sets for car, motorcycle, small engine, and vintage engine restoration.",
        "displayOrder": 3,
        "parentCategory": "Engine Repair & Restoration"
    },
    {
        "id": "cat-kingpin-reaming",
        "name": "Kingpin Reaming Tools",
        "slug": "kingpin-reaming-tools",
        "description": "HSS adjustable expanding hand reamers with long pilots and extension pilots for kingpin fitting and precision bushing alignment.",
        "displayOrder": 4,
        "parentCategory": "Reaming Tools"
    }
]

products = []

# Pages 1 to 26: Grinding Tools
for p_num in range(1, 27):
    p = raw_pages[p_num]
    body = p['body']
    model_no = get_field(body, 'Model No.') or p['title']
    name = get_field(body, 'Product Name')
    tag = get_field(body, 'Tag') or 'bestseller'
    desc = get_multiline(body, 'Product Description', ['Key Features', 'Applications', 'Set Includes', 'Sizes Detail', 'Compatibility', 'Item Specifics', 'Note', 'WHY CHOOSE THIS SET?'])
    features = get_bullets(body, 'Key Features')
    applications = get_bullets(body, 'Applications')
    set_includes = get_bullets(body, 'Set Includes')
    sizes_detail = get_bullets(body, 'Sizes Detail')
    compat = get_multiline(body, 'Compatibility', ['Item Specifics', 'Page', 'Note']) or get_multiline(body, 'COMPATIBILITY', ['Item Specifics', 'Page', 'Note'])
    note = get_field(body, 'Note')
    
    # Item Specifics
    item_specifics = {}
    m_specs = re.search(r'\*\s*Item Specifics(?:\s*\([^)]*\))?:\s*\n((?:\s+\*\s+[^\n]+\n*)+)', body, re.IGNORECASE)
    if m_specs:
        for l in m_specs.group(1).splitlines():
            l = l.strip()
            if l.startswith('*'):
                parts = l[1:].strip().split(':', 1)
                if len(parts) == 2:
                    item_specifics[parts[0].strip()] = clean_text(parts[1].strip())
    
    # Specific adjustments
    sub_models = []
    corrections = []
    flags = []
    
    if "sEt" in p['body']:
        corrections.append("Normalised 'sEt' to 'Set' in product name")
    if "llmm" in p['body']:
        corrections.append("Corrected 'llmm' to '11mm' in pilot sizes")
        
    if p_num == 10: # Psvp-21W
        note = "Also available in wooden box packing at an additional cost"
        name = "Valve grinding pilots with 11/16\" stone holder (Wooden Box)"
        desc = "Complete 21-piece valve grinding pilot set with 11/16\" stone holder, supplied in premium wooden box packaging for enhanced protection and workshop organization."
        features = raw_pages[9]['body'] # Inherit features from p9
        features = get_bullets(features, 'Key Features')
        applications = get_bullets(raw_pages[9]['body'], 'Applications')
        set_includes = get_bullets(raw_pages[9]['body'], 'Set Includes')
        
    if p_num == 19: # Pbvp-21W
        note = "Also available in wooden box packing at an additional cost"
        name = "Valve grinding pilots with 9/16\" stone holder (Wooden Box)"
        desc = "Complete 21-piece valve grinding pilot set with 9/16\" stone holder, supplied in premium wooden box packaging for enhanced protection and workshop organization."
        features = get_bullets(raw_pages[18]['body'], 'Key Features')
        applications = get_bullets(raw_pages[18]['body'], 'Applications')
        set_includes = get_bullets(raw_pages[18]['body'], 'Set Includes')

    if p_num == 11: # Vgs1116
        table_sizes = [
            {"inches": "1\"", "mm": "25.4 mm"},
            {"inches": "1⅛\"", "mm": "28.5 mm"},
            {"inches": "1¼\"", "mm": "31.75 mm"},
            {"inches": "1⅜\"", "mm": "35 mm"},
            {"inches": "1 7/16\"", "mm": "36.5 mm"},
            {"inches": "1½\"", "mm": "38 mm"},
            {"inches": "1⅝\"", "mm": "41 mm"},
            {"inches": "1¾\"", "mm": "44.5 mm"},
            {"inches": "1⅞\"", "mm": "47.5 mm"},
            {"inches": "2\"", "mm": "50.8 mm"},
            {"inches": "2⅛\"", "mm": "53.9 mm"},
            {"inches": "2¼\"", "mm": "57 mm"},
            {"inches": "2⅜\"", "mm": "60 mm"},
            {"inches": "2½\"", "mm": "63.5 mm"}
        ]
        sub_models = [{"sizeInches": s["inches"], "sizeMm": s["mm"]} for s in table_sizes]

    if p_num == 20: # Vgs916
        table_sizes = [
            {"inches": "1\"", "mm": "25.4 mm"},
            {"inches": "1⅛\"", "mm": "28.5 mm"},
            {"inches": "1¼\"", "mm": "31.75 mm"},
            {"inches": "1⅜\"", "mm": "35 mm"},
            {"inches": "1 7/16\"", "mm": "36.5 mm"},
            {"inches": "1½\"", "mm": "38 mm"},
            {"inches": "1⅝\"", "mm": "41 mm"},
            {"inches": "1¾\"", "mm": "44.5 mm"},
            {"inches": "1⅞\"", "mm": "47.5 mm"},
            {"inches": "2\"", "mm": "50.8 mm"},
            {"inches": "2⅛\"", "mm": "53.9 mm"},
            {"inches": "2¼\"", "mm": "57 mm"},
            {"inches": "2⅜\"", "mm": "60 mm"},
            {"inches": "2½\"", "mm": "63.5 mm"}
        ]
        sub_models = [{"sizeInches": s["inches"], "sizeMm": s["mm"]} for s in table_sizes]

    if p_num == 25: # Vgs716
        mm_sizes = ["18 mm", "19 mm", "20 mm", "21 mm", "22 mm", "23 mm", "24 mm", "25 mm", "26 mm", "27 mm", "28 mm", "29 mm", "30 mm", "31 mm", "32 mm", "33 mm", "34 mm"]
        sub_models = [{"sizeMm": s} for s in mm_sizes]

    if p_num == 26: # Vgsh
        desc = "High-precision valve grinding stone holders equipped with dual ball bearings for smooth concentric rotation and durability in workshop environments."
        features = [
            "Equipped with dual precision ball bearings for concentric stability",
            "Available in 11/16\" Star Drive, 9/16\" Hex Drive, and 7/16\" Hex Drive configurations",
            "High durability steel construction for professional automotive workshops"
        ]
        applications = [
            "Valve seat grinding setup",
            "Centred mounting for threaded grinding stones",
            "Engine cylinder head reconditioning"
        ]
        sub_models = [
            {"modelNo": "Vgsh1116", "thread": "11/16\" Thread", "drive": "Star Drive", "features": "Equipped with dual ball bearings"},
            {"modelNo": "Vgsh916", "thread": "9/16\" Thread", "drive": "Hex Drive", "features": "Equipped with dual ball bearings"},
            {"modelNo": "Vgsh716", "thread": "7/16\" Thread", "drive": "Hex Drive", "features": "Equipped with dual ball bearings"}
        ]

    slug = slugify(model_no)
    products.append({
        "id": f"prod-{p_num:02d}-{slug}",
        "indexNumber": p_num,
        "modelNo": model_no,
        "slug": slug,
        "name": name,
        "category": "Valve Seat Grinding Tools",
        "categorySlug": "valve-seat-grinding-tools",
        "cataloguePage": p_num,
        "tag": tag,
        "description": desc,
        "keyFeatures": features,
        "applications": applications,
        "setIncludes": set_includes,
        "sizesDetail": sizes_detail,
        "compatibility": compat,
        "itemSpecifics": item_specifics,
        "notes": note,
        "subModels": sub_models,
        "corrections": corrections,
        "flags": flags,
        "images": [f"/images/placeholder-{slug}.svg"],
        "isActive": True
    })

# Page 27: Pvds (Standard)
p27 = raw_pages[27]
b27 = p27['body']
products.append({
    "id": "prod-27-pvds",
    "indexNumber": 27,
    "modelNo": "Pvds",
    "slug": "pvds",
    "name": "Valve grinding stone dresser stand",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 27,
    "tag": "bestseller",
    "description": get_multiline(b27, 'Product Description', ['Key Features', 'Applications', 'WHY CHOOSE THIS STAND?']),
    "keyFeatures": get_bullets(b27, 'Key Features'),
    "applications": get_bullets(b27, 'Applications'),
    "setIncludes": [],
    "sizesDetail": ["Compatible Stone Holder Sizes: 7/16\" | 9/16\" | 11/16\"", "Adjustable Angles: 20° | 30° | 45° | 60° | 75°"],
    "compatibility": "Compatible with 7/16\", 9/16\", and 11/16\" stone holders.",
    "itemSpecifics": {"Compatible Holders": "7/16\" | 9/16\" | 11/16\"", "Adjustable Angles": "20°, 30°, 45°, 60°, 75°"},
    "notes": "A practical workshop accessory for flexible angle settings and consistent valve grinding stone dressing.",
    "subModels": [],
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-pvds.svg"],
    "isActive": True
})

# Page 28: Pvds (Heavy-Duty Variant)
p28 = raw_pages[28]
b28 = p28['body']
products.append({
    "id": "prod-28-pvds-heavy-duty",
    "indexNumber": 27.5, # Page 28 in catalogue
    "modelNo": "Pvds (Heavy-Duty)",
    "slug": "pvds-heavy-duty",
    "name": "Heavy-Duty Valve Grinding Stone Dresser Stand",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 28,
    "tag": "bestseller",
    "description": "Heavy-duty variant of the valve grinding stone dresser stand featuring premium build quality, rigid cast base, and enhanced stability for vibration-free dressing in high-production workshops.",
    "keyFeatures": [
        "Heavy-duty cast body for superior stability and vibration dampening",
        "Compatible with 7/16\", 9/16\", and 11/16\" stone holders",
        "Multi-angle dressing selector: 20°, 30°, 45°, 60°, and 75°",
        "Engineered for heavy repeated daily workshop use"
    ],
    "applications": [
        "High-precision valve grinding stone dressing",
        "Commercial engine reconditioning plants",
        "Heavy automotive machine shops"
    ],
    "setIncludes": [],
    "sizesDetail": ["Compatible Stone Holder Sizes: 7/16\" | 9/16\" | 11/16\"", "Adjustable Angles: 20° | 30° | 45° | 60° | 75°"],
    "compatibility": "Compatible with 7/16\", 9/16\", and 11/16\" stone holders.",
    "itemSpecifics": {"Build": "Heavy-Duty", "Compatible Holders": "7/16\" | 9/16\" | 11/16\"", "Adjustable Angles": "20°, 30°, 45°, 60°, 75°"},
    "notes": "Supplied in heavy-duty variant with premium build quality for enhanced stability and durability.",
    "subModels": [],
    "corrections": [],
    "flags": ["Separated from Page 27 as requested for distinct catalogue representation"],
    "images": ["/images/placeholder-pvds-heavy-duty.svg"],
    "isActive": True
})

# Page 29: Phsg (High speed grinder)
p29 = raw_pages[29]
b29 = p29['body']
products.append({
    "id": "prod-29-phsg",
    "indexNumber": 28,
    "modelNo": "Phsg",
    "slug": "phsg",
    "name": "High speed grinder with adapter",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 29,
    "tag": "bestseller",
    "description": get_multiline(b29, 'Product Description', ['Key Features', 'Applications', 'Compatibility', 'Item Specifics']),
    "keyFeatures": get_bullets(b29, 'Key Features'),
    "applications": get_bullets(b29, 'Applications'),
    "setIncludes": get_bullets(b29, 'Set Includes'),
    "sizesDetail": ["750W Motor", "12,000 RPM No-Load Speed", "230V AC / 50 Hz"],
    "compatibility": get_field(b29, 'Compatibility') or "Compatible with 11/16\", 9/16\", and 7/16\" stone holders.",
    "itemSpecifics": {"Voltage": "230 V", "Input Power": "750 W", "No-Load Speed": "12000 rpm", "Drive": "Available in star OR hex drive"},
    "notes": "Available in star OR hex drive adapter.",
    "subModels": [
        {"modelNo": "Phsg-Star", "name": "High Speed Grinder with Star Drive Adapter", "voltage": "230V", "power": "750W", "speed": "12000 RPM"},
        {"modelNo": "Phsg-Hex", "name": "High Speed Grinder with Hex Drive Adapter", "voltage": "230V", "power": "750W", "speed": "12000 RPM"}
    ],
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-phsg.svg"],
    "isActive": True
})

# Page 30: ptd-38
p30 = raw_pages[30]
b30 = p30['body']
products.append({
    "id": "prod-30-ptd-38",
    "indexNumber": 29,
    "modelNo": "ptd-38",
    "slug": "ptd-38",
    "name": "Diamond Point Valve Grinding stone Dresser (3/8\" x 24 UNF)",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 30,
    "tag": "bestseller",
    "description": "Sioux Type Seat Threaded Diamond Dresser for perfect dressing of valve seat grinding stones. Ideal for SIOUX and Black & Decker valve seat grinder stone dressers (3/8\" x 24 UNF).",
    "keyFeatures": get_bullets(b30, 'Key Features'),
    "applications": get_bullets(b30, 'Applications'),
    "setIncludes": [],
    "sizesDetail": ["3/8\" x 24 UNF Thread", "Available in 0.75ct, 1.00ct, 1.50ct, 2.00ct"],
    "compatibility": "Sioux Valve Grinders, Black & Decker valve grinders, and 3/8\" x 24 UNF threaded dresser systems.",
    "itemSpecifics": {"Thread": "3/8\" x 24 UNF", "Type": "Sioux Type Carat-tip Diamond Dresser"},
    "notes": "",
    "subModels": [
        {"modelNo": "Ptd-38A", "carat": "0.75ct", "thread": "3/8\" x 24 UNF"},
        {"modelNo": "Ptd-38b", "carat": "1.00ct", "thread": "3/8\" x 24 UNF"},
        {"modelNo": "Ptd-38c", "carat": "1.50ct", "thread": "3/8\" x 24 UNF"},
        {"modelNo": "Ptd-38D", "carat": "2.00ct", "thread": "3/8\" x 24 UNF"}
    ],
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-ptd-38.svg"],
    "isActive": True
})

# Page 31: ptd-516
p31 = raw_pages[31]
b31 = p31['body']
products.append({
    "id": "prod-31-ptd-516",
    "indexNumber": 30,
    "modelNo": "ptd-516",
    "slug": "ptd-516",
    "name": "Diamond Point Valve Grinding stone Dresser (5/16\" x 24 TPI)",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 31,
    "tag": "bestseller",
    "description": get_multiline(b31, 'Product Description', ['Key Features', 'Applications', 'Compatibility', 'Item Specifics']),
    "keyFeatures": get_bullets(b31, 'Key Features'),
    "applications": get_bullets(b31, 'Applications'),
    "setIncludes": [],
    "sizesDetail": ["5/16\" x 24 TPI Thread", "2 3/8\" Overall Length", "Available in 0.75ct, 1.00ct, 1.50ct, 2.00ct"],
    "compatibility": "Fits most Black & Decker and SIOUX valve seat grinder stone dressers using 5/16\" x 24 TPI threads.",
    "itemSpecifics": {"Thread": "5/16\" x 24 TPI", "Overall Length": "2 3/8\"", "Type": "Threaded Diamond Stone Point Dresser"},
    "notes": "Confirm your thread size before purchase.",
    "subModels": [
        {"modelNo": "Ptd-516A", "carat": "0.75ct", "thread": "5/16\" x 24 TPI"},
        {"modelNo": "Ptd-516b", "carat": "1.00ct", "thread": "5/16\" x 24 TPI"},
        {"modelNo": "Ptd-516c", "carat": "1.50ct", "thread": "5/16\" x 24 TPI"},
        {"modelNo": "Ptd-516D", "carat": "2.00ct", "thread": "5/16\" x 24 TPI"}
    ],
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-ptd-516.svg"],
    "isActive": True
})

# Page 32: Phr - hss
p32 = raw_pages[32]
b32 = p32['body']
mm_reamer_sizes = "3.97, 3.98, 3.99, 4, 4.47, 4.48, 4.49, 4.5, 4.97, 4.98, 4.99, 5, 5.47, 5.48, 5.49, 5.5, 5.97, 5.98, 5.99, 6, 6.47, 6.48, 6.49, 6.5, 6.97, 6.98, 6.99, 7, 7.47, 7.48, 7.49, 7.5, 7.97, 7.98, 7.99, 8, 8.47, 8.48, 8.49, 8.5, 8.97, 8.98, 8.99, 9, 9.47, 9.48, 9.49, 9.5, 9.97, 9.98, 9.99, 10, 10.47, 10.48, 10.49, 10.5, 10.97, 10.98, 10.99, 11 and above"
products.append({
    "id": "prod-32-phr-hss",
    "indexNumber": 31,
    "modelNo": "Phr - hss",
    "slug": "phr-hss",
    "name": "HSS Valve Stem Guide hand Reamer",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 32,
    "tag": "bestseller",
    "description": get_multiline(b32, 'Product Description', ['Key Features', 'Applications', 'Size in mm', 'Custom sizes Available']),
    "keyFeatures": get_bullets(b32, 'Key Features'),
    "applications": get_bullets(b32, 'Applications'),
    "setIncludes": [],
    "sizesDetail": [
        f"Available Sizes (mm): {mm_reamer_sizes}",
        "Lengths: Starts from 4mm to 12.5mm and above. Till 5.5mm available in 100mm(4\") and 150mm(6\"); Above 5.5mm available in 150mm(6\") and 180mm(7\")"
    ],
    "compatibility": "Precision hole sizing and finishing for automotive valve stem guides, motorcycle, marine and metal fabrication.",
    "itemSpecifics": {"Material": "High-Speed Steel (HSS)", "Flute Type": "Spiral Flutes"},
    "notes": "Custom sizes and lengths available to meet specific workshop requirements.",
    "subModels": [],
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-phr-hss.svg"],
    "isActive": True
})

# Page 33: Phr - 7
p33 = raw_pages[33]
b33 = p33['body']
products.append({
    "id": "prod-33-phr-7",
    "indexNumber": 32,
    "modelNo": "Phr - 7",
    "slug": "phr-7",
    "name": "HSS Valve Stem Guide hand Reamer 7 pcs set",
    "category": "Valve Seat Grinding Tools",
    "categorySlug": "valve-seat-grinding-tools",
    "cataloguePage": 33,
    "tag": "bestseller",
    "description": get_multiline(b33, 'Product Description', ['Key Features', 'Applications', 'Customisation Available']),
    "keyFeatures": get_bullets(b33, 'Key Features'),
    "applications": get_bullets(b33, 'Applications'),
    "setIncludes": [
        "4mm (4\" long)",
        "4.5mm (4\" long)",
        "5mm (4\" long)", # corrected 4° to 4"
        "5.5mm (4\" long)",
        "6mm (6\" long)",
        "6.5mm (6\" long)",
        "7mm (6\" long)"
    ],
    "sizesDetail": ["4mm (4\"), 4.5mm (4\"), 5mm (4\"), 5.5mm (4\"), 6mm (6\"), 6.5mm (6\"), 7mm (6\")"],
    "compatibility": "Automotive and motorcycle valve stem guide reaming, deburring, and hole refinement.",
    "itemSpecifics": {"Pieces in Set": "7 pcs", "Material": "High-Speed Steel (HSS)", "Flute Type": "Spiral Flutes"},
    "notes": "We offer customised sets to meet your specific requirements.",
    "subModels": [],
    "corrections": ["Corrected typo '5mm (4° long)' to '5mm (4\" long)'"],
    "flags": [],
    "images": ["/images/placeholder-phr-7.svg"],
    "isActive": True
})

# Category 2: Honing & Boring (Pages 34 to 37)
# Page 34: Hone
p34 = raw_pages[34]
b34 = p34['body']
hone_submodels = [
    {"modelNo": "Hone34", "range": "34–60 mm"},
    {"modelNo": "Hone45", "range": "45–65 mm"},
    {"modelNo": "Hone50", "range": "50–75 mm"},
    {"modelNo": "Hone62", "range": "62–88 mm"},
    {"modelNo": "Hone63", "range": "63.5–139 mm"},
    {"modelNo": "Hone82", "range": "82.5–158 mm"}
]
products.append({
    "id": "prod-34-hone",
    "indexNumber": 33,
    "modelNo": "Hone",
    "slug": "hone",
    "name": "HONING STONE HOLDER with honing stones",
    "category": "Honing & Boring Tools",
    "categorySlug": "honing-and-boring-tools",
    "cataloguePage": 34,
    "tag": "bestseller",
    "description": get_multiline(b34, 'Product Description', ['Key Features', 'Applications', 'Compatibility', 'SIZES available']),
    "keyFeatures": get_bullets(b34, 'Key Features'),
    "applications": get_bullets(b34, 'Applications'),
    "setIncludes": ["Honing Stone Holder", "Compatible Honing Stone Set"],
    "sizesDetail": ["Available for bore ranges from 34 mm to 158 mm across 6 holder sizes."],
    "compatibility": "Suitable for cylinder bore sizes ranging from 34 mm to 158 mm depending on holder size.",
    "itemSpecifics": {"Bore Range Coverage": "34 mm to 158 mm", "Sizes Count": "6 holder models"},
    "notes": "",
    "subModels": hone_submodels,
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-hone.svg"],
    "isActive": True
})

# Page 35: Host (Silicon carbide honing stone)
p35 = raw_pages[35]
b35 = p35['body']
host_submodels = [
    {"range": "34–60 mm", "dimensions": "3\" × 1/4\" × 1/4\"", "grit120": "Host34120", "grit180": "Host34180", "grit220": "Host34220", "grit320": "Host34320"},
    {"range": "45–65 mm", "dimensions": "3\" × 5/16\" × 5/16\"", "grit120": "Host45120", "grit180": "Host45180", "grit220": "Host45220", "grit320": "Host45320"},
    {"range": "50–75 mm", "dimensions": "4\" × 3/8\" × 3/8\"", "grit120": "Host50120", "grit180": "Host50180", "grit220": "Host50220", "grit320": "Host50320"},
    {"range": "62–88 mm", "dimensions": "3\" × 3/8\" × 3/8\"", "grit120": "Host62120", "grit180": "Host62180", "grit220": "Host62220", "grit320": "Host62320"},
    {"range": "63.5–139 mm", "dimensions": "4\" × 1/2\" × 1/2\"", "grit120": "Host63120", "grit180": "Host63180", "grit220": "Host63220", "grit320": "Host63320"},
    {"range": "82.5–158 mm", "dimensions": "4\" × 1/2\" × 1/2\"", "grit120": "Host82120", "grit180": "Host82180", "grit220": "Host82220", "grit320": "Host82380"} # Verified from screenshot
]
products.append({
    "id": "prod-35-host",
    "indexNumber": 34,
    "modelNo": "Host",
    "slug": "host",
    "name": "Silicone carbide honing stone",
    "category": "Honing & Boring Tools",
    "categorySlug": "honing-and-boring-tools",
    "cataloguePage": 35,
    "tag": "bestseller",
    "description": "High-grade silicon carbide honing stones engineered for cylinder bore deglazing, sizing, and plateau finishing across 120, 180, 220, and 320 grit specifications.",
    "keyFeatures": [
        "Premium Silicon Carbide abrasive formulation",
        "Available in 4 grits: 120 Coarse, 180 Medium, 220 Fine, and 320 Super Fine",
        "Precisely dimensioned for standard honing holders from 34 mm to 158 mm",
        "Consistent stock removal and smooth surface cross-hatch pattern"
    ],
    "applications": [
        "Engine cylinder bore honing and finishing",
        "Cylinder deglazing during piston ring replacement",
        "Automotive machine shop and engine rebuilding"
    ],
    "setIncludes": [],
    "sizesDetail": ["Sizes from 3\" × 1/4\" × 1/4\" up to 4\" × 1/2\" × 1/2\" for holder ranges 34mm–158mm."],
    "compatibility": "Compatible with standard honing stone holders across 34–158 mm bore capacities.",
    "itemSpecifics": {"Material": "Silicon Carbide", "Available Grits": "120, 180, 220, 320"},
    "notes": "Host82380 confirmed as printed in original catalogue table under 320 super fine grits column.",
    "subModels": host_submodels,
    "corrections": [],
    "flags": ["Host82380: Confirmed as printed in original catalogue screenshot, under 320 Super Fine Grits column."],
    "images": ["/images/placeholder-host.svg"],
    "isActive": True
})

# Page 36: Dhost (Diamond honing stone)
p36 = raw_pages[36]
b36 = p36['body']
dhost_submodels = [
    {"range": "34–60 mm", "dimensions": "3\" × 1/4\" × 1/4\"", "grit180": "DHost34180", "grit220": "DHost34220"},
    {"range": "45–65 mm", "dimensions": "3\" × 5/16\" × 5/16\"", "grit180": "DHost45180", "grit220": "DHost45220"},
    {"range": "50–75 mm", "dimensions": "4\" × 3/8\" × 3/8\"", "grit180": "DHost50180", "grit220": "DHost50220"},
    {"range": "62–88 mm", "dimensions": "3\" × 3/8\" × 3/8\"", "grit180": "DHost62180", "grit220": "DHost62220"},
    {"range": "63.5–139 mm", "dimensions": "4\" × 1/2\" × 1/2\"", "grit180": "DHost63180", "grit220": "DHost63220"},
    {"range": "82.5–158 mm", "dimensions": "4\" × 1/2\" × 1/2\"", "grit180": "DHost82180", "grit220": "DHost82220"}
]
products.append({
    "id": "prod-36-dhost",
    "indexNumber": 35,
    "modelNo": "Dhost",
    "slug": "dhost",
    "name": "Diamond honing stone",
    "category": "Honing & Boring Tools",
    "categorySlug": "honing-and-boring-tools",
    "cataloguePage": 36,
    "tag": "bestseller",
    "description": get_multiline(b36, 'Product Description', ['Key Features', 'Applications', 'Available grades', 'Compatible Holder Range']),
    "keyFeatures": get_bullets(b36, 'Key Features'),
    "applications": get_bullets(b36, 'Applications'),
    "setIncludes": ["Set of 4 pieces"],
    "sizesDetail": ["Available in Fine Grade (220) and Medium Grade (180) across 6 holder size brackets."],
    "compatibility": "Compatible with standard honing holders from 34 mm to 158 mm bore capacity.",
    "itemSpecifics": {"Material": "Diamond Abrasive", "Packaging": "Set of 4 pieces", "Grades": "Fine (220) & Medium (180)"},
    "notes": "Supplied in set of 4 pieces.",
    "subModels": dhost_submodels,
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-dhost.svg"],
    "isActive": True
})

# Page 37: Ctbb (Carbide Tip Boring Bits)
p37 = raw_pages[37]
b37 = p37['body']
products.append({
    "id": "prod-37-ctbb",
    "indexNumber": 36,
    "modelNo": "Ctbb",
    "slug": "ctbb",
    "name": "CARBIDE TIP BORING BITS",
    "category": "Honing & Boring Tools",
    "categorySlug": "honing-and-boring-tools",
    "cataloguePage": 37,
    "tag": "bestseller",
    "description": get_multiline(b37, 'Product Description', ['Key Features', 'Applications', 'Sizes detail', 'Customisation', 'MATERIAL & CONSTRUCTION']),
    "keyFeatures": get_bullets(b37, 'Key Features'),
    "applications": get_bullets(b37, 'Applications'),
    "setIncludes": [],
    "sizesDetail": [
        "Standard Lengths: 60 mm and 80 mm",
        "Standard Widths: 6, 8, 10, 12, 14, 16, 18, and 20 mm",
        "Tip Profiles: Diagram configurations (A), (b), (C), (d), (e), (f), (g)"
    ],
    "compatibility": "Line boring machines, engine block line boring setups, and automotive machine shops.",
    "itemSpecifics": {"Cutting Edges": "Carbide-Tipped", "Tool Body": "Durable metal body", "Standard Lengths": "60mm & 80mm", "Standard Widths": "6–20mm"},
    "notes": "Custom lengths and widths available to suit specific applications.",
    "subModels": [
        {"profile": "A", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]},
        {"profile": "B", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]},
        {"profile": "C", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]},
        {"profile": "D", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]},
        {"profile": "E", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]},
        {"profile": "F", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]},
        {"profile": "G", "lengths": ["60mm", "80mm"], "widths": ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm"]}
    ],
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-ctbb.svg"],
    "isActive": True
})

# Category 3: Valve Seat Cutting Tools (Pages 38-40: Vscct, Page 41: vscs)
# Page 38-40: Vscct
p38 = raw_pages[38]
b38 = p38['body']
vscct_submodels = [
    {"modelNo": "vscct3", "angles": "2 Angle Cut", "cutters": "3 Cutters — 45°: 23mm, 26mm; 20°: 25mm", "pilots": "1 Pilot — 5.5mm", "reamers": "1 HSS Reamer — 5.5mm", "compatibility": "Small gasoline engines"},
    {"modelNo": "vscct5", "angles": "2 Angle Cut", "cutters": "5 Cutters — 45°: 1-5/16\", 1-7/16\", 1-1/2\", 1-5/8\"; 20° Bore: 1-1/2\"", "pilots": "2 Pilots — 7/16\", 5/16\"", "reamers": "-", "compatibility": "Two- and three-wheelers"},
    {"modelNo": "vscct12", "angles": "3 Angle Cut", "cutters": "12 Cutters — 45°: 1-3/16\", 1-1/4\", 1-5/16\", 1-7/16\", 1-7/8\", 1-3/4\", 1-5/8\", 1-1/2\"; 30°: 1-3/4\"; 20° Bore: 1-13/16\", 1-3/8\", 1-1/4\"", "pilots": "8 Pilots — 7/16\", 11/32\", 5/16\", 7, 8, 8.5, 9, 10mm", "reamers": "-", "compatibility": "Large valve seats"},
    {"modelNo": "vscct14", "angles": "2 Angle Cut", "cutters": "14 Cutters — 45°: 20–31mm; 20° Bore: 24mm, 28mm", "pilots": "3 Pilots — 4.5, 5, 5.5mm", "reamers": "3 HSS Reamers — 4.5, 5, 5.5mm", "compatibility": "Bikes, ATVs, lawn mowers"},
    {"modelNo": "vscct15", "angles": "3 Angle Cut", "cutters": "15 Cutters — 45°: 1-3/16\", 1-1/4\", 1-5/16\", 1-7/16\", 1-3/8\", 1-3/4\", 1-7/8\", 1-5/8\", 1 1/2\", 2\"; 30°: 1-3/4\", 1-7/8\"; 20° Bore: 1-13/16\", 1-5/8\", 1-1/4\"", "pilots": "8 Pilots — 7/16\", 11/32\", 5/16\", 7, 8, 8.5, 9, 10mm", "reamers": "-", "compatibility": "Large valve seats"},
    {"modelNo": "vscct21", "angles": "2 Angle Cut", "cutters": "21 Cutters — 45°: 18mm, 20-30mm, 1-3/16\", 1-3/8\", 1-7/16\", 1-1/2\", 1-1/4\", 1-5/16\"; 20° Bore: 24mm, 28mm, 1-1/4\"", "pilots": "4 Pilots — 4.5, 5, 5.5, 7mm", "reamers": "4 HSS Reamers — 4.5, 5, 5.5, 7mm", "compatibility": "Bikes, ATVs, lawn mowers"},
    {"modelNo": "vscct21b", "angles": "3 Angle Cut", "cutters": "21 Cutters — 45°: 1\", 1-5/8\", 1-3/8\", 1-5/16\", 1-1/4\", 1-3/16\", 1-7/16\", 1-1/2\", 1-1/8\", 1-9/16\", 1-7/8\", 2\", 2-1/8\", 2-1/4\", 1-3/4\"; 30°: 1-3/4\", 1-7/8\"; 20° Bore: 1-13/16\", 1-1/4\", 1-1/2\", 2\"", "pilots": "8 Pilots — 7/16\", 11/32\", 5/16\", 7, 8, 8.5, 9, 10mm", "reamers": "-", "compatibility": "Large valve seats"},
    {"modelNo": "vscct25", "angles": "3 Angle Cut", "cutters": "25 cutters — 45°: 1\", 1-5/8\", 1-3/8\", 1-5/16\", 1-1/4\", 1-3/16\", 1-7/16\", 1-1/2\", 1-1/8\", 1-9/16\", 1-7/8\", 2\", 2-1/8\", 2-1/4\", 1-3/4\", 1-11/16\", 1-13/16\"; 30°: 1-3/8\", 1-7/8\", 1-13/16\"; 20° bore: 1-3/8\", 1-3/4\", 1-1/4\", 1-1/2\", 2\"", "pilots": "8 pilots — 7/16\", 11/32\", 5/16\", 7mm, 8mm, 8.5mm, 9 mm, 10mm", "reamers": "-", "compatibility": "Large engine valve seat applications"},
    {"modelNo": "vscct27", "angles": "3 Angle Cut", "cutters": "27 cutters — 30° & 45° each: 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 34mm; 70°: 23, 25, 28, 30, 32mm", "pilots": "6 pilots — 4.5, 5, 5.5, 6, 6.5, 7mm", "reamers": "6 HSS Reamers — 4.5, 5, 5.5, 6, 6.5, 7mm", "compatibility": "Predator Hemi, Non-Hemi and clone engines; 212 Predator applications"},
    {"modelNo": "vscctbriggs", "angles": "2 Angle Cut", "cutters": "3 cutters — 20° Bore: 7/8\" (22 mm); 45°: 7/8\" (22 mm), 1-3/16\" (30 mm)", "pilots": "1 Pilot — 1/4\"", "reamers": "1 HSS Reamer — 1/4\"", "compatibility": "Briggs & Stratton small gasoline engines"},
    {"modelNo": "vscctpred", "angles": "3 Angle Cut", "cutters": "5 cutters — 30°: 25, 32mm; 45°: 25, 32mm; 20° Bore: 27mm", "pilots": "2 pilots — 5, 5.5mm", "reamers": "2 hss reamer — 5, 5.5mm", "compatibility": "Predator Hemi, Non-Hemi and clone engines; Honda GCV/GC/GX 196/200 series"},
    {"modelNo": "vscctpeh", "angles": "3 Angle Cut", "cutters": "3 cutters — 30°: 45mm; 45°: 45mm; 70°: 45mm", "pilots": "1 Pilot — 5/16\"", "reamers": "1 reamer — 5/16\"", "compatibility": "Performance engine heads"},
    {"modelNo": "vscctcme", "angles": "2 Angle Cut", "cutters": "3 cutters — 45°: 1-7/16\", 1-1/4\"; 70°: 1-3/8\"", "pilots": "1 pilot — 7.14mm", "reamers": "1 hss reamer — 7.14mm", "compatibility": "Classic Mini engines"},
    {"modelNo": "vscctharley", "angles": "3 Angle Cut", "cutters": "6 cutters — 30°: 2.165\", 1.945\"; 45°: 2.165\", 1.945\"; 60°: 2\", 1.750\"", "pilots": "3 pilots — 3/8\", 11/32\", 5/16\"", "reamers": "3 hss reamer — 3/8\", 11/32\", 5/16\"", "compatibility": "Harley-Davidson EVO, Twin Cam and Shovelhead engines"}
]
products.append({
    "id": "prod-38-vscct",
    "indexNumber": 37,
    "modelNo": "Vscct",
    "slug": "vscct",
    "name": "Valve Seat Cutter with carbide tip",
    "category": "Valve Seat Cutting Tools",
    "categorySlug": "valve-seat-cutting-tools",
    "cataloguePage": 38,
    "tag": "bestseller",
    "description": get_multiline(b38, 'Product Description', ['Key Features', 'Applications', 'Customisation', 'COMPATIBILITY']),
    "keyFeatures": get_bullets(b38, 'Key Features'),
    "applications": get_bullets(b38, 'Applications'),
    "setIncludes": ["Carbide-tipped cutters", "Pilots / Guides", "High-speed steel reamers (model specific)", "Arbor rod and stem handle"],
    "sizesDetail": ["Available in 14 distinct specialized configurations for specific engine models (Predator, Harley, Briggs, Classic Mini, Bikes, ATVs, and large seats)."],
    "compatibility": "Small and large engine valve seats, Briggs & Stratton, Honda GX/GC/GCV, Predator 212, Classic Mini, Harley-Davidson EVO/Twin Cam/Shovelhead, and custom performance engine heads.",
    "itemSpecifics": {"Angle Specifications": "3 angle cut - 30°, 45°, 20° bore (varies by set)", "Material": "High-grade carbide-tipped construction"},
    "notes": "Custom sizes and configurations are available to meet specific engine and machining requirements.",
    "subModels": vscct_submodels,
    "corrections": [],
    "flags": ["Pages 38-40 consolidated into single rich product entry with 14 selectable sub-models"],
    "images": ["/images/placeholder-vscct.svg"],
    "isActive": True
})

# Page 41: vscs ( VsCHCS / VsCHSS)
p41 = raw_pages[41]
b41 = p41['body']
vscs_submodels = [
    {"modelHCS": "VsCHCS5", "modelHSS": "VsCHSS5", "cutters": "5 cutters — 20° bore: 1½\"; 45°: 1-5/16\", 1½\", 1⅝\", 1-7/16\"", "pilots": "2 pilots — 7/16\", 5/16\""},
    {"modelHCS": "VsCHCS10", "modelHSS": "VsCHSS10", "cutters": "10 cutters — 20° bore: 1¼\", 1½\"; 30°: 1¾\"; 45°: 1-3/16\", 1¼\", 1-5/16\", 1-7/16\", 1½\", 1⅝\", 1¾\"", "pilots": "8 pilots — 7mm, 8mm, 8.5mm, 9mm, 10mm, 5/16\", 7/16\", 11/32\""},
    {"modelHCS": "VsCHCS15", "modelHSS": "VsCHSS15", "cutters": "15 cutters — 20° bore: 1¼\", 1½\", 1¾\"; 30°: 1¾\", 1⅞\"; 45°: 1-3/16\", 1¼\", 1-5/16\", 1-7/16\", 1½\", 1⅝\", 1¾\", 1⅞\", 1⅜\", 2\"", "pilots": "8 pilots — 7mm, 8mm, 8.5mm, 9mm, 10mm, 5/16\", 7/16\", 11/32\""},
    {"modelHCS": "VsCHCS20", "modelHSS": "VsCHSS20", "cutters": "21 cutters — 20° bore: 2\", 1-3/4\", 1, 1/2\", 1-1/4\"; 30°: 1-3/4\", 1-7/8\"; 45°: 2 1/4, 2-1/8\", 2\", 1-7/8\", 1-3/4\", 1-5/8\", 1-9/16\", 1-1/2\", 1-7/16\", 1-3/8\", 1-5/16\", 1-1/4\", 1-3/16\", 1-1/8\", 1\"", "pilots": "8 pilots — 5/16\", 11/32\", 3/8\", 7/16\", 7mm, 8mm, 8.5mm, 9mm"},
    {"modelHCS": "VsCHCS24", "modelHSS": "VsCHSS24", "cutters": "24 cutters — 20° bore: 1¼\", 1½\", 1¾\", 2\"; 30°: 1¾\", 1⅞\"; 45°: 1-13/16\", 1-1/16\", 1-11/16\", 1\", 1⅛\", 1-3/16\", 1¼\", 1-5/16\", 1-7/16\", 1½\", 1⅝\", 1¾\", 1⅞\", 1⅜\", 1-9/16\", 2\", 2⅛\", 2¼\"", "pilots": "8 pilots — 7mm, 8mm, 8.5mm, 9mm, 10mm, 5/16\", 7/16\", 11/32\""}
]
products.append({
    "id": "prod-41-vscs",
    "indexNumber": 38,
    "modelNo": "vscs (VsCHCS / VsCHSS)",
    "slug": "vscs",
    "name": "Valve seat cutter set for car & bike engines",
    "category": "Valve Seat Cutting Tools",
    "categorySlug": "valve-seat-cutting-tools",
    "cataloguePage": 41,
    "tag": "bestseller",
    "description": get_multiline(b41, 'Product Description', ['Key Features', 'Applications', 'Note', 'Available sizes']),
    "keyFeatures": get_bullets(b41, 'Key Features'),
    "applications": get_bullets(b41, 'Applications'),
    "setIncludes": ["Double-sided face cutters", "Pilots / Guides", "Arbor rods", "Stem handles"],
    "sizesDetail": ["Available in 5, 10, 15, 21, and 24 cutter configurations in both High Carbon Steel (HCS) and High Speed Steel (HSS)."],
    "compatibility": "Car and motorcycle engine valve seat repair, vintage engines, and general automotive repair.",
    "itemSpecifics": {"Material Options": "High Carbon Steel (HCS) and High Speed Steel (HSS)", "Cutters": "Double-sided face cutters"},
    "notes": "These are not advised for cutting hardened valve seats. For hardened seats, choose our carbide tip valve seat cutter (Vscct).",
    "subModels": vscs_submodels,
    "corrections": [],
    "flags": ["VsCHCS20/VsCHSS20 model name has '20' but contains 21 cutters as printed in catalogue"],
    "images": ["/images/placeholder-vscs.svg"],
    "isActive": True
})

# Category 4: Kingpin Reaming Tools (Pages 42-43)
# Page 42: Lphr
p42 = raw_pages[42]
b42 = p42['body']
lphr_submodels = [
    {"modelNo": "lphr4", "size": "H4", "inchRange": "15/32\" - 17/32\"", "metricRange": "11.9 - 13.5 mm"},
    {"modelNo": "lphr5", "size": "H5", "inchRange": "17/32\" - 19/32\"", "metricRange": "13.5 - 15 mm"},
    {"modelNo": "lphr6", "size": "H6", "inchRange": "19/32\" - 21/32\"", "metricRange": "15 - 16.6 mm"},
    {"modelNo": "lphr7", "size": "H7", "inchRange": "21/32\" - 23/32\"", "metricRange": "16.6 - 18.2 mm"},
    {"modelNo": "lphr8", "size": "H8", "inchRange": "23/32\" - 25/32\"", "metricRange": "18.2 - 19.8 mm"},
    {"modelNo": "lphr9", "size": "H9", "inchRange": "25/32\" - 27/32\"", "metricRange": "19.8 - 21.4 mm"},
    {"modelNo": "lphr10", "size": "H10", "inchRange": "27/32\" - 15/16\"", "metricRange": "21.4 - 23.8 mm"},
    {"modelNo": "lphr11", "size": "H11", "inchRange": "15/16\" - 1 1/16\"", "metricRange": "23.8 - 26.98 mm"},
    {"modelNo": "lphr12", "size": "H12", "inchRange": "1 1/16\" – 1 3/16\"", "metricRange": "26.9 - 30.16 mm"},
    {"modelNo": "lphr13", "size": "H13", "inchRange": "1 3/16\" – 1 11/32\"", "metricRange": "30.16 - 34.1 mm"},
    {"modelNo": "lphr14", "size": "H14", "inchRange": "1 11/32\" – 1 1/2\"", "metricRange": "34.1 - 38.1 mm"},
    {"modelNo": "lphr15", "size": "H15", "inchRange": "1 1/2\" – 1 13/16\"", "metricRange": "38.1 - 46 mm"},
    {"modelNo": "lphr15+", "size": "H15+", "inchRange": "1.57\" - 1.88\"", "metricRange": "40 - 48 mm"},
    {"modelNo": "lphr16", "size": "H16", "inchRange": "1 13/16\" – 2 7/32\"", "metricRange": "46 - 56.35 mm"},
    {"modelNo": "lphr17", "size": "H17", "inchRange": "2 7/32\" – 2 3/4\"", "metricRange": "56 - 70 mm"}
]
products.append({
    "id": "prod-42-lphr",
    "indexNumber": 39,
    "modelNo": "Lphr",
    "slug": "lphr",
    "name": "HSS long pilot adjustable hand reamer",
    "category": "Kingpin Reaming Tools",
    "categorySlug": "kingpin-reaming-tools",
    "cataloguePage": 42,
    "tag": "bestseller",
    "description": get_multiline(b42, 'Product Description', ['Key Features', 'Applications', 'Sizes Available']),
    "keyFeatures": get_bullets(b42, 'Key Features'),
    "applications": get_bullets(b42, 'Applications'),
    "setIncludes": [],
    "sizesDetail": ["Available in 15 sizes from H4 to H17 (including H15+), covering 11.9 mm to 70 mm (15/32\" to 2 3/4\")."],
    "compatibility": "Kingpin fitting and repair, line reaming of two bushings, precision bushing alignment.",
    "itemSpecifics": {"Blades": "Six high-speed steel (HSS) blades", "Body": "Solid one-piece body with long pilot and floating pilot sleeve", "Size Range": "H4 to H17 (11.9 mm to 70 mm)"},
    "notes": "Features floating pilot sleeve for improved alignment during line reaming.",
    "subModels": lphr_submodels,
    "corrections": [],
    "flags": [],
    "images": ["/images/placeholder-lphr.svg"],
    "isActive": True
})

# Page 43: Ahrep
p43 = raw_pages[43]
b43 = p43['body']
ahrep_submodels = [
    {"modelNo": "ahrep12", "size": "H12", "inchRange": "1 11/16\"–1 3/16\"", "metricRange": "26.9-30.16mm", "flag": "Catalogue prints '1 11/16\"–1 3/16\"'; likely '1 1/16\"–1 3/16\"' pending owner confirmation"},
    {"modelNo": "ahrep13", "size": "H13", "inchRange": "1 3/16″–1 11/32″", "metricRange": "30.16–34.1mm"},
    {"modelNo": "ahrep14", "size": "H14", "inchRange": "1 11/32\"–1 1/2″", "metricRange": "34.1–38.1mm"},
    {"modelNo": "ahrep15", "size": "H15", "inchRange": "1 1/2″–1 13/16″", "metricRange": "38.1–46mm"},
    {"modelNo": "ahrep16", "size": "H16", "inchRange": "1 13/16″–2 7/32″", "metricRange": "46–56.35mm"},
    {"modelNo": "Ahrep17", "size": "H17", "inchRange": "2 7/32″–2 3/4″", "metricRange": "56–70mm"}
]
products.append({
    "id": "prod-43-ahrep",
    "indexNumber": 40,
    "modelNo": "Ahrep",
    "slug": "ahrep",
    "name": "Adjustable hand reamer with extension pilot",
    "category": "Kingpin Reaming Tools",
    "categorySlug": "kingpin-reaming-tools",
    "cataloguePage": 43,
    "tag": "bestseller",
    "description": get_multiline(b43, 'Product Description', ['Key Features', 'Applications', 'Sizes Available']),
    "keyFeatures": get_bullets(b43, 'Key Features'),
    "applications": get_bullets(b43, 'Applications'),
    "setIncludes": [],
    "sizesDetail": ["Available in six sizes, H12–H17, covering 26.9 mm to 70 mm (1 1/16\" to 2 3/4\")."],
    "compatibility": "Kingpin fitting and repair, line reaming of two bushings, precision bushing reaming.",
    "itemSpecifics": {"Blades": "High-speed steel (HSS) blades", "Design": "Adjustable expanding with extension pilot", "Sizes": "H12 to H17 (26.9mm to 70mm)"},
    "notes": "Extension pilot supports accurate alignment during through-hole and two-bushing reaming.",
    "subModels": ahrep_submodels,
    "corrections": [],
    "flags": ["Ahrep12 inch range printed as '1 11/16\"–1 3/16\"' in catalogue; pending owner confirmation"],
    "images": ["/images/placeholder-ahrep.svg"],
    "isActive": True
})

# Save products and categories
os.makedirs('server/data', exist_ok=True)
with open('server/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

with open('server/data/categories.json', 'w', encoding='utf-8') as f:
    json.dump(categories, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(products)} products across {len(categories)} categories.")
print("Files saved to server/data/products.json and server/data/categories.json.")
