let $ = require('cheerio');
let {getPage} = require('./parserUtils');

let GoodManga = {
  url: 'http://w2.goodmanga.net/',
  name : 'GoodManga',
  icon : 'http://www.goodmanga.net/favicon.gif',
  languages : 'en',

  search(search, done) {
    getPage('http://www.goodmanga.net/manga-search?key=' + search + '&search=Go', (page, body) => {
      let result = page
          .find('.series_list .right_col h3 a:first-child')
          .map((i, el) => {
            let $el = $(el);

            return {
              title: $el.text().trim(),
              url: $el.attr('href')
            };
          })
          .get();

      done(result);
    });
  },

  getMangaList(search, callback) {
    $.ajax({
      url : 'http://www.goodmanga.net/manga-search?key=' + search + '&search=Go' + '',

      beforeSend(xhr) {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
      },

      success(data) {
        let div = document.createElement('div');
        div.innerHTML = data.replace(/<img/gi, '<noload');

        let res = $(div)
          .find('.series_list .right_col h3 a:first-child')
          .map(function () {
            let $this = $(this);

            return [$this.text().trim(), $this.attr('href')];
          })
          .get();

        callback('GoodManga', res);
      }
    });
  },

  getListChaps(urlManga, mangaName, obj, callback) {
    $.ajax({
      url : urlManga,

      beforeSend(xhr) {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
      },

      success(objResponse) {
        let div = document.createElement('div');
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');

        let res = [];

        $('#chapters ul li a', div).each(function (index) {
          let $this = $(this);
          res[res.length] = [$this.text().trim(), $this.attr('href')];
        });

        callback(res, obj);
      }
    });
  },

  getListImages(doc, curUrl2) {
    return $(doc)
      .find('#page #content #assets #asset_2 select.page_select:first option')
      .map(function (index) {
        return $(this).val();
      })
      .get();
  },

  getImageFromPageAndWrite(urlImg, image, doc, curUrl) {
    $.ajax({
      url : urlImg,

      success(objResponse) {
        let div = document.createElement('div');
        div.innerHTML = objResponse;

        let src = $(div).find('#manga_viewer img').attr('src');
        $(image).attr('src', src);
      }
    });
  },

  getMangaInfo(source, done) {
    getPage(source.url, (page) => {
      let base = page.find('#series_details');

      let staff = base.find('> div:nth-child(2)').eq(0).text().trim().split(/:\s/)[1].split(/,\s/);
      let authors = [];
      let artists = [];

      staff.forEach(member => {
        if (member.indexOf('art') > 0) {
          artists.push(member.replace(' (art)', ''));
        }
        else {
          authors.push(member);
        }
      });

      let status = base.find('> div:nth-child(4)').text().trim().split(/:\s/)[1];
      let releaseDate = base.find('> div:nth-child(5)').text().trim().split(/:\s/)[1];
      let genres = base.find('> div:nth-child(7)').text().trim().toLowerCase().split(/:\s/)[1].split(/,\s/);

      done({
        authors: authors,
        artists: artists.length ? artists : authors,
        status: status,
        genres: genres,
        releaseDate: releaseDate
      });
    });
  }
};

module.exports = GoodManga;
