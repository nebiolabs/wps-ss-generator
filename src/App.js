import logo from './logo.svg';
import './App.css';
import React, { useState } from "react";
import Papa from 'papaparse';
import { initializePlate } from './tools/helperFunctions'
import SubmissionUploader from './components/SubmissionUploader';

export default function App() {

  const [files, setFiles] = useState();

  function handleChange(event) {
    setFiles(event.target.files[0]);

    console.log(event.target.files);
    console.log(event.target.files.length);


    for (let i = 0; i < event.target.files.length; i++) {
      Papa.parse(event.target.files[i], {
        complete: function (results) {
          console.log(`File ${i}`, results.data);
        }
      });
    }


  }

  return (
    <div className="App">
      <form>
        <h1>React File Upload</h1>
        <input type="file" multiple onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}