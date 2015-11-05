let ReaderActionsCreators = require('../actions/ReaderActionsCreators');
let SearchStore = require('../stores/SearchStore');
let ReadingListAPI = require('../apis/ReadingListAPI');
let ParsersAPI = require('../apis/ParsersAPI');

function loadMangaByName(name, method, done) {
  switch(method) {
  case 'search':
    done(SearchStore.getMangaByName(name));
    break;

  default:
    ReadingListAPI.getManga(name, storedManga => done(storedManga));
  }
}

function loadChapterPages(source, chapterNumber, done) {
  ParsersAPI.getChapterPages(source, chapterNumber, pages => done(pages));
}

function loadMangaChapter(name, sourceName, chapterNumber, method) {
  ReaderActionsCreators.startedLoadingManga();

  loadMangaByName(name, method, manga => {
    if (manga) {
      let source = manga.sources.filter(source => source.name === sourceName)[0];

      loadChapterPages(source, chapterNumber, pages => {
        manga.pages = pages;
        ReaderActionsCreators.receiveMangaWithPages(manga);
      });
    }
  });
}

let ReaderAPI = {
  loadMangaChapter: loadMangaChapter
};

module.exports = ReaderAPI;
