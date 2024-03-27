import './App.css';
import React, { useState, useEffect } from "react";
import Papa from 'papaparse';
import { makeSampleSheet } from './tools/helperFunctions'
import { Input, Button, Spinner } from 'reactstrap';

export default function App() {

  const [files, setFiles] = useState([]);
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    console.log(files);
  }, [files]);

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
    setShowInput(false);
    setTimeout(() => {
      setShowInput(true);
    }, 500)
  }

  function handleMakeSS() {
    console.log(files)
    makeSampleSheet(files)

  }

  return (
    <div className="App">
      <div className="uploader flex-start-col">
        <h3 style={{ color: '#1F618D' }}>Select all WPS submissions below</h3>
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
        <div className="flex-start-row">
          <Button color="warning" onClick={handleClearFiles}>clear selections</Button>
          <Button color="primary" onClick={handleMakeSS}>make SS</Button>
        </div>
      </div>



    </div>
  );
}