import React from 'react';
import { Link } from 'react-router';
import { json_to_string, get_submit_path } from '../utils';
import { updatePopup } from '../actions';
import { Popup } from '../Popup/component';
import Nav from '../Nav/component';
import styled, { css } from 'styled-components';
import { input, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { clearDeleteSession, fetchQueryNode, submitSearchForm, deleteNode, storeNodeInfo } from './actions';
import { cube } from '../theme';
import Select from 'react-select';


const SearchButton = styled.input`
  transition: 0.25s;
  color: white;
  margin-bottom: 1em;
  background-color: ${props => props.theme.color_secondary};
  border: 1px solid ${props => props.theme.color_secondary};
  line-height: 34px;
  &:hover,
  &:active,
  &:focus {
    background-color: ${props => props.theme.color_secondary_fade};
    border: 1px solid ${props => props.theme.color_secondary_fade};

  }
  padding: 0em 0.5em;
`;

const actionButton = css`
  cursor: pointer;
  float: right;
  display: inline-block;
  margin-left: 2em;
  &:hover,
  &:active,
  &:focus {
    color: inherit;
  }
`;

const DownloadButton = styled.a`
   ${actionButton};
`;

const DeleteButton = styled.a`
  ${actionButton};
  color: ${props => props.theme.color_primary};
`;
const ViewButton = styled.a`
  ${actionButton};
  color: #2B547E;
`;
const Input = styled.input`
  transition: 0.25s;
  border: 1px solid #c1c1c1;
  line-height: 34px;
  margin-right: 1em;
  padding: 0em 0.5em;
  border-radius: 5px;
`;

const Dropdown = styled(Select)`
  width: 40%;
  float: left;
  margin-right: 1em;
`;

class QueryForm extends React.Component {
  constructor( props ) {
    super(props);
    this.state = {
      selectValue: 'experiment'
    };
  }

  handleQuerySubmit (event) {
    event.preventDefault();
    let form = event.target;
    let data = {project: this.props.project};
    let query_param = [];

    for (let i =0; i<form.length; i++){
      let input = form[i];
      if (input.name && input.value) {
        query_param.push(input.name + '=' + input.value);
        data[input.name] = input.value;
      }
    }
    let url = `/${this.props.project}/search?${query_param.join('&')}`;
    this.props.onSearchFormSubmit(data, url);
  }


  updateValue (newValue) {
    this.setState({
      selectValue: newValue
    });
  }

  render() {
    let nodes_for_query = this.props.node_types.filter((nt) => !['program', 'project'].includes(nt));
    let options = nodes_for_query.map( (node_type) => {return {value: node_type, label: node_type}; });
    return (
        <form onSubmit={this.handleQuerySubmit}>
          <Dropdown name="node_type" options={options} value={this.state.selectValue} onChange={this.updateValue}/>
          <Input placeholder='submitter_id' type='text' name="submitter_id"/>
          <SearchButton type='submit' onSubmit={this.handleQuerySubmit} value='search' />
        </form>
    );
  }
}

const Entity = ({value, project, onUpdatePopup, onStoreNodeInfo}) => {
  let onDelete = () => {
    onStoreNodeInfo({project: project, id: value.id});
    onUpdatePopup({nodedelete_popup: true});
  };
  let onView = () => {
    onStoreNodeInfo({project: project, id: value.id});
    onUpdatePopup({view_popup: true});
  };
  return (
    <li>
      <span>{value.submitter_id}</span>
      <DownloadButton href={get_submit_path(project) + '/export?format=json&ids='+value.id}>Download</DownloadButton>
      <ViewButton onClick={onView}>View</ViewButton>
      <DeleteButton onClick={onDelete}>Delete</DeleteButton>
    </li>
  );
};

const Entities = ({value, project, onUpdatePopup, onStoreNodeInfo}) => {
  return (
    <ul>
      {value.map( ( value) => <Entity project={project} onStoreNodeInfo={onStoreNodeInfo} onUpdatePopup={onUpdatePopup} key={value.submitter_id} value={value} /> )}
    </ul>
  );
};


/**
 * QueryNode shows the details of a particular node
 */
export class QueryNode extends React.Component {
  /** 
   * Internal helper to select which popup variant - if any - should be rendered:
   *    confirmDelete, waitForDelete, deleteFailed, viewNode, noPopup
   * 
   * @param {popups, query_nodes, onUpdatePopup, onDeleteNode, onClearDeleteSession} props including props.popups and props.query_nodes state passed into the component by Redux
   * @return { state, popupEl } where state is string one of [confirmDelete, waitForDelete, ...], and 
   *    popupEl is either null or a <Popup> properly configured to render
   */
  renderPopup( props ) {
    const {query_nodes, popups,onUpdatePopup, onDeleteNode, onClearDeleteSession } = props;
    const popup = {
      state: "noPopup",
      popupEl: null
    };

    if ( popups.nodedelete_popup === true ) {
      // User clicked on node 'Delete' button
      popup.state = "confirmDelete";
      popup.popupEl = <Popup message={'Are you sure you want to delete this node?'} error={json_to_string(query_nodes.delete_error)} 
        code={json_to_string(query_nodes.query_node)} 
        onConfirm={
          ()=>{
            onDeleteNode({project, id:query_nodes.stored_node_info}); 
            onUpdatePopup({view_popup: 'Waiting for delete to finish ...', nodedelete_popup:false });
          }
        } 
        onCancel={()=>{ onClearDeleteSession(); onUpdatePopup({nodedelete_popup:false }); }}
      />;
    } else if (! popups.nodedelete_popup &&
      popups.view_popup === true &&
      query_nodes.query_node &&
      query_nodes.delete_error 
    ) {
      // Error deleting node
      popup.state = "deleteFailed";
      popup.popupEl = <Popup message={'Error deleting: ' + query_nodes.query_node.submitter_id} error={json_to_string(query_nodes.delete_error)} 
        code={json_to_string(query_nodes.query_node)} 
        onClose={ ()=>{ onClearDeleteSession(); onUpdatePopup({view_popup: false}); } }
      />;
    } else if (! popups.nodedelete_popup &&
      typeof popups.view_popup === 'string' &&
      query_nodes.query_node  
    ) {
      // Waiting for node delete to finish
      popup.state = "waitForDelete";
      popup.popupEl = <Popup message={ popups.view_popup }  />;
    } else if (! popups.nodedelete_popup &&
      popups.view_popup  &&
      query_nodes.query_node
    ) { 
      // View node button clicked
      popup.state = "viewNode";
      popup.popupEl = <Popup message={query_nodes.query_node.submitter_id} code={json_to_string(query_nodes.query_node)} 
        onClose={
          ()=>{
            onUpdatePopup({view_popup: false, nodedelete_popup:false });
          }
        } 
      />;
    } 
    return popup;
  }

  render() {
    const {params, ownProps, submission, query_nodes, popups, onSearchFormSubmit, onUpdatePopup, 
      onDeleteNode, onStoreNodeInfo, 
      onClearDeleteSession
    } = this.props;
    const project = params.project;
    const popupInfo = this.renderPopup( this.props );

    return  (
      <div>
        <h3>browse <Link to={'/' + project}>{project}</Link> </h3>
        {popupInfo.popupEl}
        <QueryForm onSearchFormSubmit={onSearchFormSubmit} project={project} node_types={submission.node_types}/>
        { query_nodes.search_status==='succeed: 200' &&
            Object.entries(query_nodes.search_result['data']).map((value) => { return (<Entities project={project} onStoreNodeInfo={onStoreNodeInfo} onUpdatePopup={onUpdatePopup} node_type={value[0]} key={value[0]} value={value[1]}/>)})
        }
      </div>
    );
  }

};


const mapStateToProps = (state, ownProps) => {
  const result = {
    'submission': state.submission,
    'ownProps': ownProps,
    'query_nodes': state.query_nodes,
    'popups': Object.assign( {}, state.popups )
  };
  if ( (state.query_nodes && state.query_nodes.delete_error) && ! result.popups.view_popup ) {
    result.popups.view_popup = true;
  }
  return result;
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSearchFormSubmit: (value, url) => dispatch(submitSearchForm(value, url)),
    onUpdatePopup: (state) => dispatch(updatePopup(state)),
    onClearDeleteSession: () => dispatch(clearDeleteSession()),
    onDeleteNode: ({id, project}) => {
      dispatch(deleteNode({id, project}));
    },
    onStoreNodeInfo: ({id, project}) => dispatch(fetchQueryNode({id, project})).then(()=>dispatch(storeNodeInfo({id}))),
  };
};
const ReduxQueryNode = connect(mapStateToProps, mapDispatchToProps)(QueryNode);
export default ReduxQueryNode;