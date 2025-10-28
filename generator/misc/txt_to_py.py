"""
Converts the 100k-most-used-passwords-NCSC.txt file into a Python list.
"""

txt = 'generator/misc/100k-most-used-passwords-NCSC.txt'
py = 'generator/misc/common_passwords.py'

# Read txt file
with open(txt, 'r') as f:
    passwords = f.read().splitlines()

# Write passwords to py file as a set
with open(py, "w") as f:
    f.write("COMMON_PASSWORDS = {\n")
    for line in passwords:
        f.write(f'    "{line}",\n')
    f.write("}\n")
