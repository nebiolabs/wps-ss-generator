import './App.css';
import React, { useState, useEffect } from "react";
import Papa from 'papaparse';
import { makeSampleSheets, getDateString } from './tools/helperFunctions'
import { Input, Button, Spinner } from 'reactstrap';
import CSVDownloader from './components/CsvDownloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons';
export default function App() {

  const [files, setFiles] = useState([]);
  const [showInput, setShowInput] = useState(true);
  const [sampleSheet, setSampleSheet] = useState([]);

  useEffect(() => {
    // console.log(files);
    // console.log(sampleSheet);

  }, [files], [sampleSheet]);

  function handleChange(event) {
    let uploadedFiles = [];

    for (let i = 0; i < event.target.files.length; i++) {
      let fileName = event.target.files[i].name;
      console.log(fileName);
      Papa.parse(event.target.files[i], {
        complete: function (results) {
          uploadedFiles.push({ name: fileName, samples: results.data });
          setTimeout(() => {
            setFiles(uploadedFiles)
          }, 500)
        }
      });

    }
  }

  function handleClearFiles() {
    setFiles([]);
    setSampleSheet([]);
    setShowInput(false);
    setTimeout(() => {
      setShowInput(true);
    }, 500)
  }

  function handleMakeSS() {
    let sampleSheet = makeSampleSheets(files);
    console.log(sampleSheet)
    setSampleSheet(sampleSheet);
  }

  return (
    <div className="App">
      <div className="uploader flex-start-col">

        <h3 style={{ color: '#1F618D' }}>Select WPS submissions below</h3>
        {showInput ?
          <Input type="file" multiple onChange={handleChange} style={{ margin: '10px 0' }} /> :
          <div className="flex-start-row" style={{ margin: 10 }}><Spinner
            color="primary"
            type="grow"
          >
          </Spinner>
            <Spinner
              color="primary"
              type="grow"
            >
            </Spinner>
            <Spinner
              color="primary"
              type="grow"
            >
            </Spinner></div>
        }

        {files.map((file, i) => <p key={i} className="filename">{file.name}</p>)}

        {sampleSheet.length > 0 ? <p style={{ color: '#1F618D', fontSize: 22 }}>combined samples into {sampleSheet.length} flow cells</p> : null}
        <div className="flex-start-row">
          <Button outline onClick={handleClearFiles}>clear selections</Button>
          <Button outline onClick={handleMakeSS}>make SS</Button>
        </div>
        <div>
          {sampleSheet.map((flowCell, i) => {
            // only show the ones that have samples
            let hasSamples = false;
            flowCell.slice(6).map((sample, i) => {
              if (sample[4] !== '') {
                hasSamples = true;
              }
            });

            if (hasSamples) {
              return (
                <CSVDownloader
                  key={i}
                  class="download-button"
                  message={<span>{`Flow cell ${i + 1}`}<FontAwesomeIcon style={{ marginLeft: 4 }} icon={faDownload} /></span>}
                  fileName={`flowcell${i + 1}_${getDateString()}`}
                  data={flowCell}>
                </CSVDownloader>
              )
            } else {
              return null;
            }
          })}
        </div>
      </div>



    </div>
  );
}