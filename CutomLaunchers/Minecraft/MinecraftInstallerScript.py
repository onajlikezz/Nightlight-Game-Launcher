import os
import requests
from tqdm import tqdm
from colorama import init, Fore
import subprocess

# Initialize colorama
init(autoreset=True)

# URL of the additional file to install
install_url = "http://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/files/7cea7df9-8769-48db-8dcc-5bcc5831e7c0?P1=1735870936&P2=404&P3=2&P4=Mlz0nPmvkO9OTAp7J6zpUt9jdTUuobADLIG9%2bHo5aKLnTFB4JSEPGK7wx8vF3som8GGexaimHB8vOG3eSsfJrQ%3d%3d"
install_filename = "Microsoft.MinecraftUWP_1.21.5101.0_x64__8wekyb3d8bbwe.appx"

# ASCII Art formatted with \n and invisible characters
ascii_art = (
    "  _                            _     _           _       \n"
    " | |                          | |   | |         | |      \n"
    " | |     __ _ _   _ _ __   ___| |__ | |__  _   _| |_ ___ \n"
    " | |    / _` | | | | '_ \\ / __| '_ \\| '_ \\| | | | __/ _ \\\n"
    " | |___| (_| | |_| | | | | (__| | | | |_) | |_| | ||  __/\n"
    " |______\\__,_|\\__,_|_| |_|\\___|_| |_|_.__/ \\\__, |\\__\\___| \n"
    "                                            __/ |        \n"
    "                                           |___/          \n"
)

def download_file(url, filename):
    """Download a file from the specified URL and save it with the given filename."""
    print(Fore.YELLOW + f"Downloading {filename}... Please wait.")

    try:
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('Content-Length', 0))

        with open(filename, 'wb') as f, tqdm(
                desc=filename,
                total=total_size,
                unit='B', unit_scale=True, ncols=100, ascii=True) as bar:

            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    bar.update(len(chunk))

        print(Fore.GREEN + f"Download complete: {filename}")
    except Exception as e:
        print(Fore.RED + f"Error downloading the file: {e}")
        return False

    return True

def download_and_install(url, filename, install_path):
    """Download and install a file, then open it."""
    # Download the file
    if not download_file(url, filename):
        return

    # Move the file to the Desktop
    desktop_path = os.path.join(os.path.expanduser("~"), "Desktop", filename)
    try:
        os.rename(filename, desktop_path)
        print(Fore.GREEN + f"Moved {filename} to {desktop_path}")
    except Exception as e:
        print(Fore.RED + f"Error moving the file: {e}")
        return

    # Open the installer
    print(Fore.YELLOW + f"Opening {desktop_path}...")
    try:
        subprocess.Popen([desktop_path], shell=True)
        print(Fore.GREEN + f"Successfully opened {desktop_path}")
    except Exception as e:
        print(Fore.RED + f"Error opening the file: {e}")

if __name__ == "__main__":
    print(Fore.CYAN + ascii_art)

    # Download and install the additional installer
    download_and_install(install_url, install_filename, os.path.join(os.path.expanduser("~"), "Desktop"))
