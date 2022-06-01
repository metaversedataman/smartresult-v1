var fs = require('fs');

var isBuffer = (obj) => {
  return Buffer.isBuffer(obj)
}

const fWriter = (data, path) => {

    fs.writeFile(path, data, err => {
      if(err) {
        console.error(err)
        return
      }
      console.log('File uploaded!')
    })
}

  module.exports = {
    FileWriter: fWriter
  }
