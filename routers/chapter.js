const router = require("express").Router();
const cheerio = require("cheerio");
const axios = require('axios');
const { fetch } = require("../scrappers/index.js");
//const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send({
    message: "chapter"
  });
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  const url = `https://bacakomik.co/${slug}`;
  try {
    //response
    const response = await axios.get(url, 
      { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'}  });
    fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
    const $ = cheerio.load(html);
    const content = $("article");
    let chapter_image = [];
    const obj = {};
    obj.chapter_endpoint = slug + "/";

    const getTitlePages = content.find(".chapter-area > .chapter-content > .dtlx")
    getTitlePages.filter(() => {
      obj.title = $(getTitlePages).find("h1").text().replace("Komik ", "");
    });
    // obj.download_link = link;

    const getPages = $('#Baca_Komikz').children().find('#chimg > img');
    obj.chapter_pages = getPages.length;
    getPages.each((i, el) => {
      chapter_image.push({
        chapter_image_link: $(el).attr("src"),
        image_number: i + 1,
      });
    });
    obj.chapter_image = chapter_image;
    res.json(obj);
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
      chapter_image :[]
    });
  }
});

module.exports = router;