const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios");

// Main code
async function main() {
  const data = require("./output.json");

  // Fetch and save hero pictures for each fighter
  for (let i = 0; i < data.fighters.length; i++) {
    const fighter = data.fighters[i];
    const formattedFighter1Name = formatFighterName(fighter.fighter1);
    const formattedFighter2Name = formatFighterName(fighter.fighter2);

    const fighter1HeroUrl = await fetchHeroPicture(formattedFighter1Name);
    const fighter2HeroUrl = await fetchHeroPicture(formattedFighter2Name);

    fighter.heroUrl1 = fighter1HeroUrl;
    fighter.heroUrl2 = fighter2HeroUrl;

    if (fighter1HeroUrl) {
      await downloadImage(
        fighter1HeroUrl,
        `assets/${formattedFighter1Name}_hero.jpg`
      );
    }
    if (fighter2HeroUrl) {
      await downloadImage(
        fighter2HeroUrl,
        `assets/${formattedFighter2Name}_hero.jpg`
      );
    }
  }

  const updatedJsonData = JSON.stringify(data, null, 2);
  fs.writeFile("output.json", updatedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing updated JSON file:", err);
      return;
    }
    console.log("Updated data saved to output.json");
  });
}

// Function to format the fighter name for the URL
function formatFighterName(fighterName) {
  return fighterName.toLowerCase().replace(/\s/g, "-");
}

// Function to fetch hero picture URL for a fighter
async function fetchHeroPicture(fighterName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const fighterUrl = `https://www.ufc.com/athlete/${encodeURIComponent(
    fighterName
  )}`;
  await page.goto(fighterUrl);

  const imageSrc = await page.evaluate(() => {
    const imageElement = document.querySelector("img.hero-profile__image");
    return imageElement ? imageElement.src : null;
  });

  await browser.close();

  return imageSrc;
}

// Function to download an image
async function downloadImage(url, filePath) {
  const response = await axios({
    url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

main();
