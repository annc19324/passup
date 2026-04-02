import zipfile
import xml.etree.ElementTree as ET
import os
import sys

# Ensure stdout is utf-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def read_docx(file_path):
    # Extract the word/document.xml from the docx file
    with zipfile.ZipFile(file_path, 'r') as zf:
        content = zf.read('word/document.xml')
        
    # Namespace for docx
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    # Parse the XML
    root = ET.fromstring(content)
    
    # Extract text from the body
    text = []
    for p in root.findall('.//w:p', ns):
        p_text = ""
        for r in p.findall('.//w:r', ns):
            t = r.find('.//w:t', ns)
            if t is not None and t.text:
                p_text += t.text
        if p_text:
            text.append(p_text)
            
    return "\n".join(text)

files = [
    r'd:\demo\PassUp\baocao\DamQuocHuy_HTTTTH.docx'
]

with open('extracted_content.txt', 'w', encoding='utf-8') as outfile:
    for f in files:
        outfile.write(f"--- CONTENT OF {os.path.basename(f)} ---\n")
        try:
            outfile.write(read_docx(f) + "\n")
        except Exception as e:
            outfile.write(f"Error reading {f}: {e}\n")
        outfile.write("\n" + "="*50 + "\n")

