import os
import zipfile
import requests
from tqdm import tqdm
from colorama import init, Fore

# Initialize colorama
init(autoreset=True)

# URL of the ZIP file to download
url = "https://github.com/onajlikezz/rdr2host/releases/download/hyperhost-gtasadefinitive/GTASADEFINITIVEFIX.zip"

# Define the name of the zip file
zip_filename = "GTASADEFINITIVEFIX.zip"

# ASCII Art formatted with \n and invisible characters
ascii_art = (
    "  _                            _     _           _       \n"
    " | |                          | |   | |         | |      \n"
    " | |     __ _ _   _ _ __   ___| |__ | |__  _   _| |_ ___ \n"
    " | |    / _` | | | | '_ \\ / __| '_ \\| '_ \\| | | | __/ _ \\\n"
    " | |___| (_| | |_| | | | | (__| | | | |_) | |_| | ||  __/\n"
    " |______\\__,_|\\__,_|_| |_|\\___|_| |_|_.__/ \\__, |\\__\\___| \n"
    "                                            __/ |        \n"
    "                                           |___/          \n"
)

# Function to download and extract the ZIP file
def download_and_extract_zip(url, zip_filename):
    print(Fore.CYAN + ascii_art)
    print(Fore.YELLOW + "Downloading ZIP file... Please wait.")
    
    try:
        # Send a GET request to the URL with streaming enabled
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('Content-Length'))

        # Open the zip file for writing and initialize the progress bar
        with open(zip_filename, 'wb') as f, tqdm(
                desc=zip_filename,
                total=total_size,
                unit='B', unit_scale=True, ncols=100, ascii=True) as bar:
            
            # Download the file in chunks and write to disk
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    bar.update(len(chunk))

        print(Fore.GREEN + f"Download complete: {zip_filename}")
    
    except Exception as e:
        print(Fore.RED + f"Error downloading the file: {e}")
        return

    print(Fore.YELLOW + f"Extracting {zip_filename}...")

    # Extract the ZIP file
    try:
        with zipfile.ZipFile(zip_filename, 'r') as zip_ref:
            zip_ref.extractall()
        print(Fore.GREEN + "Extraction complete.")
    except Exception as e:
        print(Fore.RED + f"Error extracting the file: {e}")

if __name__ == "__main__":
    download_and_extract_zip(url, zip_filename)
