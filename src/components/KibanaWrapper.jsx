import React from 'react';
import PropTypes from 'prop-types';
import './KibanaWrapper.less';

/*
* simple iframe wrapper around embedded kibana dashboard
*/

class KibanaWrapper extends React.Component {

  render() {
    return (
      <iframe
        title='kibana'
        src={this.props.url}
        frameBorder='0'
        className='kibana'
      />
    );
  }
}

KibanaWrapper.propTypes = {
  url: PropTypes.string.isRequired
};

export default KibanaWrapper;
