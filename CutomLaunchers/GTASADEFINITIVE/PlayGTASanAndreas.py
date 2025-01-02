import os
import subprocess
import sys

try:
    os.chdir("Gameface")
    os.chdir("Binaries")
    os.chdir("Win64")
    subprocess.run("SanAndreas.exe", check=True)
except Exception as error:
    print(f"An error occurred: {error}")
finally:
    sys.exit()
