import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";
import Papa from 'papaparse';
import { initializePlate } from './tools/helperFunctions'
import { Input, Form, Button } from 'reactstrap';

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

  function handleClearFiles() {
    setFiles([])
  }

  function handleMakeSS() {
    console.log(files)
  }

  return (
    <div className="App">
      <div className="uploader flex-start-col">
        <h2 style={{ color: '#1F618D', fontFamily: 'Montserrat' }}>Load all WPS submissions below</h2>
        <Input type="file" multiple onChange={handleChange} style={{ margin: '10px 0' }} />

        {files.map(file => <p>{file.name}</p>)}
        {/* <Button color="warning" onClick={handleClearFiles}>clear selections</Button> */}
        <Button color="primary" onClick={handleMakeSS}>make SS</Button>
      </div>



    </div>
  );
}