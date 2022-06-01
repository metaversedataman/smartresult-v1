const chokidar = require('chokidar')

// Initialize watcher.
const observer = (pathDir, cb, timeout) => {
  const dotFiles = /(^|[\/\\])\../;

    const obs =  chokidar.watch(pathDir, {
    ignored: dotFiles, // ignore dotfiles
    persistent: true
  });
  
  // Add events.
  console.log('WATCHER! ', 'Now Watching ' + pathDir);
  
  let txtEvent = null;
  obs
    .on('add', path => {txtEvent = `File ${path} has been added`; console.log(txtEvent); cb(txtEvent, path)})
    .on('change', path => {txtEvent = `File ${path} has been changed`; console.log(txtEvent); cb(txtEvent, path)})
    .on('unlink', path => {txtEvent = `File ${path} has been removed`; console.log(txtEvent); cb(txtEvent, path)})
    .on('addDir', path => {txtEvent = `Directory ${path} has been added`; console.log(txtEvent); cb(txtEvent, path)})
    .on('unlinkDir', path => {txtEvent = `Directory ${path} has been removed`; console.log(txtEvent); cb(txtEvent, path)})
    .on('error', error => {txtEvent = `Watcher error: ${error}`; console.log(txtEvent); cb(txtEvent, null, 532)})
    .on('ready', path => {txtEvent = `Initial scan complete. Ready for changes`; console.log(txtEvent); cb(txtEvent, null)})
    .on('raw', (event, path, details) => { // internal
      // console.log('Raw event info:', event, path, details);
    });

    setTimeout(() => {
      console.log('WATCHER! ', 'Exited watching ' + pathDir);
      obs.close()
    }, timeout);
  
    return obs

}


  module.exports = {
    Watcher: observer
  }
