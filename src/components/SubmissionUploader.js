import React from 'react';
import { useCSVReader, usePapaParse } from 'react-papaparse';
import Papa from 'papaparse';

import { Button } from 'reactstrap';
import { makeDesignCsv } from '../tools/helperFunctions';

const styles = {
  csvReader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  browseFile: {
    width: 'auto',
  },
  acceptedFile: {
    color: 'black',
    border: '1px solid #ccc',
    borderRadius: '5px',
    minWidth: '200px',
    minHeight: '20px',
    margin: '0 10px',
  },
  remove: {
    backgroundColor: '#F1948A',
    color: 'whitesmoke',
    border: 'none'
  },
  progressBarBackgroundColor: {
    backgroundColor: '#F5B041',
  },
};

export default function CSVUploader(props) {
  const { CSVReader } = useCSVReader();

  return (
    <CSVReader
      multiple={true}
      // onChange={console.log('change!')}
      onUploadAccepted={function (results) {
        console.log('---------------------------');
        console.log(results);
        console.log('---------------------------');
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }) => (
        <>
          <div style={styles.csvReader}>
            <Button {...getRootProps()} style={styles.browseFile}>
              Browse file
            </Button>
            <div style={styles.acceptedFile}>
              {acceptedFile && acceptedFile.name}
            </div>
            <Button {...getRemoveFileProps()} style={styles.remove}>
              Remove
            </Button>
          </div>
          {/* <ProgressBar style={styles.progressBarBackgroundColor} /> */}
        </>

      )}
    </CSVReader>
  );
}