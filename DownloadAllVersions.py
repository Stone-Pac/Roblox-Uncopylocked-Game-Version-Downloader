import requests
import zipfile
import io
import time

while True:
    game_id = input("Enter the Roblox game ID: ")
    game_name = input("Enter the game name: ")
    latest_version = input("Enter the latest version you want to download: ")

    # use the game name as the prefix for the downloaded files
    url = f"https://assetdelivery.roblox.com/v1/asset?id={game_id}&version="
    zip_filename = f"{game_name}.zip"
    with zipfile.ZipFile(zip_filename, mode='w') as zip_file:
        for version in range(1, int(latest_version) + 1):
            print(f"Downloading version {version}...")
            url_with_version = url + str(version)
            start_time = time.time()
            response = requests.get(url_with_version)
            end_time = time.time()
            if response.status_code == 200:
                file_bytes = io.BytesIO(response.content).getbuffer()
                filename = f"{game_name}_{version}.rbxlx"
                zip_file.writestr(filename, file_bytes)
                file_size = len(response.content) / 1024 / 1024  # convert to MB
                download_time = end_time - start_time
                print(f"Downloaded {filename} ({file_size:.2f} MB) in {download_time:.2f} seconds.")
            else:
                print(f"Error: Unable to download version {version}")
        print(f"All versions downloaded and saved to {zip_filename}")

    # ask the user if they want to download another game
    another_game = input("Do you want to download another game? (y/n) ")
    if another_game.lower() != 'y':
        break
