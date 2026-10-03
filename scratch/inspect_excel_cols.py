import zipfile, xml.etree.ElementTree as ET

z = zipfile.ZipFile('data/Analisis plantas Logisticas act..xlsx')
sst_xml = ET.fromstring(z.read('xl/sharedStrings.xml'))
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
shared_strings = []
for si in sst_xml.findall('s:si', ns):
    t = si.find('s:t', ns)
    if t is not None:
        shared_strings.append(t.text or '')
    else:
        texts = [r.find('s:t', ns).text for r in si.findall('s:r', ns) if r.find('s:t', ns) is not None and r.find('s:t', ns).text]
        shared_strings.append(''.join(texts))

# Read workbook rels
rels_xml = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
r_ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
rel_map = {r.attrib['Id']: r.attrib['Target'] for r in rels_xml.findall('.//r:Relationship', r_ns)}

wb_xml = ET.fromstring(z.read('xl/workbook.xml'))
for sheet in wb_xml.findall('.//s:sheet', ns):
    s_name = sheet.attrib['name']
    rid = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
    target = rel_map.get(rid, '')
    print(f"\n==========================================")
    print(f"SHEET NAME: '{s_name}' (Target: {target})")
    print(f"==========================================")
    sheet_data = z.read(f"xl/{target}")
    root = ET.fromstring(sheet_data)
    for r_idx in [1, 2, 3]:
        row_elem = root.find(f".//s:row[@r='{r_idx}']", ns)
        if row_elem is not None:
            cols = {}
            for c in row_elem.findall('s:c', ns):
                ref = c.attrib.get('r')
                col = ''.join([ch for ch in ref if ch.isalpha()])
                t = c.attrib.get('t')
                v = c.find('s:v', ns)
                val = v.text if v is not None else ''
                if t == 's' and val != '': val = shared_strings[int(val)]
                cols[col] = val
            print(f"Row {r_idx}: {cols}")
