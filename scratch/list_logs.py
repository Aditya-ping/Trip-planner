import os

root = r"C:\Users\adity\.gemini\antigravity-ide"
print("Scanning root:", root)
for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if f.endswith(".log"):
            print(os.path.join(dirpath, f))
