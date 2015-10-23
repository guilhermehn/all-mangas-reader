let React = require('react');
let PropTypes = React.PropTypes;
let SearchAPI = require('../apis/SearchAPI');
let SearchStore = require('../stores/SearchStore');
let LoadingIcon = require('./LoadingIcon.react');
let {getParserIcon} = require('../apis/parsers');

let SearchWarning = React.createClass({
  propTypes: {
    term: PropTypes.string,
    visible: PropTypes.bool.isRequired
  },

  continue() {
    SearchAPI.search(this.props.term);
    SearchAPI.hideSearchWarning();
  },

  cancel() {
    SearchAPI.hideSearchWarning();
  },

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <div className='notice open-animation'>
        <h3><i className='zmdi zmdi-alert-triangle'></i> Searching for less than 4 letters will be slow.</h3>
        <p>Do you really want to continue?</p>
        <button type='button' className='btn-confirm' onClick={this.continue}>Continue</button>
        <button type='button' onClick={this.cancel}>Cancel</button>
      </div>
    );
  }
});

let SearchField = React.createClass({
  search() {
    let term = this.refs.searchTerm.value.trim();

    if (term === this.props.lastSearchTerm) {
      return;
    }

    if (term.length < 4) {
      SearchAPI.addSearchTermToHistory(term, true);
      SearchAPI.showSearchWarning();
      return;
    }

    if (term.length) {
      SearchAPI.search(term);
    }
  },

  handleKeyPress(e) {
    if (e.which === 13) {
      this.search();
    }
  },

  render() {
    let placeholder = this.props.placeholder || 'Search mangas by name...';

    return (
      <div className='search-field'>
        <input type='text' placeholder={placeholder} onKeyPress={this.handleKeyPress} className='search-input' ref='searchTerm' />
        <button title='Search' className='search-btn' onClick={this.search}><i className='zmdi zmdi-lg zmdi-search'></i></button>
      </div>
    );
  }
});

let SearchResultsHeaders = React.createClass({
  render() {
    return (
      <tr>
        <th className='ta-left'>Title</th>
        <th className='ta-right'>Sites</th>
      </tr>
    );
  }
});

let EmptyResultSearch = React.createClass({
  render() {
    return (
      <strong>No manga contains the search term '{this.props.term}'</strong>
    );
  }
});

let SitesList = React.createClass({
  render() {
    let {sites} = this.props;

    let sitesIcons = sites.map((item, i) => {
      return (
        <a key={i} href={item.url} target='_blank' title={`Read '${item.title}' from ${item.site}`}>
          <img src={getParserIcon(item.site)} alt={item.site} />
        </a>
      );
    });

    return (
      <span className='ta-right'>{sitesIcons}</span>
    );
  }
});

let SearchInfo = React.createClass({
  render() {
    return (
      <div className='search-info'>
        {this.props.resultsLength} mangas were found for {`'${this.props.term}'`}
      </div>
    );
  }
});

let SearchResultsRows = React.createClass({
  render() {
    return (
      <tbody>
        {
          this.props.results.map((result, i) => {
            return (
              <tr key={i}>
                <td>{result.title}</td>
                <td className='search-results-site-list'>
                  <SitesList title={result.title} sites={result.sites} />
                </td>
              </tr>
            );
          })
        }
      </tbody>
    );
  }
});

let SearchResultsTable = React.createClass({
  render() {
    let {
      results,
      term,
      waitingForSearch,
      showSearchWarning
    } = this.props;

    if (showSearchWarning) {
      return null;
    }

    if (!results.length) {
      if (term && !waitingForSearch) {
        return <EmptyResultSearch term={term} />;
      }

      return null;
    }

    return (
      <div className='search-results'>
        <SearchInfo resultsLength={results.length} term={term} />
        <table>
          <thead>
            <SearchResultsHeaders />
          </thead>
          <SearchResultsRows results={results} />
          {results.length > 50 && (
            <tfoot>
              <SearchResultsHeaders />
            </tfoot>
          )}
        </table>
      </div>
    );
  }
});

function getStateFromStores() {
  return {
    results: SearchStore.getSearchResults(),
    term: SearchStore.getLastSearchTerm(),
    waitingForSearch: SearchStore.isWaitingForSearch(),
    showSearchWarning: SearchStore.shouldShowSearchWarning()
  };
}

let SearchPage = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    SearchStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    SearchStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(getStateFromStores());
  },

  render() {
    let {
      term,
      waitingForSearch,
      showSearchWarning
    } = this.state;

    return (
      <div>
        <h2>Search mangas</h2>
        <SearchField lastSearchTerm={term} />
        <SearchWarning visible={showSearchWarning} term={term} />
        <LoadingIcon text={`Searching for '${term}'...`} visible={waitingForSearch} />
        <SearchResultsTable {...this.state} />
      </div>
    );
  }
});

module.exports = SearchPage;
