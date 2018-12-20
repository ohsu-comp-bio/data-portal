import { connect } from 'react-redux';
import ProjectSubmission from './ProjectSubmission';
import SubmitTSV from './SubmitTSV';
import SubmitForm from './SubmitForm';

import ReduxDataModelGraph, { getCounts } from '../DataModelGraph/ReduxDataModelGraph';

import { fetchWithCreds } from '../actions';
import { predictFileType } from '../utils';
import { submissionApiPath, lineLimit } from '../localconf';

export const uploadTSV = (value, type) => (dispatch) => {
  dispatch({ type: 'REQUEST_UPLOAD', file: value, file_type: type });
};

export const updateFormSchema = formSchema => ({
  type: 'UPDATE_FORM_SCHEMA',
  formSchema,
});

export const updateFileContent = (value, fileType) => (dispatch) => {
  dispatch({ type: 'UPDATE_FILE', file: value, file_type: predictFileType(value, fileType) });
};


const submitToServer = (fullProject, methodIn = 'PUT') => (dispatch, getState) => {
  const fileArray = [];
  const resolvedPromisesArray = [];
  const path = fullProject.split('-');
  const program = path[0];
  const project = path.slice(1).join('-');
  const submission = getState().submission;
  const method = path === 'graphql' ? 'POST' : methodIn;
  let file = submission.file;
  if (!file) {
    return Promise.reject('No file to submit');
  } else if (submission.file_type !== 'text/tab-separated-values') {
    // remove line break in json file
    file = file.replace(/\n/g, '');
  }


  if (submission.file_type === 'text/tab-separated-values') {
    const fileSplited = file.split(/\n/g);
    if (fileSplited.length > lineLimit && lineLimit > 0) {
      let fileHeader = fileSplited[0];
      fileHeader += '\r';
      let count = lineLimit;
      let fileChunk = fileHeader;

      for (let i = 1; i < fileSplited.length; i += 1) {
        fileChunk += fileSplited[i];
        fileChunk += '\r';
        count -= 1;
        if (count === 0) {
          fileArray.push(fileChunk);
          fileChunk = fileHeader;
          count = lineLimit;
        }
      }
      if (fileChunk !== fileHeader) {
        fileArray.push(fileChunk);
      }
    } else {
      fileArray.push(file);
    }
  } else {
    fileArray.push(file);
  }
  let subUrl = submissionApiPath;
  if (program !== '_root') {
    subUrl = `${subUrl + program}/${project}/`;
  }

  for (let i = 0; i < fileArray.length; i += 1) {
    const lastPromise = fetchWithCreds({
      path: subUrl,
      method,
      customHeaders: { 'Content-Type': submission.file_type },
      body: fileArray[i],
      dispatch,
    }).then(
      ({ status, data }) => (
        {
          type: 'RECEIVE_SUBMISSION',
          submit_status: status,
          data,
        }),
    ).then(msg => dispatch(msg));
    resolvedPromisesArray.push(lastPromise);
  }
  return Promise.all(resolvedPromisesArray);
};

const ReduxSubmitTSV = (() => {
  const mapStateToProps = state => ({
    submission: state.submission,
    dictionary: state.dictionary,
  });

  const mapDispatchToProps = dispatch => ({
    onUploadClick: (value, type) => dispatch(uploadTSV(value, type)),
    onSubmitClick: (type, project, dictionary) =>
      dispatch(submitToServer(project))
        .then(
          () => {
            // Update node countItems in redux
            dispatch(getCounts(type, project, dictionary));
          }),
    onFileChange: value => dispatch(updateFileContent(value)),
  });

  return connect(mapStateToProps, mapDispatchToProps)(SubmitTSV);
})();


const ReduxSubmitForm = (() => {
  const mapStateToProps = state => ({
    submission: state.submission,
  });

  const mapDispatchToProps = dispatch => ({
    onUploadClick: (value, type) => dispatch(uploadTSV(value, type)),
    onUpdateFormSchema: (formSchema => dispatch(updateFormSchema(formSchema))),
  });

  return connect(mapStateToProps, mapDispatchToProps)(SubmitForm);
})();


const ReduxProjectSubmission = (() => {
  const mapStateToProps = (state, ownProps) => ({
    typeList: state.submission.nodeTypes,
    dataIsReady: !!state.submission.counts_search,
    dictionary: state.submission.dictionary,
    submitForm: ReduxSubmitForm,
    submitTSV: ReduxSubmitTSV,
    dataModelGraph: ReduxDataModelGraph,
    project: ownProps.params.project,
  });

  const mapDispatchToProps = dispatch => ({
    onGetCounts: (typeList, project, dictionary) =>
      dispatch(getCounts(typeList, project, dictionary)),
  });
  return connect(mapStateToProps, mapDispatchToProps)(ProjectSubmission);
})();

export default ReduxProjectSubmission;
