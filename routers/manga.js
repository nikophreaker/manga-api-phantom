const router = require("express").Router();
const cheerio = require("cheerio");
const axios = require('axios');
const { fetch } = require("../scrappers/index.js");
const replaceMangaPage = "https://bacakomik.co/manga/";

// manga popular ----Ignore this for now --------
router.get("/manga/popular", async (req, res) => {
    res.send({
      message: "nothing",
    });
  });

//mangalist pagination  -------Done------
router.get("/manga/page/:pagenumber", async (req, res)=> {
  let pagenumber = req.params.pagenumber;
  let url = pagenumber == '1' ? 'https://bacakomik.co/daftar-manga/':
  `https://bacakomik.co/daftar-manga/page/${pagenumber}/`;
  
  try {
    const response = await axios.get(url);
    console.log(url);
    fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
    if (response.status === 200) {
        const $ = cheerio.load(html);
        const element = $(".listupd");
        let manga_list = [];
        //let title, type, updated_on, endpoint, thumb, chapter;
        let title, endpoint, thumb, rating;
  
        element.find(".film-list > .animepost").each((idx, el) => {
          title = $(el).find(".animposx > .bigors > a > .tt").find("h4").text().trim();
          endpoint = $(el).find(".animposx > a").attr("href").replace(replaceMangaPage, "");
          //type = $(el).find(".bgei > a").find(".tpe1_inf > b").text();
          //updated_on = $(el).find(".kan > span").text().split("• ")[1].trim();
          thumb = $(el).find(".animposx > a > .limit").find("img").attr("src");
          //chapter = $(el).find("div.kan > div:nth-child(5) > a > span:nth-child(2)").text();
          rating = $(el).find(".animposx > .bigors > .adds > .rating").find("i").text();
          manga_list.push({
            title,
            thumb,
            //type,
            //updated_on,
            endpoint,
            //chapter,
            rating,
          });
        });
        return res.status(200).json({
          status: true,
          message: "success",
          manga_list,
        });
      }
      return res.send({
        message: response.status,
        manga_list: [],
      });
    });
  } catch(error) {
        res.send({
            status: false,
            message: error,
            manga_list: [],
          });
  };
});

// detail manga  ---- Done -----
router.get("/manga/detail/:slug", async (req, res) => {
    let slug = req.params.slug;
    let url = "https://bacakomik.co/manga/" + slug;
    try {
    const response = await axios.get(url);
    console.log(url);
    fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
    const $ = cheerio.load(html);
    const element = $(".postbody");
    let genre_list = [];
    let chapter = [];
    const obj = {};
  
    /* Get Title, Type, Author, Status */
    const getMeta = element.find("article > .whites > .infoanime");
    obj.title = $(getMeta)
      //.children()
      .find(".entry-title")
      .text()
      .replace("Komik", "")
      .trim();
    obj.type = $(getMeta).find('.infox > .spe > span:nth-child(5)').find('a').text();
    obj.author = $(getMeta).find('.infox > .spe > span:nth-child(4)').text();
    obj.status = $(getMeta).find('.infox > .spe > span:nth-child(1)').text();
  
    /* Set Manga Endpoint */
    obj.manga_endpoint = slug;
  
    /* Get Manga Thumbnail */
    obj.thumb = $(getMeta).find('.thumb > img').attr("src");
  
    $(getMeta).find(".infox > .genre-info > a").each((idx, el) => {
      let genre_name = $(el).text();
      genre_list.push({
        genre_name,
      });
      obj.genre_list = genre_list;
    });
  
    /* Get Synopsis */
    const getSinopsis = element.find("article > .tabsarea > #sinopsis > .whites > .desc");
    obj.synopsis = $(getSinopsis).find("p").text().trim();
  
    /* Get Chapter List */
    element.find("article > .whites")
      .find(".eps_lst > .listeps > #chapter_list > ul > li")
      .each((index, el) => {
        let chapter_title = $(el)
          .find(".lchx > a ").text();
        let chapter_endpoint = $(el).find("a").attr("href")
        console.log(chapter_endpoint);
        if(chapter_endpoint !== undefined){
          const rep = chapter_endpoint.replace('https://bacakomik.co/','')
          chapter.push({
            chapter_title,
            chapter_endpoint:rep,
          }); 
        }
        obj.chapter = chapter;
      });
  
    res.status(200).json(obj);
    });
    } catch (error) {
      res.send({
        status: false,
        message: error,
      });
    }
  });

//search manga pagination------Done-----------
router.get("/search/:query/:pagenumber", async (req, res) => {
    const query = req.params.query;
    const pagenumber = req.params.pagenumber;
    //const url = `https://bacakomik.co/?s=${query}`;
    let url = pagenumber == '1' ? `https://bacakomik.co/?s=${query}`:
    `https://bacakomik.co/page/${pagenumber}/?s=${query}`;
  
    try {
      const response = await axios.get(url);
      console.log(url);
      fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
      const $ = cheerio.load(html);
      const element = $(".postbody");
      let manga_list = [];
      let title, thumb, endpoint, rating;
      //let title, thumb, type, endpoint, updated_on;
      element.find(".whites > .film-list > .animepost").each((idx, el) => {
        endpoint = $(el).find(".animposx > a").attr("href").replace(replaceMangaPage, "");
        thumb = $(el).find(".limit > img").attr("src");
        //type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
        title = $(el).find(".animposx > .bigors > a > .tt").find("h4").text().trim();
        //updated_on = $(el).find("div.kan > p").text().split('.')[0].trim();
        rating = $(el).find(".animposx > .bigors > .adds > .rating > i").text();
        manga_list.push({
          title,
          thumb,
          //type,
          endpoint,
          //updated_on,
          rating,
        });
      });
      res.json({
        status: true,
        message: "success",
        manga_list
      });
    });
    } catch (error) {
      res.send({
        status: false,
        message: error.message,
      });
    }
  }); 

//genreList  -----Done-----
router.get("/genres", async (req, res) => {
    const url = `https://bacakomik.co/daftar-genre/`;
    try {
      const response = await axios.get(url);
      console.log(url);
      fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
      const $ = cheerio.load(html);
      let list_genre = [];
      let obj = {};
      $('.postbody > .whites > .widget-body > .content > .post-show > .genrelist > li').each((idx,el)=>{
          list_genre.push({
            genre_name:$(el).find('a').text()
          });
      });
      obj.status = true
      obj.message = 'success'
      obj.list_genre = list_genre
      res.json(obj);
    });
    } catch (error) {
      res.send({
        status: false,
        message: error,
      });
    }
  });
  
  //genreDetail ----Done-----
  router.get("/genres/:slug/:pagenumber", async (req, res) => {
    const slug = req.params.slug;
    const pagenumber = req.params.pagenumber;
    const url = pagenumber === '1' ?`https://bacakomik.co/genres/${slug}/`
    :`https://bacakomik.co/genres/${slug}/page/${pagenumber}`;
    try {
      const response = await axios.get(url);
      console.log(url);
      fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
      const $ = cheerio.load(html);
      const element = $(".postbody");
      //var thumb, title, endpoint, type;
      var thumb, title, endpoint, rating;
      let manga_list = [];
      element.find(".whites > .film-list > .animepost").each((idx, el) => {
        title = $(el).find(".animposx > .bigors > a > .tt").find("h4").text().trim();
        endpoint = $(el).find(".animposx > a").attr("href").replace(replaceMangaPage, "");
        //type = $(el).find("div.bgei > a > div").find("b").text();
        rating = $(el).find(".animposx > .bigors > .adds > .rating").find("i").text();
        thumb = $(el).find(".animposx > a > .limit").find("img").attr("src");
        manga_list.push({
          title,
          //type,
          rating,
          thumb,
          endpoint,
        });
      });
      //console.log(manga_list);
      res.json({
        status: true,
        message: "success",
        manga_list,
      });
    });
    } catch (error) {
      res.send({
        status: false,
        message: error,
        manga_list: [],
      });
    }
  });

  //manga popular pagination ----- Done ------
router.get("/manga/popular/:pagenumber", async (req, res) => {
    const pagenumber = req.params.pagenumber;
    const url = pagenumber == 1 ? `https://bacakomik.co/populer/`
    :`https://bacakomik.co/populer/${pagenumber}`;
  
    try {
      const response = await axios.get(url);
      fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
      const $ = cheerio.load(html);
      const element = $(".postbody");
      var thumb, title, endpoint, rating;
      let manga_list = [];
      element.find(".whites > .widget-body > .content > .post-show > .listupd > .animepost").each((idx, el) => {
        title = $(el).find(".animposx > .bigors > a > .tt").find("h4").text().trim();
        endpoint = $(el).find(".animposx > a").attr("href").replace(replaceMangaPage, "");
        //type = $(el).find("div.bgei > a > div").find("b").text();
        rating = $(el).find(".animposx > .bigors > .adds > .rating").find("i").text();
        thumb = $(el).find(".animposx > a > .limit").find("img").attr("src");
        manga_list.push({
          title,
          //type,
          rating,
          thumb,
          endpoint,
        });
      });
      res.json({
        status: true,
        message: "success",
        manga_list,
      });
    });
    } catch (error) {
      res.send({
        status: false,
        message: error,
        manga_list: [],
      });
    }
  });
  
  //terbaru ---done---
  router.get("/terbaru/:pagenumber", async (req, res) => {
      const pagenumber = req.params.pagenumber;
      const url = pagenumber == 1 ? `https://bacakomik.co/komik-terbaru/` 
      : `https://bacakomik.co/komik-terbaru/page/${pagenumber}/`;
    try {
      const response = await axios.get(url);
      fetch(
        url,
        error => {
          console.log(error);
        },
        html => {
      const $ = cheerio.load(html);
      const element = $(".postbody");
      var thumb, title, endpoint, update_on;
      let manga_list = [];
      element.find(".whites > .widget-body > .content > .post-show > .listupd > .animepost").each((idx, el) => {
        title = $(el).find(".animposx > .bigor > a > .tt").find("h4").text().trim();
        endpoint = $(el).find(".animposx > a").attr("href").replace(replaceMangaPage, "");
        //type = $(el).find("div.bgei > a > div").find("b").text();
        update_on = $(el).find(".animposx > .bigor > .adds > .datech").text();
        thumb = $(el).find(".animposx > a > .limit").find("img").attr("src");
        manga_list.push({
          title,
          //type,
          update_on,
          thumb,
          endpoint,
        });
      });
      return res.json({
        status: true,
        message: "success",
        manga_list,
      });
    });
    } catch (error) {
      res.send({
        message: error.message,
      });
    }
  });

module.exports = router;
// const fetchData = async() =>{
// let page_manga = [];
// let url_manga = [];
// let chap_mangaLink = [];
// let chap_manga = [];
// try{
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
//     const itemManga = $('.animepost');
//     for(let i = 0; i < itemManga.length; i++) {
//         let item = itemManga.eq(i);
//         const linkManga = item.find('a')
//         .attr('href')
//         .trim();
//         url_manga.push(linkManga);
//         console.log(linkManga);
//     }
// } catch(error){
//     console.log(error);
// }

// try {
//     for(let i = 0; i < url_manga.length;i++){
//         const response = await axios.get(url_manga[i]);
//         const $ = cheerio.load(response.data);
//         const itemChapter = $('#chapter_list').find('li');
//         for(let j = 0; j < itemChapter.length;j++){
//             let item = itemChapter.eq(j);
//             const itemChapLink = item
//             .find('a').attr('href').trim();
//             chap_mangaLink.push(itemChapLink);
//             console.log(itemChapLink);
//         }
//     }
// } catch(error){
//     console.log(error);
// }

// for(let i=0;i < chap_mangaLink.length;i++)
// {
// fetch(
//   chap_mangaLink[i],
//   error => {
//     console.log(error);
//   },
//   html => {
//     const $ = cheerio.load(html);
//     const img = $('article')
//     .find('.chapter-area').find('.chapter-content')
//     .find('#Baca_Komik').children().find('#chimg > img');
//     img.each((i, el) => {
//         console.log($(el).attr('src'));
//     });
//   }
// );
// }
// }

// fetchData();
