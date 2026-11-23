#!/usr/bin/env python3
"""
PRAZTECH Product Image Importer
Scans a folder of user-provided product photographs, matches them against the 41 catalogue products
(via SKU, slug, product name, catalogue page, or submodel variants), copies all photos into
client/public/images/products/, and updates products.json in both client and server with multi-image arrays.
"""

import os
import sys
import json
import shutil
import re

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_PRODUCTS_JSON = os.path.join(WORKSPACE_ROOT, 'client', 'src', 'data', 'products.json')
SERVER_PRODUCTS_JSON = os.path.join(WORKSPACE_ROOT, 'server', 'data', 'products.json')
TARGET_IMG_DIR = os.path.join(WORKSPACE_ROOT, 'client', 'public', 'images', 'products')

def normalize(s):
    return re.sub(r'[^a-z0-9]', '', str(s).lower())

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def import_images(source_folder):
    if not os.path.exists(source_folder):
        print(f"❌ Error: Folder not found: {source_folder}")
        return

    os.makedirs(TARGET_IMG_DIR, exist_ok=True)
    
    with open(SERVER_PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        products = json.load(f)
        
    supported_exts = ('.jpg', '.jpeg', '.png', '.webp')
    files = [f for f in os.listdir(source_folder) if f.lower().endswith(supported_exts)]
    
    if not files:
        print(f"⚠️ No image files found in {source_folder}")
        return
        
    print(f"🔍 Found {len(files)} image files. Matching with {len(products)} catalogue products...\n")

    # Index submodels across all products (longest SKU first to avoid prefix collisions, e.g. VSCCT21B vs VSCCT21)
    all_sms = []
    for p in products:
        for sm in p.get('subModels', []):
            sm_sku = sm.get('modelNo') or ''
            norm_sm = normalize(sm_sku)
            if norm_sm:
                all_sms.append((len(norm_sm), norm_sm, p, sm))
    all_sms.sort(key=lambda x: x[0], reverse=True)

    # Group matched files per product
    product_files = {p['id']: {'main': [], 'submodels': {}} for p in products}
    unmatched_files = []

    for filename in sorted(files):
        base = os.path.splitext(filename)[0]
        norm_base = normalize(base)

        # 1. Check Submodel match
        matched_p = None
        matched_sm = None
        for _, norm_sm, p, sm in all_sms:
            if norm_base == norm_sm or norm_base.startswith(norm_sm):
                matched_p = p
                matched_sm = sm
                break

        if matched_p and matched_sm:
            sm_code = matched_sm.get('modelNo')
            product_files[matched_p['id']]['submodels'].setdefault(sm_code, []).append(filename)
            continue

        # 2. Check Catalogue Page number (e.g. page-1.jpg, pg1.png, 1.jpg)
        page_match = re.match(r'^(?:page|pg)?[-_]?(\d+)$', base, re.IGNORECASE)
        if page_match:
            page_num = int(page_match.group(1))
            for p in products:
                if p.get('cataloguePage') == page_num:
                    matched_p = p
                    break

        # 3. Clean trailing digits/suffixes (e.g. "AHREP- 1" -> "AHREP", "PHR-HSS- 2" -> "PHR-HSS")
        if not matched_p:
            base_clean = re.sub(r'[-_\s]+\d+$', '', base).strip()
            norm_clean = normalize(base_clean)
            for p in products:
                if normalize(p.get('modelNo')) == norm_clean or normalize(p.get('slug')) == norm_clean:
                    matched_p = p
                    break

        # 4. Check exact SKU / Model Number or slug
        if not matched_p:
            for p in products:
                if normalize(p.get('modelNo')) == norm_base or normalize(p.get('slug')) == norm_base:
                    matched_p = p
                    break

        # 5. Check product title / name
        if not matched_p:
            for p in products:
                if normalize(p.get('name')) == norm_clean or normalize(p.get('name')) == norm_base:
                    matched_p = p
                    break

        # 6. Fuzzy substring match on SKU or slug
        if not matched_p:
            for p in products:
                norm_sku = normalize(p.get('modelNo'))
                if len(norm_sku) >= 4 and (norm_clean.startswith(norm_sku) or norm_sku.startswith(norm_clean)):
                    matched_p = p
                    break

        if matched_p:
            product_files[matched_p['id']]['main'].append(filename)
        else:
            unmatched_files.append(filename)

    # Process and copy files for all products
    total_copied = 0
    updated_products = []

    for p in products:
        pdata = product_files[p['id']]
        slug = p['slug']
        main_files = sorted(pdata['main'], key=natural_sort_key)
        
        product_images = []

        # Process main product photos
        for idx, fn in enumerate(main_files):
            src_path = os.path.join(source_folder, fn)
            ext = os.path.splitext(fn)[1].lower()
            
            # First file is primary slug.ext, subsequent are slug-2.ext, slug-3.ext
            if idx == 0:
                dest_fn = f"{slug}{ext}"
                dest_path = os.path.join(TARGET_IMG_DIR, dest_fn)
                shutil.copy2(src_path, dest_path)
                # Also save slug-1.ext alias
                alias_path = os.path.join(TARGET_IMG_DIR, f"{slug}-1{ext}")
                shutil.copy2(src_path, alias_path)
            else:
                dest_fn = f"{slug}-{idx + 1}{ext}"
                dest_path = os.path.join(TARGET_IMG_DIR, dest_fn)
                shutil.copy2(src_path, dest_path)

            web_path = f"/images/products/{dest_fn}"
            if web_path not in product_images:
                product_images.append(web_path)
            total_copied += 1

        # Process submodel photos
        for sm in p.get('subModels', []):
            sm_code = sm.get('modelNo') or ''
            norm_sm = normalize(sm_code)
            sm_f_list = sorted(pdata['submodels'].get(sm_code, []), key=natural_sort_key)
            
            if sm_f_list:
                sm_images = []
                for s_idx, s_fn in enumerate(sm_f_list):
                    src_path = os.path.join(source_folder, s_fn)
                    ext = os.path.splitext(s_fn)[1].lower()
                    
                    if len(sm_f_list) == 1:
                        s_dest = f"{slug}-{norm_sm}{ext}"
                    else:
                        s_dest = f"{slug}-{norm_sm}-{s_idx + 1}{ext}" if s_idx > 0 else f"{slug}-{norm_sm}{ext}"
                    
                    dest_path = os.path.join(TARGET_IMG_DIR, s_dest)
                    shutil.copy2(src_path, dest_path)

                    # Also copy SKU alias e.g. vscct3.jpg for direct lookup
                    if s_idx == 0 and norm_sm:
                        alias_path = os.path.join(TARGET_IMG_DIR, f"{norm_sm}{ext}")
                        shutil.copy2(src_path, alias_path)

                    web_path = f"/images/products/{s_dest}"
                    sm_images.append(web_path)
                    if web_path not in product_images:
                        product_images.append(web_path)
                    total_copied += 1

                sm['image'] = sm_images[0]
                if len(sm_images) > 1:
                    sm['images'] = sm_images

        # Update images array
        if product_images:
            p['images'] = product_images
            print(f"✅ {p['modelNo']} ({slug}) -> {len(product_images)} photos linked (Main: {len(main_files)}, Variants: {len(product_images) - len(main_files)})")
        else:
            print(f"ℹ️ {p['modelNo']} ({slug}) -> No photos provided, keeping existing/placeholder")

        updated_products.append(p)

    # Sort products by original indexNumber
    updated_products.sort(key=lambda x: x.get('indexNumber', 0))

    # Save to server products.json
    with open(SERVER_PRODUCTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(updated_products, f, indent=2)

    # Save to client products.json
    with open(CLIENT_PRODUCTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(updated_products, f, indent=2)

    print(f"\n==========================================")
    print(f"🎉 Successfully imported {total_copied} photo instances!")
    print(f"📦 All {len(updated_products)} products updated in client & server products.json")
    if unmatched_files:
        print(f"⚠️ Unmatched files ({len(unmatched_files)}): {unmatched_files}")
    else:
        print(f"✨ 100% of all image files matched successfully!")
    print(f"==========================================\n")

if __name__ == '__main__':
    default_folder = os.path.join(WORKSPACE_ROOT, 'product_images')
    folder = sys.argv[1] if len(sys.argv) > 1 else default_folder
    print(f"Scanning directory: {folder}")
    import_images(folder)
