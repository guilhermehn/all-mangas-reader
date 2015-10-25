let React = require('react');
let PropTypes = React.PropTypes;
let SearchAPI = require('../apis/SearchAPI');

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

module.exports = SearchWarning;
