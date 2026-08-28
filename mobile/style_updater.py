import os
import glob
import re

# Web UI Palette Mapping
COLOR_MAP = {
    # Borders
    r"(?i)'#F1F5F9'": "'#E5E7EB'",
    r"(?i)\"#F1F5F9\"": "'#E5E7EB'",
    # Primary Texts and Shadows
    r"(?i)'#0F172A'": "'#111827'",
    r"(?i)\"#0F172A\"": "'#111827'",
    # Subtitles and Icons
    r"(?i)'#64748B'": "'#6B7280'",
    r"(?i)\"#64748B\"": "'#6B7280'",
    # Primary Brands (Buttons/Accents)
    r"(?i)'#4F46E5'": "'#2563EB'",
    r"(?i)\"#4F46E5\"": "'#2563EB'",
    r"(?i)'#4338CA'": "'#2563EB'",
    r"(?i)\"#4338CA\"": "'#2563EB'",
    # Primary Brands Light (Borders)
    r"(?i)'#C7D2FE'": "'#BFDBFE'",
    r"(?i)\"#C7D2FE\"": "'#BFDBFE'",
    # Primary Brands Lightest (Backgrounds)
    r"(?i)'#EEF2FF'": "'#EFF6FF'",
    r"(?i)\"#EEF2FF\"": "'#EFF6FF'",
    # Fix short white to full white for consistency
    r"(?i)'#FFF'": "'#FFFFFF'",
    r"(?i)\"#FFF\"": "'#FFFFFF'",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    for old_color, new_color in COLOR_MAP.items():
        content = re.sub(old_color, new_color, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(filepath)}")
        return True
    return False

def main():
    search_path = r"c:\Users\arune\OneDrive\Documents\GitHub\HRMS-Software\mobile\src\screens\**\*.jsx"
    files = glob.glob(search_path, recursive=True)
    
    updated_count = 0
    for file in files:
        if process_file(file):
            updated_count += 1
            
    print(f"\nSuccessfully updated {updated_count} files to match the Web UI design!")

if __name__ == "__main__":
    main()
