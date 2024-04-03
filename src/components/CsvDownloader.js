import React from 'react';

import { useCSVDownloader } from 'react-papaparse';

export default function CSVDownloader(props) {
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <CSVDownloader
      className="download-button"
      type={Type.Button}
      filename={props.fileName || 'download'}
      bom={true}
      config={{
        delimiter: ',',
      }}
      data={props.data}
    >
      {props.message || 'Download Csv'}
    </CSVDownloader>
  );
}