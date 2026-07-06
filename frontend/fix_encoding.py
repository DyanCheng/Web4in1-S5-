import codecs
import sys

def fix_file(path):
    with codecs.open(path, 'r', 'utf-8') as f:
        text = f.read()
    
    try:
        # Encode back to original bytes using cp1252 (Windows-1252)
        raw_bytes = text.encode('cp1252')
        # Decode the bytes as proper utf-8
        fixed_text = raw_bytes.decode('utf-8')
        
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(fixed_text)
        print("Success for", path)
    except Exception as e:
        print("Failed for", path, e)

fix_file('src/app/hotel/page.tsx')
