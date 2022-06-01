import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import Button from '@mui/material/Button';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * COMMON MIME TYPES:
 * IMAGES: image/jpeg, image/png, image/gif
 * PDF: application/pdf
 * ZIP: application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip
 * RAR: application/vnd.rar, application/rar, application/octet-stream
 * TAR: application/x-tar
 * GZ: application/gzip
 * 7Z: application/x-7z-compressed
 * JSON: application/Id+json
 */

function Dropzone({active}) {

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip, application/vnd.rar, application/octet-stream'
  });

  const onClickHandler = () => {
    const data = new FormData();
    data.append('files', acceptedFiles[0], acceptedFiles[0].name);
    console.log('AXIOS DATA BEFORE: ', acceptedFiles[0]);
    axios.post("http://localhost:8881/load", data, { 
      headers: {
             'Access-Control-Allow-Origin': '*',
             'Content-Type': 'multipart/form-data'
           }
         }).then(res => {
          console.log('AXIOS RECEIVED: ', res.statusText);
          console.log('RESPONSE DATA : ', res.data);
          /**
          setTitle(`Upload Report: ${res.statusText}`);
          const getResponse = res.data;
          setRes(getResponse.data);
           */

          if(res.status === 200) {
            /**
            setSocket('uploads', null);
            setCode(res.status);
            setFiles(JSON.stringify([]));
             */
            console.log('RESPONSE STATUS : ', res.status);
          }
          // setFiles(JSON.stringify(getResponse.files));
          
         }).catch(err => {
          console.log('ERROR: ', err);
          /**
          setTitle('Upload Failed! Check file type please');
          setRes(err);
          setCode(522)
           */
         })
  }

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {Math.round(file.size / 1024)} kb
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {Math.round(file.size / 1024)} kb
      <ul>
        {errors.map(e => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: 'dropzone drop-zone-container clickable' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop file here, or click to select file</p>
        <em>(Only *.zip and *.rar file will be accepted)</em>
      </div>
      <aside>
        <h4 className="section-vertical-margin">Accepted file</h4>
        <ul className="drop-zone-files">{acceptedFileItems}</ul>

        <h4 className="section-vertical-margin">Rejected file</h4>
        <ul className="drop-zone-files">{fileRejectionItems}</ul>
      </aside>
      <div>
      </div>
      <div>
        <Button sx={{mt: 2, mb: 2}} variant="contained" disabled={(acceptedFiles.length < 1 && active) || (acceptedFiles.length > 0 && !active)?true: false} onClick={()=> {onClickHandler()}}>
            Upload
        </Button>
      </div>
    </section>
  );
}


export default Dropzone;