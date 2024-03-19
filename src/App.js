import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";
import Papa from 'papaparse';
import { initializePlate, makeSampleSheet } from './tools/helperFunctions'
import { Input, Form, Button } from 'reactstrap';

// these will be the ones to try first
const startingLocations = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12'];

export default function App() {

  const [files, setFiles] = useState([]);

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

  // function handleClearFiles() {
  //   setFiles([])
  // }

  function handleMakeSS() {
    console.log(files)
    makeSampleSheet(files)

  }

  return (
    <div className="App">
      <div className="uploader flex-start-col">
        <h3 style={{ color: '#1F618D' }}>Select all WPS submissions below</h3>
        <Input type="file" multiple onChange={handleChange} style={{ margin: '10px 0' }} />

        {files.map(file => <p className="filename">{file.name}</p>)}
        {/* <Button color="warning" onClick={handleClearFiles}>clear selections</Button> */}
        <Button color="primary" onClick={handleMakeSS}>make SS</Button>
      </div>



    </div>
  );
}