import React, { useState, useCallback, useRef, useEffect, useReducer} from 'react'
import {io} from "socket.io-client";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import FaceIcon from '@mui/icons-material/Face';
import SubjectIcon from '@mui/icons-material/Subject';
import KeyIcon from '@mui/icons-material/Key';
import ListIcon from '@mui/icons-material/List';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import StarIcon from '@mui/icons-material/Star';
import b64ToBlob from "b64-to-blob";
import fileSaver from "file-saver";
import axios from 'axios';

import DropZone from './Upload';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


// const HOSTNAME_HTTP = 'http://localhost';
// const PORTHOME = '8880';
// const PORTAPI = '8881';
const HOSTNAME_WS = process.env.REACT_APP_HOSTNAME_WS;
const HOSTNAME_HTTP = process.env.REACT_APP_HOSTNAME_HTTP;
const PORTHOME = process.env.REACT_APP_PORT_HOME;
const PORTAPI = process.env.REACT_APP_PORT_API;
const ENDPOINT_WS = HOSTNAME_WS + ':' + PORTAPI;
// const ENDPOINT_WS = 'ws://localhost:8881';
const ENDPOINT_HTTP = HOSTNAME_HTTP + ':' + PORTAPI;
const ORIGIN = HOSTNAME_WS + ':' + PORTHOME;
const appId = HOSTNAME_WS;

const ENDPOINT_SUBJECTS = process.env.REACT_APP_ENDPOINT_SUBJECTS;
const ENDPOINT_STUDENTS = process.env.REACT_APP_ENDPOINT_STUDENTS;
const ENDPOINT_KEYS = process.env.REACT_APP_ENDPOINT_KEYS;
const ENDPOINT_POOL = process.env.REACT_APP_ENDPOINT_POOL;
const ENDPOINT_RESULTS = process.env.REACT_APP_ENDPOINT_RESULTS;

const snackbarTypeInfo = 'info';
const snackbarTypeSuccess = 'success';
const snackbarTypeWarning = 'warning';
const snackbarTypeError = 'error';

// stripe API of extra string
const extra_string = '/socket.io/?EIO=4&transport=websocket';



const ButtonComponent = () => {
    const refSocket = useRef(null);
    const refLoading = useRef(false);
    const refOpen = useRef(false);
    const refCtrlPanel = useRef(0);
    const refSeverity = useRef(snackbarTypeInfo);
    const refCode = useRef(0);
    const refConnected = useRef(true);
    const refConnectionCounter = useRef(0);
    const refNetwork = useRef(true);
    const refResponse = useRef(null);
    const refPulseText = useRef(null);
    const refPrevStateTemplate = useRef(true);
    const refPrevStateSheet = useRef(true);
    const refPrevStateDownload = useRef(false);
    const refPrevStateCtrl = useRef(0);
    const refPrevResponse = useRef(null);
    const refPrevCode = useRef(0);
    const refStateRestrictCount = useRef(0);
    const refPanelView = useRef([]);
    const refTemplateActive = useRef(true);
    const refSheetActive = useRef(true);
    const refDownloadActive = useRef(false);
    const refForced = useRef(false);
    const refLiveSwitch = useRef(false);
    const [downloading, setDownloading] = useState(null);
    const [,doForcedApp] = useState(refForced.current);
    const [,doForcedButton] = useState(refCtrlPanel.current);
    const [,doForcedToggle] = useState(!refConnected.current);
    const [,doForcedNetwork] = useState(!refNetwork.current);
    const [, doForcedOpen] = useState(refOpen.current);
    const setForcedApp = () => {
        console.log('FORCED COMPARE: ', refResponse.current + ' | ' + refPrevResponse.current)
        if((refResponse.current !== refPrevResponse.current && refResponse.current != null) || 
            (refCode.current !== refPrevCode.current && refCode.current != 0)) {
            refPrevResponse.current = refResponse.current;
            refPrevCode.current = refCode.current;
            doForcedApp(f => !f)
        }
        };

  const handleClose = (event, reason) => {
      // reason: clickaway, timeout, escapeKeyDown
      /**
    if (reason === 'escapeKeyDown') {
      return;
    }
     */
    doForcedOpen(false);
    if (reason == 'clickaway' || reason == 'timeout') {
        setOpen(false);
        setResponse(null);
        return true;
      }
    console.log('=============================');
    console.log('==== HANDLE CLOSE EVENTS ====');
    console.log('==== REASON: ', reason);
    console.log('==== EVENT: ', event);
  };

  const setConnected = (val) => {
    refConnected.current = val;
  }

  const setLoading = (val) => {
      refLoading.current = val;
  }

  const setOpen = (val) => {
    //doForcedOpen(val);
      refOpen.current = val;
  }

  const setOpenWithType = (val, type) => {
    doForcedOpen(val);
    refSeverity.current = type;
      refOpen.current = val;
  }

  const closeSnackbar = () => {
    doForcedOpen(null);
      refOpen.current = false;
  }

  const setCtrlPanel = (val) => {
      refCtrlPanel.current = val;
      doForcedButton(val)
  }

  const setResCode = (val) => {
      refCode.current = val;
  }

  const setResponse = (val) => {
      refResponse.current = val;
  }

  const setNetwork = (val) => {
      refNetwork.current = val
  }

  const setPanelView = (val) => {
      refPanelView.current = val;
  }

  const setPulseText = (val) => {
      refPulseText.current = val;
  }

  const setTemplateActive = (val) => {
      refTemplateActive.current = val
  }

  const setSheetActive = (val) => {
      refSheetActive.current = val
  }

  const setDownloadActive = (val) => {
      refDownloadActive.current = val
  }


    
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef();
    const previousTimeRef = useRef();
    
    const animate = time => {
      if (previousTimeRef.current != undefined) {
        const deltaTime = time - previousTimeRef.current;
        
        // Pass on a function to the setter of the state
        // to make sure we always have the latest state
        if(refConnectionCounter.current < 100) {
            refConnectionCounter.current = refConnectionCounter.current + 1
        } else {
            refConnectionCounter.current = 0
        }

        // console.log('===== CONNECTION COUNTER: ', refConnectionCounter.current)
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    }
    
    /**
    useEffect(() => {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }, []);
     */




        const panelTop = () => {
            return <div className="grid-panel-top">
                <div className="toggle-server">
                <Tooltip title={refConnected.current?'Toggle Server connection OFF': 'Toggle Server connection ON'}>
                    <NetworkCheckIcon onClick={()=> {toggleServer()}} sx={{color: refConnected.current?'#311b92':'#c0c0c0', fontSize: 40, cursor: 'pointer'}} />
                </Tooltip>
                </div>
                {
                    refLoading.current && <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
            </div>
        }

        const panelLeft = () => {
            let downloadBtnLabel;
            if(downloading == ENDPOINT_RESULTS) {
                downloadBtnLabel = 'Downloading Results...'
            }
            else if(refDownloadActive.current) {
                downloadBtnLabel = 'Download Results'
            }
            else {
                downloadBtnLabel = 'No Results'
            }

            return <div className="grid-panel-left section-horizontal-padding">
                <Button sx={{mt: 2, mb: 2}} variant="contained" disabled={!refTemplateActive.current} onClick={ () => {setOpenWithType(true, snackbarTypeInfo), setCtrlPanel(1); setLoading(false); setPulseText('Template Download'); setResponse('Select needed Template(s)'); setPanelView(null)}}>
                    Get Templates
                </Button>
                <Button sx={{mt: 2, mb: 2}} variant="contained" disabled={!refSheetActive.current} onClick={ () => {setOpenWithType(true, snackbarTypeInfo), setCtrlPanel(2); setPulseText('File Upload'); setLoading(false); setResCode(0); setResponse('Kindly upload a file'); setPanelView(null)}}>
                    Load Sheets
                </Button>
                <Button sx={{mt: 2, mb: 2}} variant="contained" disabled={!refDownloadActive.current} onClick={ () => {handleDownload(ENDPOINT_RESULTS); setResponse(null); setOpenWithType(false, snackbarTypeInfo), setCtrlPanel(3); setLoading(true); setPanelView(null)}}>
                    {downloadBtnLabel}
                </Button>
            </div>
        }
        
        const pulseActive = () => {
            return <Tooltip title="Server is Active">
                <div className="pulse-container">
                    <div className="pulsering"></div>
                    <div className="pulsecircle"></div>
                </div>
            </Tooltip>
        }

        const pulseInactive = () => {
            return <Tooltip title="Server is Disconnected">
                <div className="pulse-container">
                    <div className="pulsecircleInactive"></div>
                </div>
            </Tooltip>
        }

        const toggleServer = () => {
            setConnected(!refConnected.current);
            // setCtrlPanel(0);
            setLoading(false);
            doForcedToggle(!refConnected.current)
        }

        const sendServer = (c, d) => {
            // if(dataSent) return;
            refResponse.current = (refResponse.current == null)?'init': refResponse.current;
            refSocket.current.emit('query', {id: appId, code: c, args: d});
            // setDataSent(true)
        }

        const handleDownloadX = (endpointName) => {
            const data = endpointName;
            setDownloading(endpointName);
            setResponse('Downloading Subject Template...'); setOpenWithType(true, snackbarTypeInfo)
            console.log('ENDPOINT RECEIVED: ', `${ENDPOINT_HTTP}${endpointName}`)
            axios.post(`${ENDPOINT_HTTP}${endpointName}`, data, {
              headers: {
                     'Access-Control-Allow-Origin': '*',
                     'Content-Type': 'text/plain'
                   }
                 }).then(res => {
                  console.log('AXIOS RECEIVED: ', res.statusText);
                  console.log('RESPONSE DATA : ', res.data);
                  const getResponse = res.data;
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
                    console.log('ENDPOINT RESPONSE: ', zipAsBase64)
                    const blob = b64ToBlob(getResponse, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    fileSaver.saveAs(blob, `Students Template.xlsx`);
                    setDownloading(null);
                    setTimeout(() => {
                        // setOpenWithType(false, snackbarTypeInfo);
                        setResponse('Downloaded Subject Template'); setOpenWithType(true, snackbarTypeSuccess)
                    }, 5000);
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

        const mimeType = (ext) => {
            let mime;
            switch (ext) {
                case 'xlsx':
                    mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    break;

                case 'zip':
                    mime = ""
                    break;
            
                default:
                    mime = 'txt/plain'
                    break;
            }

            return mime
        }

        const handleDownload = (endpointName) => {
            setDownloading(endpointName);
            setPulseText('File download in progress...');
            const fileRoot = endpointName.replace('/', '');
            // const filename = `${fileRoot}.xlsx`;
            console.log('ENDPOINT REQUESTED: ', endpointName);
            let data, filename, message;
        
            fetch(`${ENDPOINT_HTTP}${endpointName}`)
                .then((response) => {
                    const txt = response.text();
                    if(response.status == 200) {
                        console.log('RESPONSE status: ', response.status + ' | ' + response.statusText);
                        return txt;
                    } else {
                        setResponse(`Failed! We could not fetch ${filename}`);
                        setOpenWithType(true, snackbarTypeError);
                        setTimeout(() => {
                            setDownloading(null);
                        }, 2000);
                        return null
                    }
                })
              .then((zipAsBase64) => {
                const getJson = JSON.parse(zipAsBase64);
                data = getJson.data;
                filename = getJson.info;
                message = getJson.message;
                  if(data != null) {
                    console.log('ENDPOINT RESPONSE length: ', data.length);
                    const ext = filename.split('.').pop();
                    const mime = mimeType(ext);

                    setResponse(message);
                    setOpenWithType(true, snackbarTypeInfo);
                    const blob = b64ToBlob(data, mime);
                    fileSaver.saveAs(blob, filename);
                    (async() => {
                        setTimeout(() => {
                            setOpen(false);
                        }, 5000);
                        setDownloading(null);
                        setResponse(`Downloaded ${filename}`); setOpenWithType(true, snackbarTypeSuccess)
                        setPulseText('File download completed');
                        setLoading(false)
                    })()
                  }
              }).catch((err) => {
                  console.log('ERROR! ', err);
                setResponse(`Something went wrong while downloading ${filename}`);
                setOpenWithType(true, snackbarTypeError);    
                setPulseText('Error in File download');
                setLoading(false)
              });
          };

        const handleDownloadZip = (endpointName) => {
            setDownloading(endpointName);
            const filename = `${FILE_ZIP_RESULTS}.zip`;
            console.log('ENDPOINT REQUESTED: ', endpointName)
        
            fetch(`${ENDPOINT_HTTP}${endpointName}`)
                .then((response) => {
                    if(response.status == 200) {
                        const txt = response.text();
                        setResponse(`Downloading ${filename}...`);
                        setOpenWithType(true, snackbarTypeInfo);
                        console.log('RESPONSE status: ', response.status + ' | ' + response.statusText);
                        console.log('RESPONSE: ', response);
                        return txt;
                    } else {
                        setResponse(`Failed! We could not fetch ${filename}`);
                        setOpenWithType(true, snackbarTypeError);
                        setTimeout(() => {
                            setDownloading(null);
                        }, 2000);
                        return null
                    }
                })
              .then((zipAsBase64) => {
                  if(zipAsBase64 != null) {
                    console.log('ENDPOINT RESPONSE length: ', zipAsBase64.length);
                    const blob = b64ToBlob(zipAsBase64, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    fileSaver.saveAs(blob, filename);
                    (async() => {
                        setTimeout(() => {
                            setOpen(false);
                        }, 5000);
                        setDownloading(null);
                        setResponse(`Downloaded ${filename}`); setOpenWithType(true, snackbarTypeSuccess)
                    })()
                  }
              }).catch((err) => {
                setResponse(`Something went wrong while downloading ${filename}`); setOpenWithType(true, snackbarTypeError)
              });
          };

        const keepHandshake = (c, d) => {
            refSocket.current.emit('is-connected', {id: appId, code: c, arg: d})
        }

        const displayList = (list) => {
            return <List className="panel-view hide-scrollbar"
            sx={{ width: '100%', bgcolor: 'background.paper', padding: '20px'}}
            aria-label="Lists"
          >
              {
                list.map((i, k) => (
                    <ListItem disablePadding key={k}>
                <ListItemButton>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText primary={i} />
                </ListItemButton>
              </ListItem>
                ))
              }
          </List>
        }

        const panelLoader = () => {
            if(refCtrlPanel.current == 1) {
                return <div className="grid-panel-refResponse.current hide-scrollbar">
                        <Stack direction="column" spacing={1}>
                            <Chip icon={<SubjectIcon />} label={downloading==ENDPOINT_SUBJECTS?'downloading...':'Subjects'} variant="outlined" onClick={()=>{handleDownload(ENDPOINT_SUBJECTS); setResponse(null); setOpenWithType(false, snackbarTypeInfo); setLoading(true)}} />
                            <Chip icon={<FaceIcon />} label={downloading==ENDPOINT_STUDENTS?'downloading...':'Students'} variant="outlined" onClick={()=>{handleDownload(ENDPOINT_STUDENTS); setResponse(null); setOpenWithType(false, snackbarTypeInfo); setLoading(true)}} />
                            <Chip icon={<KeyIcon />} label={downloading==ENDPOINT_KEYS?'downloading...':'Keys'} variant="outlined" onClick={()=>{handleDownload(ENDPOINT_KEYS); setResponse(null); setOpenWithType(false, snackbarTypeInfo); setLoading(true)}} />
                            <Chip icon={<ListIcon />} label={downloading==ENDPOINT_POOL?'downloading...':'Pool'} variant="outlined" onClick={()=>{handleDownload(ENDPOINT_POOL); setResponse(null); setOpenWithType(false, snackbarTypeInfo); setLoading(true)}} />
                        </Stack>
                    </div>
            }
            else if(refCtrlPanel.current == 2){
                return <div className="grid-panel-refResponse.current hide-scrollbar">
                        <DropZone active={refCode.current === 201?false: true} />
                    </div>
            }
            else if(refCtrlPanel.current == 3) {
                return <div className="grid-panel-refResponse.current hide-scrollbar">
                            Results Prompt to download
                        </div>
            }
            else {
                if(Array.isArray(refPanelView.current)) {
                    if(refPanelView.current.length > 0) {
                        return displayList(refPanelView.current)
                    }
                    return  <div className="grid-panel-refResponse.current-plain hide-scrollbar">
                    <div className="section-horizontal-margin">
                        No Response yet...
                    </div>
                </div>
                }
                else {
                    return <div className="grid-panel-refResponse.current-plain hide-scrollbar">
                    <div className="section-horizontal-margin">
                        {
                            (refPanelView.current != null && refPanelView.current != undefined)? refPanelView.current: 'No Server Activity...'
                        }
                    </div>
                </div>
                }
            }
        
        }

        const stateRestrictCount = () => { 
            if(refStateRestrictCount.current === 0) {
                refPrevStateTemplate.current = refTemplateActive.current;
                refPrevStateSheet.current = refSheetActive.current;
                refPrevStateDownload.current = refDownloadActive.current;
                refPrevStateCtrl.current = refCtrlPanel.current;
            }
            refStateRestrictCount.current = refStateRestrictCount.current + 1;
        }


        useEffect(() => {
        // set CORS
        /**
         * keys: reconnection, reconnectionDelay, reconnectionDelayMax, reconnectionAttempts, timeout, forceNew
         */
        const initSocket = io(ENDPOINT_WS, {
            origin: ORIGIN,
            withCredentials: true,
            extraHeaders: {
            "emexrevolarter": "smartresult"
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionDelayMax: 1000,
            reconnectionAttempts: 10,
            forceNew: true,
            timeout: 1000 * 60 * 5
        });

        refSocket.current = initSocket.connect();

        refSocket.current.on(); // set the listener

        // connect with server
        console.log('SERVER is Sarting... ' + refCode.current);

        return () => {
            refNetwork.current && refSocket.current.disconnect();
        }
    }, []);

    useEffect(() => {

        // variables
        let useCode, useArgs, useData, useTitle, useNext, useView;

        //if(refConnected.current) {
    
        refSocket.current.on("connect", () => {
            refNetwork.current = true;
            refConnected.current = true;
            refPulseText.current = 'App connected';
            refResponse.current = 'Server is LIVE!';
            // (refCode.current == 0) && (refSeverity.current = snackbarTypeInfo);
            (refResponse.current != null && refResponse.current != '') && setOpenWithType(true, snackbarTypeInfo);
            refLoading.current = false;
            refCtrlPanel.current = refPrevStateCtrl.current;
            refTemplateActive.current = refPrevStateTemplate.current;
            refSheetActive.current = refPrevStateSheet.current;
            refDownloadActive.current = refPrevStateDownload.current;
            sendServer('results-discovery', 'init');

            if(refStateRestrictCount.current > 0) {
                refStateRestrictCount.current = 0
            }

            if(!refLiveSwitch.current){
                doForcedNetwork(refNetwork.current);
                refLiveSwitch.current = true;
            }
            
            // refSocket.current.emit('query', {id: appId, refCode.current: 'results', data: ''});
            console.log('SERVER is CONNECTED! ');
            console.log('========== APP STATUS (on CONNECTION) =========');
            console.log('Is NETWORK: ', refNetwork.current);
            console.log('Is CONNECTED: ', refConnected.current);
            console.log('Is Template Button Active: ', refPrevStateTemplate.current);
            console.log('Is Sheet Button Active: ', refPrevStateSheet.current);
            console.log('Is Download Button Active: ', refPrevStateDownload.current);
            console.log('Ctrl value: ', refPrevStateCtrl.current);
            console.log('===============================');
        });

        refSocket.current.on('disconnect', () => {
            console.log('Server is disconnected');
            refNetwork.current = false;
            refConnected.current = false;
            
            stateRestrictCount();
            
            refLoading.current = false;
            refCtrlPanel.current = 0;
            refTemplateActive.current = false;
            refSheetActive.current = false;
            refDownloadActive.current = false;
            
            refPulseText.current = 'Server is disconnected';
            refResponse.current = 'Cannot connect to Server. Please check if Server is still running';
            refSeverity.current = snackbarTypeError;
            refOpen.current = true;
            
            console.log('========== APP STATUS (on DISCONNECTION) =========');
            console.log('Is NETWORK: ', refNetwork.current);
            console.log('Is CONNECTED: ', refConnected.current);
            console.log('Is Template Button Active: ', refPrevStateTemplate.current);
            console.log('Is Sheet Button Active: ', refPrevStateSheet.current);
            console.log('Is Download Button Active: ', refPrevStateDownload.current);
            console.log('Ctrl value: ', refPrevStateCtrl.current);
            console.log('RESTRICT COUNT: ', refStateRestrictCount.current)
            console.log('===============================');
        });

        refSocket.current.on('connect_error', () => {
            stateRestrictCount();

            refPulseText.current = 'Connection Error!';
            refResponse.current = 'An Error occured while trying to connect to Server';
            refSeverity.current = snackbarTypeError;
            refOpen.current = true;
            if(refLiveSwitch.current){
                doForcedNetwork(refNetwork.current);
                refLiveSwitch.current = false
            }

            console.log('========== APP STATUS (on ERROR) =========');
            console.log('Is NETWORK: ', refNetwork.current);
            console.log('Is CONNECTED: ', refConnected.current);
            console.log('Is Template Button Active: ', refPrevStateTemplate.current);
            console.log('Is Sheet Button Active: ', refPrevStateSheet.current);
            console.log('Is Download Button Active: ', refPrevStateDownload.current);
            console.log('Ctrl value: ', refPrevStateCtrl.current);
            console.log('===============================');
        });

        refSocket.current.on("is-connected", q => {
            try {
                useCode = q.code;
                useData = q.data;
                useTitle = q.title;
                useNext = q.next;
            
                if(useCode == 505) {
                    refNetwork.current = false;
                    refConnected.current = false;
                    refPulseText.current = useTitle;
                    refResponse.current = useData;
                    refLoading.current = useNext;
                    refSeverity.current = snackbarTypeError;
                    (refResponse.current != null && refResponse.current != '') && (refOpen.current = true);
                }
            } catch (error) {
                
            }
        });

        refSocket.current.on("query", q => {
            try {
                console.log('RETURNED DATA: ', q);
                useCode = q.code;
                useArgs = q.args;
                useData = q.data;
                useTitle = q.title;
                useNext = q.next;
                useView = q.view;
                
                refCode.current = useCode;
                
                let newView = [];
                if(typeof useView == 'string') {
                    newView = JSON.parse(useView)
                }
                console.log('NEW VIEW: ', newView);
                useView = [...newView];

            console.log('==========================================');
            console.log('===========  SERVER DATA RETURNED  ===========');
            console.log('==========================================');
            console.log('CODE: ', useCode);
            console.log('DATA: ', useData);
            console.log('TITLE: ', useTitle);
            console.log('NEXT: ', useNext);
            console.log('VIEW: ', useView);
    //if(refCode.current > 219 && refCode.current < 243) {

        (useTitle != '' && useTitle != null && useTitle != undefined) && (refPulseText.current = useTitle);
        
        (useData != '' && useData != null && useData != undefined) && (refResponse.current = useData);

        refLoading.current = useNext;

        useView.length > 0 && (refPanelView.current = useView);
        useView.length > 0 && (refCtrlPanel.current = 0);
        
        setForcedApp();

        // upload file
        if(useCode == 201) {
            console.log('UPLOAD Content: File was uploaded');
            // refCode.current = 0;
            sendServer('uploads', 'init');
        }
        
        // Result processing
        if(useCode == 242) { // includes result validation
            sendServer('validate-results', 'init');
            console.log('SERVER: ', 'Result processing initiated')
        }

        // Result Verification
        if(useCode == 250) {
            sendServer('verify-results', 'init');
            console.log('SERVER: ', 'Result Validation initiated')
        }
        
        // result error
        if(useCode == 556) {
            console.log('SERVER RESULT ERROR! ', useCode);
            refSeverity.current = snackbarTypeError;
        }

        // Result computation
        if(useCode == 254) {
            sendServer('compute-result', useArgs);
            (useCode == 254) && console.log('SERVER: ', 'Result computation initiated')
        }

        if(useCode == 260) {
            // activate download button on completion
            refDownloadActive.current = true;
            refSeverity.current = snackbarTypeInfo;
        }
    //}



            
    // refCode.current == 201 ?setDownloadActive(true): setDownloadActive(false);


        // refResponse.current types
        // on error
        let severityType = snackbarTypeInfo;
        if(useCode > 499) {
                
            if(useCode == 505) {
                stateRestrictCount();

                refConnected.current = false;
                refNetwork.current = false;
                refPulseText.current = useTitle;
                refResponse.current = useData;
            }
            // setCtrlPanel(2);
            severityType = snackbarTypeError;
            refLoading.current = false;
        }
        if(useCode < 500) {
            severityType = snackbarTypeWarning;
        }
        if(useCode < 300) {
            severityType = snackbarTypeInfo;
        }
        if(useCode == 200) {
            severityType = snackbarTypeSuccess;
        }
        (refResponse.current != null && refResponse.current != '') && (setOpenWithType(true, severityType));


        } catch (error) {
            const severityType = snackbarTypeError;
            //setResponse(error);
                refResponse.current = error;
                setOpenWithType(true, severityType);
                console.log('==== SERVER ERROR! ', error);
        }
    });

//}

        // setForcedApp();

        // increment counter
        console.log('===== STATE RESTRICT COUNT: ', refStateRestrictCount.current);
        // refStateRestrictCount.current = refStateRestrictCount.current + 1;
     
    }, [refResponse.current, refPanelView.current, refCode.current, refSocket.current]);

    useEffect(() => {

        let sText = 'App is Live!';
        let sRef = '=== RECONNECTED SUCCESSFULLY ===';
        let severityType = snackbarTypeInfo;

        if(refStateRestrictCount.current > 0) {

            if(refNetwork.current) {
                if(refConnected.current) {
                    sRef = '=== App is connected ===';
                        refNetwork.current = refConnected.current;
                        refPulseText.current = sText;
                        refResponse.current = sRef;
                        severityType = snackbarTypeSuccess;
                
                refTemplateActive.current = refPrevStateTemplate.current;
                refSheetActive.current = refPrevStateSheet.current;
                refDownloadActive.current = refPrevStateDownload.current;
                refCtrlPanel.current = refPrevStateCtrl.current;
                }
            else {
                sText = 'App is Disconnected!';
                sRef = 'Reconnect App to Server please';
                refPulseText.current = sText;
                refResponse.current = sRef;
                severityType = snackbarTypeWarning;
    
                stateRestrictCount();
    
                refTemplateActive.current = false;
                refSheetActive.current = false;
                refDownloadActive.current = false;
                refCtrlPanel.current = 0;
            }
            doForcedToggle(refConnected.current);
    
            } else {
                sText = 'Server Connection lost!';
                sRef = 'App may not connect at this time. Server is unreachable';
                refConnected.current = false;
                refPulseText.current = sText;
                refResponse.current = sRef;
                severityType = snackbarTypeWarning;
    
                stateRestrictCount();
                /**
                refTemplateActive.current = false;
                refSheetActive.current = false;
                refDownloadActive.current = false;
                 */
            }
        }

        (sRef != null || sRef != '') && (setOpenWithType(true, severityType));

        console.log('TOGGLE CONNECTED: ', refConnected.current);
        console.log('SERVER NETWORK: ', refNetwork.current);
        console.log('SERVER RESPONSE: ', refResponse.current);
        console.log('SREF DATA  : ', sRef);

        

    }, [refNetwork.current, refConnected.current]);

    /**
    useEffect(() => {
        setPanelView(refPanelView.current);
        setResCode(refCode.current);
        setCtrlPanel(refCtrlPanel.current);
        setPulseText(refPulseText.current);
        setResponse(refResponse.current);
        setOpen(refOpen.current)
    }, [refPulseText.current, refCtrlPanel.current, refResponse.current, refPanelView.current, refCode.current])
 */
    
    return (
        <section className="grid-panel section-horizontal-padding section-vertical-padding">
            {panelTop()}
            <div className="grid-panel-body">
                {panelLeft()}
                <div className="grid-panel-right section-horizontal-padding">
                    <div className="grid-panel-pulse">
                        {
                            refConnected.current?pulseActive(): pulseInactive()
                        }
                        <div className="grid-panel-pulse-text">
                        {
                            refPulseText.current !='' && refPulseText.current
                        }
                        </div>
                    </div>
                        {
                            (refResponse.current != null || refResponse.current != '') && 
                                    <Snackbar className="clickable" open={refOpen.current} autoHideDuration={6000} onClose={handleClose} onClick={() => closeSnackbar()}>
                                        <Alert severity={refSeverity.current} sx={{ width: '100%' }}>
                                        {refResponse.current}
                                        </Alert>
                                    </Snackbar>
                        }
                        {
                            panelLoader()
                        }
                </div>
            </div>
        </section>
    );
};

export default ButtonComponent;
