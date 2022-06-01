var DecompressZip = require('decompress-zip');
// var fs = require('fs');

const unzip = (path, filename) => {
  const file = `${path}\\${filename}`;
  var unzipper = new DecompressZip(file);
  unzipper.on('error', function (err) {
    console.log('Error! ON ' + path, err);
});

unzipper.on('extract', function (log) {
    console.log('Uncompression has finished extracting');
});

unzipper.on('progress', function (fileIndex, fileCount) {
    console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
});

unzipper.extract({
    path: '.',
    filter: function (file) {
        return file.type !== "SymbolicLink";
    }
});
};

  module.exports = {
    Unzipper: unzip
  }
