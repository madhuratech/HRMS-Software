import subprocess

orig_content = subprocess.check_output(['git', 'show', 'HEAD:mobile/src/screens/attendance/AttendanceScreen.jsx'], text=True, encoding='utf-8')
orig_lines = orig_content.splitlines(True)

restore_idx = next(i for i, line in enumerate(orig_lines) if 'keyExtractor={(item, idx)' in line)

with open(r'c:\Users\arune\OneDrive\Documents\GitHub\HRMS-Software\mobile\src\screens\attendance\AttendanceScreen.jsx', 'r', encoding='utf-8') as f:
    mod_lines = f.readlines()

corr_idx = next(i for i, line in enumerate(mod_lines) if 'mapContainer: {' in line)

restored_part = orig_lines[restore_idx:]
style_end_idx = len(restored_part) - 1
for i in range(len(restored_part)-1, -1, -1):
    if restored_part[i].strip() == '});':
        style_end_idx = i
        break

restored_part.insert(style_end_idx, "  mapContainer: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, backgroundColor: '#FFF' },\n  mapView: { width: '100%', height: 180, borderRadius: 12 },\n")

new_content = ''.join(mod_lines[:corr_idx]) + ''.join(restored_part)

with open(r'c:\Users\arune\OneDrive\Documents\GitHub\HRMS-Software\mobile\src\screens\attendance\AttendanceScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
