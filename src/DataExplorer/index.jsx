import React from 'react';
import ArrangerWrapper from '../Arranger/ArrangerWrapper';
import DataExplorerFilters from './DataExplorerFilters';
import DataExplorerVisualizations from './DataExplorerVisualizations';
import KibanaWrapper from '../components/KibanaWrapper';
import arrangerApi from '../Arranger/utils';
import { config } from '../params';
import './DataExplorer.less';
import { kibana_wrapper_url } from '../localconf';


class DataExplorer extends React.Component {
  render() {
    const arrangerConfig = config.arrangerConfig || {};
    const explorerTableConfig = arrangerConfig.table || {};

    let component ;
    if (kibana_wrapper_url===undefined) {
      component = <ArrangerWrapper
          index={arrangerConfig.index}
          graphqlField={arrangerConfig.graphqlField}
          projectId={arrangerConfig.projectId}
          api={arrangerApi}
          charts={arrangerConfig.charts}
        >
          <DataExplorerFilters arrangerConfig={arrangerConfig} api={arrangerApi} />
          <DataExplorerVisualizations
            arrangerConfig={arrangerConfig}
            explorerTableConfig={explorerTableConfig}
            api={arrangerApi}
          />
        </ArrangerWrapper>

    } else {
      component = <KibanaWrapper  url={process.env.KIBANA_WRAPPER_URL} />
    }
    return (
      <div className='data-explorer'>
        {component}
      </div>
    );
  }
}

export default DataExplorer;
