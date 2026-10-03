import zipfile
import xml.etree.ElementTree as ET
import json

path = 'data/datos bue y trt.xlsx'
z = zipfile.ZipFile(path)

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

root = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
rows = []
for r in root.findall('.//s:row', ns):
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

headers = rows[1][1]
print("Headers:", headers)
data_rows = []
for r_num, c in rows[2:]:
    if c.get('A'):
        data_rows.append(c)

print(f"\nTotal plantas in Sheet 1: {len(data_rows)}")
for d in data_rows:
    print(f"{d.get('B')}: {d.get('A')} | Reg: {d.get('C')} | M2: {d.get('D')} | Dot: {d.get('E')} | VolMens: {d.get('F')} | PromDia: {d.get('G')} | ImpoDia: {d.get('I')} | UMDia: {d.get('K')} | FV: {d.get('L')} | SLA: {d.get('M')}")
