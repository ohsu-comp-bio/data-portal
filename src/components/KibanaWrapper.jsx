import React from 'react';
import PropTypes from 'prop-types';
import './KibanaWrapper.less';

/*
* simple iframe
*/

class KibanaWrapper extends React.Component {
  renderComponent = props => (
    React.Children.map(this.props.children, child =>
      React.cloneElement(child, { ...props },
      ),
    )
  );

  render() {
    console.log(this.props.index,
      this.props.graphqlField,
      this.props.projectId,
      this.props.children);
    return (
      <iframe
        title='kibana'
        src='http://localhost/kibana/app/kibana#/dashboard/4d1f2b50-1b76-11e9-a7f6-f99f8f17749e?embed=true&_g=()'
        frameBorder='0'
        className='kibana'
      />
    );
  }
}

KibanaWrapper.propTypes = {
  index: PropTypes.string.isRequired,
  graphqlField: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]).isRequired,
};

export default KibanaWrapper;
