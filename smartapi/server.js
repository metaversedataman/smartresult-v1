const express = require('express')
  , http = require('http')
  , https = require('https')
  , app = express();
  var cors = require('cors')
// const app = express();
const expressWs = require('express-ws')(app)
// const http = require('http')
const fs = require('fs')
var path = require("path")
const socket = require('socket.io')
const fileUpload = require('express-fileupload')
const archiver = require('archiver');
const Downloader = require('./components/Downloader')
const {Watcher} = require('./components/Watcher')
const {VerifyResults} = require('./components/VerifyResults')
const {Sleep, AutoTime, IsNumber, ReplaceAll, ReadFile, WriteFile, FileExists, DeleteFile, EmptyDirectory, DirectoryList} = require('./components/Functions')
const {Unzipper} = require('./uploads/Unzipper')
const {ReadWorkBooks} = require('./uploads/ExcelReader')
const {PdfGenerator} = require('./uploads/PdfGenerator')
const {HtmlGenerator} = require('./components/HtmlGenerator')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const hostname = process.env.WS;
const portApi = process.env.PORT_API || 3000;
const portHost = process.env.PORT_HOME || 80;
const hostEndpoint = hostname + ':' + portHost;
const hostnameLocal = process.env.HOSTNAME;
const hostEndpointLocal = hostnameLocal + ':' + portApi;
const pathWatchUploads = process.env.PATH_WATCH_UPLOADS;
const pathWatchResults = process.env.PATH_WATCH_RESULTS;
const pathWatchJson = process.env.PATH_JSON;
const pathJsonRaw = process.env.PATH_JSON + '/' + process.env.JSON_RAW_FILENAME;
const pathJsonResults = process.env.PATH_JSON + '/' + process.env.JSON_RESULTS_FILENAME;
const pathJsonPdfList = process.env.PATH_JSON + '/' + process.env.JSON_PDF_LIST_FILENAME;
const pathCodeTextFile = process.env.CODE_TEXT_FILE;
const pathTextFeedback = pathWatchResults + '/' + process.env.TEXT_FEEDBACK;
const codeTextFileDefault = '0';
const codeTextFileUnpackingInit = '240';
const codeTextFileUnpackingComplete = '241';
const codeTextFileResultInit = '242';
const codeTextFileResultRead = '250';
const codeTextFileFinalPdf = '254';
const codeTextFilePdfCompleted = '260';
const codeResultError = '556';
var downloadFolder = process.env.USERPROFILE + "/Downloads/"; // location on User's PC

const pathDownload = process.env.PATH_DOWNLOADS + process.env.DIR_TEMPLATES;
const pathDirUploads = process.env.DIR_UPLOADS;
let jsonDir = process.env.PATH_JSON;
jsonDir = jsonDir.split('/').pop();
let pathHtml = process.env.DIR_HTML;
pathHtml = pathHtml.split('/').pop();
const pathResult = process.env.PATH_DOWNLOADS + process.env.DIR_RESULTS;
// const pathResultListDir = process.env.PATH_WATCH_RESULTS;
const pathTemplateKeys = pathDownload + process.env.FILE_XLSX_KEYS;
const pathTemplatePool = pathDownload + process.env.FILE_XLSX_POOL;
const pathTemplateStudents = pathDownload + process.env.FILE_XLSX_STUDENT;
const pathTemplateSubjects = pathDownload + process.env.FILE_XLSX_SUBJECTS;
const pathZipResult = pathResult + process.env.FILE_ZIP_RESULTS;
const htmlType1 = pathDirUploads + '/' + pathHtml + '/' + process.env.HTML_TYPE1;
const htmlType2 = pathDirUploads + '/' + pathHtml + '/' + process.env.HTML_TYPE2;
const htmlType3 = pathDirUploads + '/' + pathHtml + '/' + process.env.HTML_TYPE3;
const cssType1 = pathDirUploads + '/' + pathHtml + '/' + process.env.CSS_TYPE1;
const cssType2 = pathDirUploads + '/' + pathHtml + '/' + process.env.CSS_TYPE2;
const cssType3 = pathDirUploads + '/' + pathHtml + '/' + process.env.CSS_TYPE3;
const pathJsonPdfContent = pathDirUploads + '/' + jsonDir + '/' + process.env.JSON_PDF_CONTENT;
const aliasPublic = process.env.ALIAS_PUBLIC;
const aliasAvatar = process.env.ALIAS_AVATAR;
const pathPublic = process.env.DIR_PUBLIC;
const pathAvatar = process.env.DIR_AVATAR;

const typeStudents = process.env.TYPE_STUDENTS;
const typeSubjects = process.env.TYPE_SUBJECTS;
const typeKeys = process.env.TYPE_KEYS;
const typePool = process.env.TYPE_POOL;

const endpointSubjects = process.env.ENDPOINT_SUBJECTS;
const endpointStudents = process.env.ENDPOINT_STUDENTS;
const endpointKeys = process.env.ENDPOINT_KEYS;
const endpointPool = process.env.ENDPOINT_POOL;
const endpointResults = process.env.ENDPOINT_RESULTS;
const endpointLoad = process.env.ENDPOINT_LOAD;
const endpointHtml = process.env.ENDPOINT_HTML;

let stopWatcher = false;


// App and server
// let app = express();

// Add Access Control Allow Origin headers

let server = http.createServer(app);
// let secure = https.createServer(app);

const io = socket(server,{
  cors: {
    origin: hostEndpoint,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['emexrevolarter']
  },
  transports: ['websocket'],
  maxHttpBufferSize: 1e8,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 1000,
  reconnectionAttempts: 10,
  forceNew: true,
  timeout: 1000 * 60 * 5
});

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessSatatus: 200
}

app.use(cors(corsOptions));

console.log('SERVER IS WORKING FINE');

io.on('connection', client => {
  // setInterval(myTimer, 1000);

  function myTimer() {
    const d = new Date();
    return d;
  }


  console.log('You are connected to SERVER as id: ' + client.id);

  client.on('query', query => {
    // validate all requests
    try {
      var getId = query.id;
      var getCode = query.code;
      var getArgs = query.args;

      if(Number(getArgs) && getArgs > 0) {
        console.log('CODE RECEIVED: ', getCode);
      }

      if(getId == hostname) {
        // process only valid requests
        // return wait signal
          let setView = [];
          let dataFromFile = ReadFile(pathCodeTextFile);
          let setCode = Number(codeTextFileDefault);

        if(getCode == null || getCode == undefined) {
          client.emit('query', {data: 'In a moment please', title: 'Processing request...', code: 200, next: false, view: JSON.stringify(setView)});
        }
          
        
        // check if results requested on first render
        if(getCode == 'results-discovery') {
          console.log('=====================================');
          console.log('==== RESULT DISCOVERY INITIATED! ====');
          let setData = null;
          let setTitle = null;
                      
          let getDirs, getFiles, pdfList = [];
          let getDirList = {files: [], dirs: []}; 
          getDirList = DirectoryList(pathWatchResults);
          getDirs = getDirList.dirs;
          if(getDirs.length > 0) {
            const dirName = getDirs[0];
            getDirList = DirectoryList(dirName);
            getFiles = getDirList.others;

            getDirs.map(f => {
              const getThisList = DirectoryList(f);
              const getThisFiles = getThisList.others;
              getThisFiles.forEach(element => {
                const thisFile = element.split('\\').pop();
                pdfList.push(thisFile)
              });
            })
          }

          if(getFiles.length > 0) {
            setData = 'Previously generated Results are available for download';
            // const getPdfListRaw = ReadFile(pathJsonPdfList);
            // const getPdfList = JSON.parse(getPdfListRaw);
            setView = [...pdfList];
            setTitle = `${pdfList.length} Student${pdfList.length > 1?'s':''} Results detected`;
            setCode = 260;
          } else {
            setCode = 200;
            setData = 'You may load New Sheets to generate your Results.';
            setTitle = 'No Result is available now';
          }
          console.log(setTitle);
          console.log(setData);
          console.log('=====================================');

          client.emit('query', {data: setData, title: setTitle, code: setCode, next: false, view: JSON.stringify(setView)});
        }

        // download templates
        /**
         * Request for download at Client disable for Socket.io
         * Only through GET
         */
      let filePath = null;
      let tagName = null;
      let fPath = null;
      
        if(getCode == 'template-subjects') {
          filePath = pathTemplateSubjects;
          fPath = `${__dirname}${pathTemplateSubjects}`;
          tagName = getCode.substring(8, getCode.length);
          console.log('SERVER: ' + getCode + ' | Downloading ' + tagName + ' Template file...');
          client.emit('query', {data: null, title: 'Downloading ' + tagName + ' Template file...', code: 210, next: true, view: JSON.stringify(setView)});
        }
        if(getCode == 'template-students') {
          filePath = pathTemplateStudents;
          fPath = `${__dirname}${pathTemplateStudents}`;
          tagName = getCode.substring(8, getCode.length);
          console.log('SERVER: ' + getCode + ' | Downloading ' + tagName + ' Template file...');
          client.emit('query', {data: null, title: 'Downloading ' + tagName + ' Template file...', code: 210, next: true, view: JSON.stringify(setView)});
        }
        if(getCode == 'template-keys') {
          filePath = pathTemplateKeys;
          fPath = `${__dirname}${pathTemplateKeys}`;
          tagName = getCode.substring(8, getCode.length);
          console.log('SERVER: ' + getCode + ' | Downloading ' + tagName + ' Template file...');
          client.emit('query', {data: null, title: 'Downloading ' + tagName + ' Template file...', code: 210, next: true, view: JSON.stringify(setView)});
        }
        if(getCode == 'template-pool') {
          filePath = pathTemplatePool;
          fPath = `${__dirname}${pathTemplatePool}`;
          tagName = getCode.substring(8, getCode.length);
          console.log('SERVER: ' + getCode + ' | Downloading ' + tagName + ' Template file...');
          client.emit('query', {data: null, title: 'Downloading ' + tagName + ' Template file...', code: 210, next: true, view: JSON.stringify(setView)});
        }

        if(filePath != null && tagName != null && getCode != null) {
            const useFilePath = `${hostEndpointLocal}${endpointSubjects}`;
            const fileName = downloadFolder + getCode + '.xlsx';
            let isNext = true;

            const downloadCallBack = (status, detail, p) => {
              let cumDetail = null;
              if(p == 211) {
                cumDetail = detail
              }
              else if(p == 212) {
                cumDetail = detail + ' See the file at: "' + fileName + '"';
                isNext = false
              }
              else if(p == 213) {
                cumDetail = 'Something went wrong! ' + detail;
                isNext = false;
              }
              client.emit('query', {data: cumDetail, title: tagName + ' Template file: ' + status, code: p, next: isNext, view: JSON.stringify(setView)});
            }

            Downloader(useFilePath, fileName, downloadCallBack)
        }

        // upload file for result generation
        // dir watcher initiated
        if(getCode == 'uploads') {
          console.log('SERVER: ' + getCode + ' | Uploading files to generate results');
          // declare variable
          let setData = null;
          let setTitle = 'Extracting file...';
          let setCbTitle = null;
          setCode = 220;
          let setNext = true;
          let setView = [];
          let toFindPath = false;
          let extractOnce = true;
          let uploadedZip = null;
          // const setPath = pathWatchUploads + '\\' + zipFileName;

          // initiate watcher for directory
          const unzipCb = (rTxt, rPrompt, wCode) => {
            try {
              setCbTitle = rTxt;
              setData = rPrompt != null? rPrompt: setData;
              setCode = wCode;
              setNext = true;

              // write to code text file if unpacked zip
                console.log('TEST UNPACKING FILE:', setCode + ' | ' + dataFromFile);
              if(setCode === Number(codeTextFileUnpackingComplete)) {
                console.log('UNPACKING FILE IS COMPLETED!', setCode + ' | ' + dataFromFile);
                setTitle = 'Clean-up of uploaded file initiating...';
                setView.unshift(`Unpacking ${dataFromFile} is completed!`); 
              }
            } catch (error) {
              console.log('ERROR ON UNPACKING: ', error);
              setCbTitle = 'Something went wrong!';
              setData = error;
              setNext = false;
            }
            console.log('=== UNZIP FUNCTION ===', rTxt + ' | ' + rPrompt + ' | ' + wCode);
            client.emit('query', {data: setData, title: setCbTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
          }

          const wacthDir = (rTxt, wPath) => {
            setCode = Number(codeTextFileUnpackingInit);
            setView.unshift(rTxt);
            
            try {
              if(wPath != null && extractOnce) {
                var pPath = wPath.replace('\\', '/');
                var arr_split = pPath.split('\\');
                var arr_len = arr_split.length;
                console.log(' == ARR LEN == ', arr_len-1);
                var last_part = arr_split[arr_len-1];

                if(last_part.includes('.zip')) {
                  lPart = last_part.split('.').pop();
  
                // if(last_part.substring(-4) == '.zip') {
                  if(lPart == 'zip') {
                    uploadedZip = last_part;
                    toFindPath = true;
                  }
                } else {
                  toFindPath = false;
                }
              }
              
            } catch (error) {
              toFindPath = false;
              console.log('ERROR ON WATCHER: ', error);
            }

            if(toFindPath === true) {
              setTitle = setCbTitle == null?'Unpacking file...': setCbTitle;
  
            // unzip uploaded file
            // if(setCode === Number(codeTextFileUnpackingInit)){
                const getRoot = pathWatchUploads.substring(1, pathWatchUploads.length);
                console.log('======== getRoot =======: ', getRoot);
                dataFromFile = ReadFile(pathCodeTextFile);
                console.log('dataFromFile: ', dataFromFile + ' | ' + uploadedZip);
                if(dataFromFile === codeTextFileDefault && uploadedZip != null){
                  const zipPath = pathWatchUploads + '/' + uploadedZip;
                  console.log('ZIP PATH: ', zipPath + ' | ' + FileExists(zipPath));
                  if(FileExists(zipPath)) {
                    Unzipper(getRoot, uploadedZip, unzipCb);
                    WriteFile(pathCodeTextFile, uploadedZip);
                  }
                  // FileExists(zipPath) && Unzipper(getRoot, uploadedZip, unzipCb);
                }
              // }
            }

            client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
          }

          dataFromFile = ReadFile(pathCodeTextFile);
          const zipPath = pathWatchUploads + '/' + dataFromFile;
          const zipCallback = (res, completed) => {
            setView.unshift(res);

            if(completed) {
              if(FileExists(zipPath)) {
                console.log('=== DELETED UPLOADED FILE ===: ', dataFromFile);
                DeleteFile(zipPath);
                WriteFile(pathCodeTextFile, codeTextFileResultInit);
                setCode = Number(codeTextFileResultInit);
                setData = 'Requesting to check extracted files...';
                setView.unshift(`${dataFromFile} was removed`);
                
                dataFromFile = ReadFile(pathCodeTextFile);
                completed = false;
                client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
              }
            }

          }

          if(dataFromFile.split('.').pop() == 'zip') {
            Unzipper(pathWatchUploads, dataFromFile, zipCallback);
          }

          // unpacking complete
          /**
            dataFromFile = ReadFile(pathCodeTextFile);
            console.log('=== UNPACKING STATUS ===', dataFromFile + ' | ' + uploadedZip);
          if(dataFromFile === uploadedZip) {
            console.log('=== UNPACKING COMPLETED ===', uploadedZip);
            setView.unshift('Unpacking completed!');
            setCode = codeTextFileUnpackingComplete;     
            client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
          }
           */
          

          // Watcher(pathWatchUploads, wacthDir, 510000);
          

          

          /**
          Sleep(2000).then(() => {
            setView.unshift('Fourth line');           
            client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
          });
           */

          // return result
          // client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
        }

          // generate Results
        if(getCode == 'validate-results') {
          // declare variable
          let setData = null;
          let getErrors = [];
          let setTitle = 'Results Validation...';
          dataFromFile = ReadFile(pathCodeTextFile);
          setCode = Number(dataFromFile);
          let setView = [];
          let setNext = true;
          let getResult = {};
          //console.log('RESULTS: ', setTitle);
          
          if(setCode == Number(codeTextFileResultInit)) {
            getResult = ReadWorkBooks(pathWatchUploads);
            getErrors = getResult.errors;

            if(getErrors.length > 0) {
  
              setView = getErrors;
              setData = 'Result Processing was interrupted due to Error';
              setTitle = `Result: ${getErrors.length} Error${getErrors.length > 1? 's': ''} found!`;
              setCode = Number(codeResultError);
                  
              client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
            } else {
              console.log('==============    ***     ================');
              console.log('============== EXCEL DATA ================');
              console.log('========== FROM EXCEL SHEETS ==============');
              console.log('=== (SAMUEL ADEGBITE ANGLICAN COLLEGE) ====');
              console.log('==========================================');
              //console.log('EXCEL DATA: ', getResult);
  
              setView.unshift('Results generation initiating...');
              setData = 'Processing the available files...';
  
                  
              WriteFile(pathCodeTextFile, codeTextFileResultRead.toString());
              // client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});

              WriteFile(pathJsonRaw, JSON.stringify(getResult));
              setCode = Number(codeTextFileResultRead);
              setData = 'Saving data map for use in next stage';
              setView.unshift('General Data Map was generated');
              setView.unshift('Initiating Result Verification...');
                            
            Sleep(2000).then(() => {
              client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
            });
            }
            
          }
        }

        if(getCode == 'verify-results') {
          // declare variable
          dataFromFile = ReadFile(pathCodeTextFile);
          if(dataFromFile == codeTextFileResultRead) {
          let setData = null;
          let setTitle = 'Results Verification...';
          setCode = 251;
          let setView = [];
          let setNext = true;
          const getJson = ReadFile(pathJsonRaw);
          const getResult = JSON.parse(getJson);
          let verifyStart = false;
          let processCounter = 0;
          let resList = [];
          
          client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});

          const cbValidate = (res, resultError, resultFeedback, completed, resultList) => {
            (!resList.includes(res)) && (processCounter = processCounter + 1);
              if(!verifyStart) {
                console.log('========== RESULT VERIFICATION INITIATED ===========');
                setData = 'Checking Data integrity & compartibility';
                setView.unshift('=== RESULT VERIFICATION INITIATED ===');
                setView.unshift('Peforming final checks before Result computation and PDF generation');
                verifyStart = true
              } else {
                if(!resList.includes(res)){                  
                  setView.unshift(res);
                  console.log(res)
                }
              }
              resList.unshift(res);

              if(resultError.length > 0) {
                setTitle = `Verification Error${resultError.length > 1?'s':''} (${resultError.length})!`;
              } else {
                setTitle = `Verification Processing... (${processCounter})`;
              }

              if(completed){
                console.log('Result Feedback', resultFeedback.length);
                console.log('Result Error: ', resultError.length);
                console.log('========== RESULT VERIFICATION COMPLETED ===========');

                if(resultFeedback.length > 0) {
                  setView.unshift(`Note the following non errors: ${resultFeedback.toString()}`);
                  if(!FileExists(pathTextFeedback)) {
                    const joined = resultFeedback.join('\n');
                    WriteFile(pathTextFeedback, joined)
                  }
                }
                if(resultError.length < 1) {
                  setTitle = `Verification Completed (${processCounter})`;
                  setData = 'Initiating Result Computation...';
                  setCode = Number(codeTextFileFinalPdf);
                  WriteFile(pathJsonResults, JSON.stringify(resultList));
                } else {
                  setTitle = `Verification Error${resultError.length > 1?'s':''} (${resultError.length})!`;
                  setData = 'Check the supplied files and correct the indicated errors';
                  setNext = false;
                  setCode = Number(codeResultError);
                  setView = [...resultError, ...setView];
                }
                setView.unshift('=== RESULT VERIFICATION COMPLETED ===');
                WriteFile(pathCodeTextFile, setCode.toString());
                client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: setCode, view: JSON.stringify(setView)});
              }
              (!resList.includes(res)) && client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
          }

          if(getResult.settings.isVerify == '0') { //TODO: Get result json without verification, & write to file: pathJsonResults

            setData = 'Aborted Checking Data integrity & compartibility';
            setView.unshift('You wish Result Verification stage is skipped.');
            setView.unshift('Moving to Result computation and PDF generation...');
            setCode = Number(codeTextFileFinalPdf);
            WriteFile(pathCodeTextFile, setCode.toString());
  
            client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: setCode, view: JSON.stringify(setView)});
          } else {

            /**
            setData = 'Checking Data integrity & compartibility';
            setView.unshift('Peforming final checks before Result computation and PDF generation');
  
            client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
           */

            VerifyResults(getResult, cbValidate);

            /**
            const resultFeedback = resultData.feedback;
            const resultError = resultData.error;
            console.log('-----==== VERIFY ====-----');
            console.log('Result Feedback', resultFeedback.length);
            console.log('Result Error: ', resultError.length);

            setView = [...resultError];
            if(resultFeedback.length > 0) {
              setView.unshift(`Note the following non errors: ${resultFeedback.toString()}`);
            }
            if(resultError.length < 1) {
              setCode = Number(codeTextFileFinalPdf);
              WriteFile(pathCodeTextFile, setCode.toString());
              WriteFile(pathJsonResults, JSON.stringify(resultData));
            } else {
              setTitle = `Verification Error${resultError.length > 1?'s':''} (${resultError.length})!`;
              setData = 'Check the supplied files and correct the indicated errors';
              setNext = false;
              setCode = Number(codeResultError);
            }
            
            console.log('==== CODE A: ', setCode);
            Sleep(2000).then(() => {
              console.log('==== TITLE: ', setTitle);
              console.log('==== CODE B: ', setCode);
              client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
            })
             */
          }

        }
        }

        if(getCode == 'compute-result') {
          // declare variable
          let setData = null;
          let setTitle = 'Results Computation...';
          let setArgs = getArgs;
          // dataFromFile = ReadFile(pathCodeTextFile);
          // setArgs = Number(dataFromFile);
          setCode = 'compute-result';
          let setView = [];
          let setNext = true;
          let countTerms = [];
          let getPdfList = [];
          let getClassName, getSessionName;
          let isCompleted = false;
          
          // if(getArg > 0) {

            // Final Result computation
            const getJson = ReadFile(pathJsonResults);
            // const getCtrl = ReadFile(pathJsonCtrl);
            const getResultObject = JSON.parse(getJson);
            getResult = getResultObject;
            const totalResults = getResult.firstTerm.length + getResult.secondTerm.length + getResult.thirdTerm.length;

            if(setView.length < 1 && getResult != null) {
              setData = 'PDFs for Students Results initiating...';
              setView.unshift('Reading saved data...');
              client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: null, view: JSON.stringify(setView)});
            }

          Sleep(2000).then(() => {

            if(getResult != null) {          
              setData = 'Students Results will be ready in a moment';
              client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: setArgs, view: JSON.stringify(setView)});
            }

            const wacthFiles = (dataObj, completed) => {
              try {

                if(dataObj != null) {
                  const file = dataObj.file;
                  const className = dataObj.class;
                  const termName = dataObj.term;
                  const sessionName = dataObj.session;
                  let pdfList = dataObj.list;
                  const pdfMessage = dataObj.message;
                  isCompleted = completed;

                  if(getResult != null) {
  
                    if(pdfList.length < 2){
                      setData = 'Saving PDFs to downladable files...';
                    }
  
                    if(className != null && termName != null && sessionName != null) {
                      setTitle = `${pdfList.length} Result PDF${pdfList.length > 1?'s':''}...`;

                      if(pdfMessage != null) {
                        setView.unshift(pdfMessage)
                      } else {
                        setView.unshift(file);
                      }

                      if(!countTerms.includes(termName)) {
                        countTerms.push(termName)
                      }
                      getClassName = className;
                      getSessionName = sessionName;
                      getPdfList = [...pdfList];
  
                      // setCode = -1000 - pdfList.length;
                      // console.log('PDF PROGRESS: ', `${pdfList.length} Result PDF${pdfList.length > 1?'s':''}... ${setCode}`);
                    
                      // when all PDFs are created
                      if(pdfList.length > 0 && isCompleted) {
                        pdfList.length = 0;                   
                        let getDirs, getFiles = [];
                        let getDirList = {files: [], dirs: []}; 
                        getDirList = DirectoryList(pathWatchResults);
                        getDirs = getDirList.dirs;
                        if(getDirs.length > 0) {
                          const dirName = getDirs[0];
                          getDirList = DirectoryList(dirName);
                          getFiles = getDirList.others;
              
                          getDirs.map(f => {
                            const getThisList = DirectoryList(f);
                            const getThisFiles = getThisList.others;
                            getThisFiles.forEach(element => {
                              const thisFile = element.split('\\').pop();
                              pdfList.push(thisFile)
                            });
                          })
                          getPdfList = [...pdfList]
                        }

                      if(pdfList.length > 0){
                      setTitle = setTitle.replace('...', ' [completed]');
                      setData = 'Result Download button is Active. You may click it now.';
                      setView.unshift('=== PDF GENERATION COMPLETED ===');
                      setView.unshift(`A total of ${getPdfList.length} students' Results were generated`);
                      WriteFile(pathJsonPdfList, JSON.stringify(getPdfList));

                      // set donwload button active
                      setCode = Number(codeTextFilePdfCompleted);
                      setNext = false;
                      getResult = null;
                      let termString = countTerms.toString();
                      termString = ReplaceAll(termString, '-term', '');
                      termString = ReplaceAll(termString, ',', '-');
                      const addTxt = `${getClassName} _${termString} Term${countTerms.length>1?'s':''} (${getSessionName})`;
                      WriteFile(pathCodeTextFile, addTxt);
                      console.log('======== PDF GENERATION ENDS ================');
                      client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: setArgs, view: JSON.stringify(setView)});
                      }
                    }
  
                        client.emit('query', {data: setData, title: setTitle, code: setCode, next: setNext, args: setArgs, view: JSON.stringify(setView)});
                      }
                  }

                }
                
              } catch (error) {
                console.log('ERROR ON WATCHER: ', error);
              }
            }
            
          

            if(getResult !== null) {
              PdfGenerator(getResult, wacthFiles)
            }

            // Watcher(pathWatchResults, setCode, wacthDir, 10000);
          });
          // }
        }


      }
    } catch (error) {
      client.emit('query', {data: 'Something went wrong. Try again. === ' + error, title: 'Invalid Request! ', code: 404, next: false, view: []})
    }
  })

  client.on('disconnect', () => {
    console.log('SERVER: Disconnected');
    client.emit('is-connected', {data: 'Please, check your connection or if server is still running', title: 'Server is Disconnected!', code: 505, next: false, view: []});
  })
});



server.listen(portApi, () =>{
  console.log('Server listens on port 8881')
});

// Apply expressWs
// expressWs(app, io);

// app.use(express.static(__dirname + '/views'));

/**
app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});
 */

// serve static files
app.use(`/${aliasPublic}`, express.static(pathPublic));
app.use(`/${aliasAvatar}`, express.static(pathAvatar));
app.use('/templates', express.static('downloads/templates'));
app.use('/results', express.static('downloads/results'));

// Get the route / 
app.get('/', (req, res) => {
    res.status(200).send("Welcome to Smart Result API. Kindly close this window.");
});

const initDownload = (type, getRes, list) => {
  // getRes.download(filePath)
  let apiResCode = 500;
  let sendRes = {
    data: null,
    info: list,
    message: null
  }

  let filePath = null;
      switch (type) {
        case endpointSubjects:
          filePath = pathTemplateSubjects;
          break;
        case endpointStudents:
          filePath = pathTemplateStudents;
          break;
        case endpointKeys:
          filePath = pathTemplateKeys;
          break;
        case endpointPool:
          filePath = pathTemplatePool;
          break;
        case endpointResults:
          filePath = pathZipResult;
          break;
      
        default:
          break;
      }

    (async() => {
      console.log(`SERVER: external request for templates: ${type}`);

      if(filePath != null) {
        let filename;

          filePath = `.${filePath}`;
          filePath = filePath.replace(/\\/g, '/');
          if(type == endpointResults) {
            filename =  list;
          } else {
            filename = filePath.split('/').pop();
          }

        const buf = fs.readFileSync(filePath, {encoding: 'base64'});
        // const b64 = buf.toString('base64');
        // console.log('BUFFER/A', buf);
        apiResCode = 200;
        sendRes.data = buf;
        sendRes.info = filename;
        sendRes.message = `Downloading ${filename}...`;
      } else {
        sendRes.data = null;
        sendRes.message = 'Requested File could not be found';
      }
      getRes.status(apiResCode).send(JSON.stringify(sendRes))
    })()
}

app.get(endpointSubjects, (req, res) => {
  initDownload(endpointSubjects, res, null)
});

app.get(endpointStudents, (req, res) => {
  initDownload(endpointStudents, res, null)
});

app.get(endpointKeys, (req, res) => {
  initDownload(endpointKeys, res, null)
});

app.get(endpointPool, (req, res) => {
  initDownload(endpointPool, res, null)
});

app.get(endpointResults, (req, res) => {
    console.log("SERVER: external request for results");
    let apiResCode = 500;
    let sendRes = {
      data: null,
      info: null,
      message: null
    }
    if(FileExists(pathCodeTextFile)) {
      const getTxt = ReadFile(pathCodeTextFile);
      const filename = getTxt + ' Students Results.zip';
      console.log(`Creating ZIP: ${filename}`);

      // create zip file (sourceName)
      var baseDir = __dirname + pathWatchResults.replace('.', '');
      var zipfile = __dirname + pathZipResult; //directories to zip

      var archive = archiver.create('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });
      archive.on('error', function(err){
          // throw err;
        sendRes.message = `ZIP FAILURE! ${filename} couldn't be created`;
      });

      var output = fs.createWriteStream(zipfile); //path to create .zip file
      output.on('close', function() {
        console.log("STUDENT RESULTS ZIP FILE was created on the Server");
        initDownload(endpointResults, res, filename)
          // console.log(archive.pointer() + ' total bytes');
          // console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      archive.pipe(output);

      archive.directory(baseDir, false);

      archive.finalize();

    } else {
      sendRes.message = `ERROR! Something went wrong.`;
    }

    if(sendRes.message != null) {
      res.status(apiResCode).send(JSON.stringify(sendRes))
    }
});

// upload files
app.use(fileUpload());

app.post(endpointLoad, (req, res) => {
  console.log("SERVER: external request to upload sheets");
  
  let addedText = '';
  let getDirList, getDirListB = {files: [], dirs: []};
  let getFiles, getFilesB = [];
  let getDirs, getDirsB = [];
  let getJList = {files: [], dirs: [], others: []};
  let getJFiles = [];


  // delete previous files in watched dir
  getDirList = DirectoryList(pathWatchUploads);
  getFiles = getDirList.files;
  getDirs = getDirList.dirs;
  if(getFiles.length > 0 || getDirs.length > 0) {
    const fSuffix = getFiles.length > 0? 's': '';
    const dSuffix = getDirs.length > 0? 's': '';
    addedText = 'Also, Previous uploads: ';
    addedText = addedText + ' ' + `${getDirs.length} dir${dSuffix} & ${getFiles.length} file${fSuffix}; were removed!`;
    console.log('======== PREVIOUS UPLOADS: =======:', addedText);
  }

  // delete previous files in result dir
  getDirListB = DirectoryList(pathWatchResults);
  getFilesB = getDirListB.files;
  getDirsB = getDirListB.dirs;

  if(getFilesB.length > 0 || getDirsB.length > 0) {
    const fSuffix = getFilesB.length > 0? 's': '';
    const dSuffix = getDirsB.length > 0? 's': '';
    addedText = addedText + ' ' + 'Also, Previous Results: ';
    addedText = addedText + ' ' + `${getDirsB.length} dir${dSuffix} & ${getFilesB.length} file${fSuffix}; were removed!`;
    console.log('======== PREVIOUS RESULTS: =======:', addedText);
  }

  
  if(getFiles.length > 0 || getDirs.length > 0) {
    EmptyDirectory(pathWatchUploads, false);
  }

  if(getFilesB.length > 0 || getDirsB.length > 0) {
    EmptyDirectory(pathWatchResults, false);
    EmptyDirectory('.' + pathResult, false);
  }

  // delete previous files in JSON dir
  getJList = DirectoryList(pathWatchJson);
  getJFiles = getJList.others;
  console.log('JSON LIST: ', getJList);
  if(getJFiles.length > 0) {
    EmptyDirectory(pathWatchJson, false);
  }

  // upload file
  let dirPath = pathWatchUploads + '/';
  dirPath = dirPath.substring(1, dirPath.length);
  
  let sampleFile;
  let uploadPath;
  
  let setContent, setData, setTitle, setCode, fileUploadedName;
  let appData = [];

  if (!req.files || Object.keys(req.files).length === 0) {
    // return res.status(400).send('No files were uploaded.');
    setContent = `No file was uploaded! May be you tried uploading empty field`;
    appData.unshift(setContent);
    setData = `Sorry, try again`;
    setTitle = 'No Upload!';
    setCode = 522;
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.files;
  uploadPath = __dirname + dirPath + sampleFile.name;
  fileUploadedName = req.files.files.name;

  // Use the mv() method to place the file somewhere on your server
  // dataFromFile = ReadFile(pathCodeTextFile);
  (sampleFile != null) && sampleFile.mv(uploadPath, function(err) {
    if (err) {
      // return res.status(500).send(err);
      setContent = `Error found! ${err}`;
      appData.unshift(setContent);
      setData = `An Error occured while uploading ${fileUploadedName}`;
      setTitle = 'File Upload Error!';
      setCode = 522;
      console.log('ERROR ON UPLOADING FILE: ', err)
    } else {
      // delete previous uploads
      try {
        getDirList = DirectoryList(pathWatchUploads);
        getFiles = getDirList.files;
        getDirs = getDirList.dirs;
        console.log('====== DIRRECTORY LISTING ======   Dirs:', getDirs.length + ' | files: ' + getFiles.length);
        console.log('====  CONDITIONALS ====   getFiles > 0 || getDirs > 0 >>>', getFiles.length + ' | ' + getDirs.length);

        WriteFile(pathCodeTextFile, codeTextFileDefault);
      } catch (error) {
        setContent = `Error found! ${error}`;
        appData.unshift(setContent);
        setData = `An Error occured while uploading ${fileUploadedName}`;
        setTitle = 'File Upload Error!';
        setCode = 522;
        console.log('ERROR ON REMOVE PREVIOUS UPLOADS: ', error)
      }
      
      setContent = `${fileUploadedName} was uploaded successfully. ${addedText}`;
      setData = 'File upload was successful';
      setTitle = 'File Uploaded...';
      setCode = 201;
      appData.unshift(setContent);
      WriteFile(pathCodeTextFile, fileUploadedName);
      /**
      const axiosData = {
        files: [req.files.files.name],
        data: setContent
      }
      res.status(200).send(JSON.stringify(axiosData));
       */
      io.emit('query', {data: setData, title: setTitle, code: setCode, next: true, view: JSON.stringify(appData)});
    }
  });
});

// test HTML Template
app.get(endpointHtml, (req, res) => {
  let html;
  if(FileExists(pathJsonPdfContent)) {
    const getJson = ReadFile(pathJsonPdfContent);
    const data = JSON.parse(getJson);
    const getHtml = ReadFile(htmlType1);
    html = HtmlGenerator(data, getHtml);
  
    res.status(200).send(html);
  } else {
    html = `<h1>YOU NEED TO FIRST GENEARATE RESULT TO VIEW THE PDF PREVIEW</h1>`;
    res.status(200).send(html);
  }
})