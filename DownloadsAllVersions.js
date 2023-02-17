const fetch = require('node-fetch');
const JSZip = require('jszip');
const { saveAs } = require('file-saver');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

async function downloadGame() {
  const game_id = await getInput('Enter the Roblox game ID: ');
  const latest_version = await getInput('Enter the latest version you want to download: ');

  // retrieve the game name using the Roblox API
  const url = `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${game_id}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    const game_name = data.data[0].name;

    // use the game name as the prefix for the downloaded files
    const url_with_id = `https://assetdelivery.roblox.com/v1/asset?id=${game_id}&version=`;
    const zip_filename = `${game_name}.zip`;
    const zip = new JSZip();
    for (let version = 1; version <= latest_version; version++) {
      console.log(`Downloading version ${version}...`);
      const url_with_version = url_with_id + version;
      const start_time = Date.now();
      const response = await fetch(url_with_version);
      const end_time = Date.now();
      if (response.ok) {
        const buffer = await response.buffer();
        const filename = `${game_name}_${version}.rbxlx`;
        zip.file(filename, buffer);
        const file_size = buffer.byteLength / 1024 / 1024; // convert to MB
        const download_time = (end_time - start_time) / 1000;
        console.log(`Downloaded ${filename} (${file_size.toFixed(2)} MB) in ${download_time.toFixed(2)} seconds.`);
      } else {
        console.log(`Error: Unable to download version ${version}`);
      }
    }
    zip.generateAsync({ type: "blob" })
      .then(blob => {
        saveAs(blob, zip_filename);
        console.log(`All versions downloaded and saved to ${zip_filename}`);
      })
      .catch(error => console.log(`Error: Unable to generate ZIP file: ${error}`));
  } else {
    console.log(`Error: Unable to retrieve game name for game ID ${game_id}`);
  }

  // ask the user if they want to download another game
  const answer = await getInput('Do you want to download another game? (y/n) ');
  if (answer.toLowerCase() === 'y') {
    downloadGame();
  } else {
    process.exit();
  }
}

function getInput(question) {
  return new Promise(resolve => {
    readline.question(question, answer => {
      resolve(answer);
    });
  });
}

downloadGame();
