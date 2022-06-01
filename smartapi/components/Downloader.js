// const { parse } = require('url')
// const http = require('https')
const fs = require('fs')
const request = require('request');
// const { basename } = require('path')


          
function showDownloadingProgress(received, total, cb) {
  var platform = "win32"; // Form windows system use win32 for else leave it empty
  var percentage = ((received * 100) / total).toFixed(2);
  process.stdout.write((platform == 'win32') ? "\033[0G": "\r");
  process.stdout.write(percentage + "% | " + received + " bytes downloaded out of " + total + " bytes.");
  let progressStatus = percentage + "%";
  if(percentage == 100) {
    progressStatus = progressStatus + ' completed!';
  }
  const getKb = total / 1024;
  cb('Completed!' ,'Progress - ' + percentage + "% (" + Math.round(getKb) + 'kb)', 212)
}

module.exports = function(installerfileURL,installerfilename, cb) {

  // Variable to save downloading progress
  var received_bytes = 0;
  var total_bytes = 0;

  var outStream = fs.createWriteStream(installerfilename);
  
  request
      .get(installerfileURL)
          .on('error', function(err) {
              console.log(err);
              cb('Error!', err, 213);
          })
          .on('response', function(data) {
              total_bytes = parseInt(data.headers['content-length']);
              cb('Downloading...' ,'Progress - ' + total_bytes, 211)
          })
          .on('data', function(chunk) {
              received_bytes += chunk.length;
              showDownloadingProgress(received_bytes, total_bytes, cb);
          })
          .pipe(outStream);
}