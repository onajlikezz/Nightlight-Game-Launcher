import subprocess
import os

current_directory = os.getcwd()
launcher_path = os.path.join(current_directory, "Launcher.exe")

if os.path.isfile(launcher_path):
    subprocess.Popen(launcher_path)
else:
    print(f"ERROR, Join Discord for help.")
