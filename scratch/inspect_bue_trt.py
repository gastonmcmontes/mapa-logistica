import zipfile
import xml.etree.ElementTree as ET
import json

path = 'data/datos bue y trt.xlsx'
z = zipfile.ZipFile(path)

# Shared strings
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

# Workbook sheets
wb_xml = ET.fromstring(z.read('xl/workbook.xml'))
sheets = []
for s in wb_xml.findall('.//s:sheet', ns):
    sheets.append((s.attrib.get('name'), s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')))

print("Sheets:", sheets)

# Read sheets
rels_xml = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
rel_map = {r.attrib.get('Id'): r.attrib.get('Target') for r in rels_xml}

for name, rId in sheets:
    target = rel_map[rId]
    if not target.startswith('xl/'):
        target = 'xl/' + target
    sheet_root = ET.fromstring(z.read(target))
    print(f"\n--- Sheet: {name} ({target}) ---")
    rows = []
    for r in sheet_root.findall('.//s:row', ns):
        r_num = int(r.attrib.get('r', 0))
        cells = {}
        for c in r.findall('s:c', ns):
            ref = c.attrib.get('r')
            col = ''.join([ch for ch in ref if ch.isalpha()])
            t = c.attrib.get('t')
            v = c.find('s:v', ns)
            val = v.text if v is not None else ''
            if t == 's' and val:
                val = shared_strings[int(val)]
            cells[col] = val
        rows.append((r_num, cells))
    print(f"Total rows: {len(rows)}")
    for r_num, cells in rows[:15]:
        print(f"R{r_num}: {cells}")
