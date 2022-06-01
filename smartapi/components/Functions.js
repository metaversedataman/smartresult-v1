const fs = require('fs')
const path = require('path')

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const autoTime = (time) => {
  // equivalent of requestAnimationFrame
  let lastTime
  function playAnimation() {
    if (lastTime != null) {
      const delta = time - lastTime
      console.log(delta)
      // 6.9998
    }

    lastTime = time;
    setImmediate(playAnimation)
  }
  setImmediate(playAnimation)
}

const isNumber = (num) => {
  let isnum = /^\d+$/.test(num);
  return isnum
}

const isNumberFraction = (num, type) => {
  let isnum = null;
  switch (type) {
    case "1": // Optional sign, mandatory integer and fraction, and no exponent
      isnum = /^[-+]?[0-9]+\.[0-9]+$/
      break;
    case "2": // Mandatory sign, integer, and fraction, but no exponent
      isnum = /^[-+][0-9]+\.[0-9]+$/
      break;
    case "3": // Mandatory sign, integer, fraction, and exponent
      isnum = /^[-+][0-9]+\.[0-9]+[eE][-+]?[0-9]+$/
      break;
  
    default: // Optional sign, integer, and fraction. If the integer part is omitted, the fraction is mandatory. If the fraction is omitted, the decimal dot must be omitted, too. No exponent
      isnum = /^[-+]?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/
      break;
  }
  return isnum.test(num)
}

const isSigned = (num) => {
  let res = false;
  if(isNumberFraction(num, null)) {
    const numString = num.toString();
    if(numString.includes('-') || numString.includes('+')) {
      console.log('===== SIGNED: ', numString)
      res = true
    }
  }
  return res
}

const randomNumber = (min, max) => {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal + 1) + minVal); //The maximum is inclusive and the minimum is inclusive
}

const roundNumber = (number, decimalPlaces) => {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round(number * factorOfTen) / factorOfTen
}

const replaceAll = (data, search, newItem) => {
  const createRegExp = new RegExp(search, 'g');
  return data.replace(createRegExp, newItem)
}

const arrayToSet = (arr) => {
  return new Set(arr)
}

const isArrayUnique = (arr) => {
  return arrayToSet(arr).size === arr.length
}

const readFile = (file) => {
  var data = fileExists(file)? fs.readFileSync(file, 'utf8'): null;
  return data
}

const writeFile = (file, data) => {
  if(!fileExists(file)) {
    let newPath, sep;
    if(file.includes('/')) {
      sep = '/'
    }
    if(file.includes('\\')) {
      sep = '\\'
    }
    
    if(sep != undefined) {
      const getFileName = file.split(sep).pop();
      const replaceVal = sep + getFileName;
      newPath = file.replace(replaceVal, '');
      makeDir(newPath)
    }

  }
  
  (data != null && data !== '') && fs.writeFileSync(file, data, 'utf8');
}

const makeDir = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true})
  } catch (error) {
    console.log('MAKE DIR ERROR: ', error)
  }
}

const fileExists = (file) => {
  return fs.existsSync(file)
}

const deleteFile = (filename) => {
  fs.unlink(filename, (err => {
    if(err) {
      console.log('DELETE ERROR! Could not delete: ', filename)
    }
    else {
      console.log('DELETE UPDATE: deleted file ', filename)
    }
  }));
}

const emptyDirectory = (dirPath, isDeleteParent) => {
  try {
    if (fs.existsSync(dirPath)) {
  
  var list = fs.readdirSync(dirPath);
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dirPath, list[i]);
        var stat = fs.statSync(filename);
  
        if (filename == "." || filename == "..") {
            // do nothing for current and parent dir
        } else if (stat.isDirectory()) {
            // removeDir(filename);
          // delete directory recursively
          fs.rm(filename, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            console.log(`${dirPath} is deleted!`);
          });
        } else {
          fileExists && deleteFile(filename)
        }
    }
  
    isDeleteParent && fs.rmSync(dirPath);
  }
  } catch (error) {
    console.log('===== EMPTY DIR ERROR! ', error);
  }
}

const directoryList = (dirPath) => {
  let fList = [];
  let dList = [];
  let iList = [];
  let oList = [];

  if (!fs.existsSync(dirPath)) {
    return {
      files: [],
      dirs: [],
      imgs: [],
      others: []
    }
}

var list = fs.readdirSync(dirPath);
  for (var i = 0; i < list.length; i++) {
      var filename = path.join(dirPath, list[i]);
      var stat = fs.statSync(filename);

      if (filename == "." || filename == "..") {
          // do nothing for current and parent dir
      } else if (stat.isDirectory()) {
          dList.push(filename)
      } else {
        const ext = filename.split('.').pop();
        if(ext == 'xlsx') {
          fList.push(filename)
        }
        else if(ext == 'jpg' || ext =='jpeg' || ext == 'png' || ext == 'gif') {
          iList.push(filename)
        }
         else {
          oList.push(filename)
        }
      }
  }

  return {
    files: fList,
    dirs: dList,
    imgs: iList,
    others: oList
  }
}

const sortListByKey = (key, list) => {
  const newList = list.sort(function(a, b){
    let x = a[key];
    let y = b[key];
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
  });
  return newList;
}

// Initialize watcher.
module.exports = {
  Sleep: sleep,
  ReadFile: readFile,
  WriteFile: writeFile,
  FileExists: fileExists,
  DeleteFile: deleteFile,
  EmptyDirectory: emptyDirectory,
  DirectoryList: directoryList,
  AutoTime: autoTime,
  IsNumber: isNumber,
  IsSigned: isSigned,
  IsNumberFraction: isNumberFraction,
  IsArrayUnique: isArrayUnique,
  RandomNumber: randomNumber,
  RoundNumber: roundNumber,
  ReplaceAll: replaceAll,
  SortListByKey: sortListByKey
}