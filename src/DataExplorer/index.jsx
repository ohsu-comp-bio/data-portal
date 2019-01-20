import React from 'react';
import KibanaWrapper from '../components/KibanaWrapper';
import './DataExplorer.less';

class DataExplorer extends React.Component {
  render() {
    return (
      <div className='data-explorer'>
        <KibanaWrapper />
      </div>
    );
  }
}

export default DataExplorer;
