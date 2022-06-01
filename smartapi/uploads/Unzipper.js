const StreamZip = require('node-stream-zip')
const path = require('path');
var fs = require('fs');
const {FileExists} = require('../components/Functions')

const unzip = (root, fileName, cb) => {
  console.log('SERVER IS UNPACKING: ', fileName);
  const zipPath = root + '/' + fileName;

  try {
    if(FileExists(zipPath)) {
      (async () => {
        const zip = new StreamZip.async({ file: zipPath });
        const entriesCount = await zip.entriesCount;
        let res = null;
        res = `Found ${entriesCount} Entries in "${fileName}"`;
        console.log(res);
        cb(res, false);

        const entries = await zip.entries();
        for (const entry of Object.values(entries)) {
            const desc = entry.isDirectory ? 'directory' : `${Math.round(entry.size / 1024)} kb`;
            res = `Entry ${entry.name}: ${desc}`;
            console.log(res);
            cb(res, false);
        }

        const count = await zip.extract(null, root);

        if(entriesCount === count) {
          res = `${count} Entries were extracted from file: "${fileName}" successfully`;
          console.log(res);
          cb(res, true)
        }

        await zip.close();  
      })();
    }
}catch(e) {
  console.log('UNPACKING ERROR! ', e)
}
}

  module.exports = {
    Unzipper: unzip
  }
