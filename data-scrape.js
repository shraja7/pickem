const cheerio = require("cheerio");
const fs = require("fs");

// Main code
async function main() {
  const cheerio = require("cheerio");
  const fs = require("fs");
  const html = fs.readFileSync("./Stats _ UFC.html");
  const $ = cheerio.load(html);

  const data = {
    title: "",
    date: "",
    location: "",
    fighters: [],
  };

  // Extract title
  const title = $(".b-content__title .b-content__title-highlight")
    .text()
    .trim();
  data.title = title;

  // Extract date
  const dateElement = $(".b-list__box-item-title:contains('Date:')").parent();
  const date = dateElement
    .contents()
    .filter(function () {
      return this.nodeType === 3; // Filter text nodes only
    })
    .text()
    .trim();
  data.date = date;

  // Extract location
  const locationElement = $(
    ".b-list__box-item-title:contains('Location:')"
  ).parent();
  const location = locationElement
    .contents()
    .filter(function () {
      return this.nodeType === 3; // Filter text nodes only
    })
    .text()
    .trim();
  data.location = location;

  // Extract fighters
  const fighterElements = $(
    "td.b-fight-details__table-col.l-page_align_left p.b-fight-details__table-text a.b-link"
  );
  for (let i = 0; i < fighterElements.length; i += 2) {
    const fighter1 = $(fighterElements[i]).text().trim();
    const fighter2 = $(fighterElements[i + 1])
      .text()
      .trim();
    data.fighters.push({ fighter1, fighter2 });
  }

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFile("output.json", jsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
      return;
    }
    console.log("Data saved to output.json");
  });
}

main();
