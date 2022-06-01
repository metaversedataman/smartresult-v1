'use strict';
const excelToJson = require('convert-excel-to-json');
const path = require('path');
const fs = require('fs');
const {DirectoryList, IsNumber} = require('../components/Functions');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const typeStudents = process.env.TYPE_STUDENTS;
const typeSubjects = process.env.TYPE_SUBJECTS;
const typeKeys = process.env.TYPE_KEYS;
const typePool = process.env.TYPE_POOL;
const startRow = process.env.START_ROW;
const imageDirName = process.env.IMAGE_DIR_NAME;

const sanitizeFilename = (filename) => {
    
    let getFileOnly = filename;
    if(filename.includes('\\')) {
        getFileOnly = filename.split('\\').pop();
    }
    if(filename.includes('/')) {
        getFileOnly = filename.split('/').pop();
    }

    return getFileOnly;
}

const readWorkbookRaw = (path, row) => {

    var dirContent = DirectoryList(path + '/');
    var getList = dirContent.files;
    
    if(getList.length < 1) {
        return []
    }

    console.log('====================================');
    console.log('========== FILES DISCOVERED ==========');
    console.log('====================================');
    getList.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 
    });

    var filePath = 'uploads/watched/' + getList[0];

    console.log('FILE: ', getList);
    console.log('PATH: ', filePath);

     return excelToJson({
	sourceFile: filePath,
    sheetStubs: false,
    header: {
        rows: row
    }
});
}

const jsonId = (filePath, row) => {
    return {
        sourceFile: filePath,
        header:{
            rows: row
        },
        sheets: ['ID']
    }
}

const jsonStudents = (filePath, row) => {
    return {
    sourceFile: filePath,
    sheetStubs: false,
    header: {
        rows: row
    },
    sheets: [{
        name: 'Students Data',
        columnToKey: {
            A: 'Surname',
            B: 'Firstname',
            C: 'Other_Name',
            D: 'House',
            E: 'YOA',
            F: 'Admin_Number',
            G: 'DOB',
            H: 'Sex',
            I: 'Times_Present',
            J: 'Override_Teacher_Comment',
            K: 'Override_Skills_Musical',
            L: 'Override_Skills_Painting',
            M: 'Override_Skills_Craft',
            N: 'Override_Skills_Tools',
            O: 'Override_Skills_Fluency',
            P: 'Override_Sports_Indoor',
            Q: 'Override_Sports_Ball',
            R: 'Override_Sports_Combative',
            S: 'Override_Sports_Track',
            T: 'Override_Sports_Gymnastics',
            U: 'Override_Curricular_Jets',
            V: 'Override_Curricular_Farmers',
            W: 'Override_Curricular_Debating',
            X: 'Override_Curricular_Homemaker',
            Y: 'Override_Curricular_Drama',
            Z: 'Override_Curricular_Voluntary',
            AA: 'Override_Curricular_Others',
            AB: 'Override_Behaviour_Reliability',
            AC: 'Override_Behaviour_Neatness',
            AD: 'Override_Behaviour_Politeness',
            AE: 'Override_Behaviour_Honesty',
            AF: 'Override_Behaviour_Creativity',
            AG: 'Override_Behaviour_Leadership',
            AH: 'Override_Behaviour_Spirituality',
            AI: 'Override_Behaviour_Cooporation'
        }
    },{
        name: 'Class Info',
        columnToKey: {
            A: 'Class_Name',
            B: 'School',
            C: 'Session',
            D: 'Times_School_Opened',
            E: 'Next_Term_Begins'
        }
    },{
        name: 'Settings',
        columnToKey: {
            A: 'Id_By_Admin_No',
            B: 'First_Term_Active',
            C: 'Second_Term_Active',
            D: 'Third_Term_Active',
            E: 'Students_Photos',
            F: 'Verify',
            G: 'Template'
        }
    },{
        name: 'ID',
        columnToKey: {
            A: 'Id',
            B: 'Start_Row'
        }
    }]
}
}

const jsonSubjects = (filePath, row) => {
    return {
    sourceFile: filePath,
    sheetStubs: false,
    header: {
        rows: row
    },
    sheets: [{
        name: 'First Term',
        columnToKey: {
            A: 'Surname',
            B: 'Firstname',
            C: 'Other_Name',
            D: 'CA',
            E: 'Exam',
            F: 'Admin_Number'
        }
    },{
        name: 'Second Term',
        columnToKey: {
            A: 'Surname',
            B: 'Firstname',
            C: 'Other_Name',
            D: 'CA',
            E: 'Exam',
            F: 'Admin_Number'
        }
    },{
        name: 'Third Term',
        columnToKey: {
            A: 'Surname',
            B: 'Firstname',
            C: 'Other_Name',
            D: 'CA',
            E: 'Exam',
            F: 'Admin_Number'
        }
    },
    {
        name: 'Class Info',
        columnToKey: {
            A: 'Class_Name',
            B: 'Subject'
        }
    },{
        name: 'ID',
        columnToKey: {
            A: 'Id',
            B: 'Start_Row'
        }
    }]
}
}

const jsonKeys = (filePath, row) => {
    return {
    sourceFile: filePath,
    sheetStubs: false,
    header: {
        rows: row
    },
    sheets: [{
        name: 'Junior Grade Keys',
        columnToKey: {
            A: 'Grade_Name',
            B: 'Min_Value',
            C: 'Max_Value'
        }
    },{
        name: 'Junior Remark Keys',
        columnToKey: {
            A: 'Remark',
            B: 'Min_Value',
            C: 'Max_Value',
            D: 'Keywords'
        }
    },{
        name: 'Senior Grade Keys',
        columnToKey: {
            A: 'Grade_Name',
            B: 'Min_Value',
            C: 'Max_Value'
        }
    },{
        name: 'Senior Remark Keys',
        columnToKey: {
            A: 'Remark',
            B: 'Min_Value',
            C: 'Max_Value',
            D: 'Keywords'
        }
    },{
        name: 'Rating Keys',
        columnToKey: {
            A: 'Rating_Name',
            B: 'Min_Value',
            C: 'Max_Value'
        }
    },{
        name: 'Grade Max',
        columnToKey: {
            A: 'CA_Max',
            B: 'Exam_Max'
        }
    },
    {
        name: 'School Info',
        columnToKey: {
            A: 'School_Name',
            B: 'Extra_Info',
            C: 'Address',
            D: 'Title',
            E: 'Watermark'
        }
    },{
        name: 'ID',
        columnToKey: {
            A: 'Id',
            B: 'Start_Row'
        }
    }]
}
}

const jsonPool = (filePath, row) => {
    return {
    sourceFile: filePath,
    sheetStubs: false,
    header: {
        rows: row
    },
    sheets: [{
        name: 'Principal Comment',
        columnToKey: {
            A: 'Pool',
            B: 'Frequency'
        }
    },{
        name: 'Teacher Comment',
        columnToKey: {
            A: 'Pool',
            B: 'Frequency'
        }
    },{
        name: 'Skills',
        columnToKey: {
            A: 'Pool',
            B: 'Override'
        }
    },{
        name: 'Sports',
        columnToKey: {
            A: 'Pool',
            B: 'Override'
        }
    },{
        name: 'Curricular',
        columnToKey: {
            A: 'Pool',
            B: 'Override'
        }
    },{
        name: 'Behaviour',
        columnToKey: {
            A: 'Pool',
            B: 'Override'
        }
    },{
        name: 'ID',
        columnToKey: {
            A: 'Id',
            B: 'Start_Row'
        }
    }]
}
}

const readWorkBook = (path, filename, type, row) => {

    const getFileOnly = sanitizeFilename(filename);

    let getDir = path + '/';
    var filePath = getDir + getFileOnly;
    let jsonData = null;

    switch (type) {
        case typeStudents:
            jsonData = jsonStudents(filePath, Number(row));
            break;

        case typeSubjects:
            jsonData = jsonSubjects(filePath, Number(row));
            break;

        case typeKeys:
            jsonData = jsonKeys(filePath, Number(row));
            break;

        case typePool:
            jsonData = jsonPool(filePath, Number(row));
            break;
    
        default: jsonData = jsonId(filePath, Number(startRow));
            break;
    }
    if(jsonData != null) {
        return excelToJson(jsonData)
    } else {
        return []
    }
}

const readWorkBooks = (path) => {
    // getDir: 'uploads/watched/'

    const getDirContent = DirectoryList(path);
    const setList = getDirContent.files;
    const setDirs = getDirContent.dirs;
    const setImages = getDirContent.imgs;
    const setOthers = getDirContent.others;
    const matchTypes = typeKeys + ',' + typePool + ',' + typeStudents + ',' + typeSubjects;

    let setErrors = [];
    let getSubjects = [];
    let getStudents = [];
    let getKeys = [];
    let getPool = [];
    let getLogo = null;
    let getImages = {};
    let getFilenames = [];
    let getAvatarDirName = null;
    let getSettings = {
        isAdminId: '1',
        isFirstTerm: '1',
        isSecondTerm: '0',
        isThirdTerm: '0',
        isAvatar: '1',
        isVerify: '1',
        templateType: '1'
    }


    let sanitizeName = null;
    try {
        /**
         * validate all files
         * detect any error
         */
    
        // xlsx file types must be total of 4 & above
        if(setList.length < 4) {
            setErrors.unshift(`Expected minimum of 4 worksheets, but found ${setList.length} sheet${setList.length > 0?'s': ''}`)
        }

        // invalidate all other file types not xlsx
        if(setOthers.length > 0) {
            let getOthers = [];
            setOthers.forEach((file) => {
                sanitizeName = sanitizeFilename(file);
                getOthers.push(sanitizeName)    
            })
            setErrors.unshift(`Your Upload contains invalid file types: ${getOthers.toString()}`)
        }

        // process root images: only 1 image (if found)
        if(setImages.length > 1) {
            let grabFiles = [];
            setImages.forEach((file) => {
                sanitizeName = sanitizeFilename(file);
                grabFiles.push(sanitizeName);
            });
            setErrors.unshift(`Only 1 image at root is needed for logo. ${grabFiles.length} images detected: ${grabFiles.toString}`);
        }

        // process dirs: only 1 named images (if found)
        if(setDirs.length > 1) {
            let grabDirs = [];
            setDirs.forEach((file) => {
                sanitizeName = sanitizeFilename(file);
                grabDirs.push(sanitizeName);
            });
            setErrors.unshift(`Only 1 image folder is needed for students avatars. ${grabDirs.length} folders detected: ${grabDirs.toString}`);
        }

        

        /**
         * Proceed if no error
         */

        if(setErrors.length < 1) {

            // get logo if included
            if(setImages.length == 1) {
                setImages.forEach((file) => {
                    sanitizeName = sanitizeFilename(file);
                    getLogo = sanitizeName
                })
            }
    
            // get avatar images if included
            if(setDirs.length == 1) {
                getAvatarDirName = setDirs[0];
                setDirs.forEach((file) => {
                    sanitizeName = sanitizeFilename(file);
                        // read files in images dir
                        const imgDir = path + '/' + sanitizeName + '/';
                        const getImgContent = DirectoryList(imgDir);
                        const imgList = getImgContent.imgs;
                        const dirList = getImgContent.dirs;
                        const othrList = getImgContent.others;

                        if(dirList.length > 0) {
                            setErrors.unshift(`No sub folder for images/avatars is allowed in your upload. Detected ${dirList.length} folders!`);
                        }

                        if(othrList.length > 0) {
                            setErrors.unshift(`Only images are allowed in the photo folder you added. Detected ${othrList.length} file types!`);
                        }

                        setErrors.length < 1 && imgList.forEach((f) => {
                            sanitizeName = sanitizeFilename(f);
                            const kName = sanitizeName.split('.').slice(0, -1).join('.');
                            getImages[kName] = sanitizeName;
                            // getImages.push(sanitizeName)
                        });
                });
            }
    
            /**
             * Process all xlsx files
             */

            // Process all file types except Subject type files
            let getDefault, getStartRow, getType, thisData;

            setList.forEach(function (file) {
                sanitizeName = sanitizeFilename(file);
                // extract json data
                getDefault = readWorkBook(path, file, null, '0');
                getStartRow = getDefault.ID[0].B;
                getType = getDefault.ID[0].A;
    
                // validate files
                if(getStartRow == '' || getStartRow == undefined) {
                    setErrors.unshift('Start Row for ${sanitizeName} was modified & is empty!')
                }
                if(!IsNumber(getStartRow)) {
                    setErrors.unshift('Start Row for ${sanitizeName} must be a number')
                }
                if(getType == '' || getType == undefined) {
                    setErrors.unshift(`ID name for ${sanitizeName} was modified, and is either empty or invalid!`)
                }
                if(!matchTypes.includes(getType)) {
                    setErrors.unshift(`ID name for ${sanitizeName} was modified, and has unrecognized value!`)
                }
    
                thisData = readWorkBook(path, file, getType, getStartRow);

                switch (getType) {// check sheets per workbook
                    case typeStudents:
                        if(thisData['Students Data'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Students Data" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Class Info'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Class Info" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Settings'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Settings" is missing in ${sanitizeName}`)
                        }

                        // check if class info got value
                        if(thisData['Class Info'][0].Class_Name == undefined || thisData['Class Info'][0].Class_Name == '') {
                            setErrors.unshift(`Worksheet "Class Info" field: "Class Name" cannot be empty in ${sanitizeName}`)
                        }
                        if(thisData['Class Info'][0].School == undefined || thisData['Class Info'][0].School == '') {
                            setErrors.unshift(`Worksheet "Class Info" field: "School" cannot be empty in ${sanitizeName}`)
                        }
                        if(thisData['Class Info'][0].Session == undefined || thisData['Class Info'][0].Session == '') {
                            setErrors.unshift(`Worksheet "Class Info" field: "Session" cannot be empty in ${sanitizeName}`)
                        }
                        if(thisData['Class Info'][0].Times_School_Opened == undefined || thisData['Class Info'][0].Times_School_Opened == '') {
                            setErrors.unshift(`Worksheet "Class Info" field: "Times School Opened" cannot be empty in ${sanitizeName}`)
                        }
                        if(thisData['Class Info'][0].Next_Term_Begins == undefined || thisData['Class Info'][0].Next_Term_Begins == '') {
                            setErrors.unshift(`Worksheet "Class Info" field: "Next Term Begins" cannot be empty in ${sanitizeName}`)
                        }

                        // check if settings got value
                        const dataFirst = thisData['Settings'][0].First_Term_Active;
                        const dataSecond = thisData['Settings'][0].Second_Term_Active;
                        const dataThird = thisData['Settings'][0].Third_Term_Active;
                        const dataId = thisData['Settings'][0].Id_By_Admin_No;
                        const dataAvatar = thisData['Settings'][0].Students_Photos;
                        const dataVerify = thisData['Settings'][0].Verify;
                        const dataTemplate = thisData['Settings'][0].Template;

                        if(dataId == undefined || dataId == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "ID By Admin Number" is empty, in ${sanitizeName}`)
                        }
                        if(!('Yes,No').includes(dataId)) {
                            setErrors.unshift(`Worksheet "Settings" at field "ID By Admin Number?" is invalid; should either be Yes or No, in ${sanitizeName}`)
                        }

                        if(dataFirst == undefined || dataFirst == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "First Term is Active?" is empty, in ${sanitizeName}`)
                        }
                        if(!('Yes,No').includes(dataFirst)) {
                            setErrors.unshift(`Worksheet "Settings" at field "First Term is Active?" is invalid; should either be Yes or No, in ${sanitizeName}`)
                        }

                        if(dataSecond == undefined || dataSecond == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "Second Term is Active?" is empty, in ${sanitizeName}`)
                        }
                        if(!('Yes,No').includes(dataSecond)) {
                            setErrors.unshift(`Worksheet "Settings" at field "Second Term is Active?" is invalid; should either be Yes or No, in ${sanitizeName}`)
                        }
                        

                        if(dataThird == undefined || dataThird == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "Third Term is Active?" is empty, in ${sanitizeName}`)
                        }
                        if(!('Yes,No').includes(dataThird)) {
                            setErrors.unshift(`Worksheet "Settings" at field "Third Term is Active?" is invalid; should either be Yes or No, in ${sanitizeName}`)
                        }
                        

                        if(dataAvatar == undefined || dataAvatar == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "Students Photos?" is empty, in ${sanitizeName}`)
                        }
                        if(!('Yes,No').includes(dataAvatar)) {
                            setErrors.unshift(`Worksheet "Settings" at field "Students Photos?" is invalid; should either be Yes or No, in ${sanitizeName}`)
                        }
                        

                        if(dataVerify == undefined || dataVerify == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "Verify?" is empty, in ${sanitizeName}`)
                        }
                        if(!('Yes,No').includes(dataVerify)) {
                            setErrors.unshift(`Worksheet "Settings" at field "Verify?" is invalid; should either be Yes or No, in ${sanitizeName}`)
                        }
                        

                        if(dataTemplate == undefined || dataTemplate == '') {
                            setErrors.unshift(`Worksheet "Settings" at field "Template Type?" is empty, in ${sanitizeName}`)
                        }
                        if(!Number(dataTemplate)) {
                            setErrors.unshift(`Worksheet "Settings" at field "Template Type?" is invalid; should be a number, in ${sanitizeName}`)
                        }

                        if(setErrors.length < 1) {
                            getSettings.isFirstTerm = dataFirst.toString().toLowerCase() == 'yes'? '1': '0';
                            getSettings.isSecondTerm = dataSecond.toString().toLowerCase() == 'yes'? '1': '0';
                            getSettings.isThirdTerm = dataThird.toString().toLowerCase() == 'yes'? '1': '0';
                            getSettings.isAdminId = dataId.toString().toLowerCase() == 'yes'? '1': '0';
                            getSettings.isAvatar = dataAvatar.toString().toLowerCase() == 'yes'? '1': '0';
                            getSettings.isVerify = dataVerify.toString().toLowerCase() == 'yes'? '1': '0';
                            getSettings.templateType = dataTemplate.toString();

                            getStudents.push(thisData);
                        }
                        break;

                    case typeKeys:
                        if(thisData['Junior Grade Keys'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Junior Grade Keys" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Junior Remark Keys'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Junior Remark Keys" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Senior Grade Keys'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Senior Grade Keys" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Senior Remark Keys'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Senior Remark Keys" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Rating Keys'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Rating Keys" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Grade Max'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Grade Max" is missing in ${sanitizeName}`)
                        }
                        if(thisData['School Info'][0] == undefined) {
                            setErrors.unshift(`Worksheet "School Info" is missing in ${sanitizeName}`)
                        }

                        setErrors.length < 1 && getKeys.push(thisData);
                        break;

                    case typePool:
                        if(thisData['Principal Comment'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Principal Comment" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Teacher Comment'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Teacher Comment" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Skills'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Skills" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Sports'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Sports" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Curricular'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Curricular" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Behaviour'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Behaviour" is missing in ${sanitizeName}`)
                        }

                        setErrors.length < 1 && getPool.push(thisData);
                        break;
                
                    default: 
                        break;
                }
                
            });


            // process Subject type files last
            setList.forEach(function (file) {
                sanitizeName = sanitizeFilename(file);
                // extract json data
                getDefault = readWorkBook(path, file, null, '0');
                getStartRow = getDefault.ID[0].B;
                getType = getDefault.ID[0].A;
    
                thisData = readWorkBook(path, file, getType, getStartRow);

            if(getStudents.length > 0) {
                switch (getType) {// check sheets per workbook
                    case typeSubjects:
                        if(thisData['First Term'][0] == undefined && getSettings.isFirstTerm == '1') {
                            setErrors.unshift(`Worksheet "First Term" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Second Term'][0] == undefined && getSettings.isSecondTerm == '1') {
                            setErrors.unshift(`Worksheet "Second Term" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Third Term'][0] == undefined && getSettings.isThirdTerm == '1') {
                            setErrors.unshift(`Worksheet "Third Term" is missing in ${sanitizeName}`)
                        }
                        if(thisData['Class Info'][0] == undefined) {
                            setErrors.unshift(`Worksheet "Class Info" is missing in ${sanitizeName}`)
                        }

                        setErrors.length < 1 && getSubjects.push(thisData);
                        setErrors.length < 1 && getFilenames.push(sanitizeName);
                        break;

                    default: 
                        break;
                }
            }
                
            });

            // verify single files
            if(setErrors.length < 1) {
                if(getStudents.length < 1 || getStudents.length > 1) {
                    setErrors.unshift(`1 Student type sheet expected, but found ${getStudents.length} sheet${getStudents.length>0?'s': ''}`)
                }
                if(getKeys.length < 1 || getKeys.length > 1) {
                    setErrors.unshift(`1 Keys type sheet expected, but found ${getKeys.length} sheet${getKeys.length>0?'s': ''}`)
                }
                if(getPool.length < 1 || getPool.length > 1) {
                    setErrors.unshift(`1 Pool type sheet expected, but found ${getPool.length} sheet${getPool.length>0?'s': ''}`)
                }
    
                // verify multiple files
                if(getSubjects.length < 1) {
                    setErrors.unshift(`1 Subject type sheet minimum expected, but found none`)
                }
            }
        }
    } catch (error) {
        console.log('=== JSON PROCESS ERROR! ', error);
        setErrors.unshift(`=== ERROR DETECTED ===: ${error}`)
    }


    const finalList = {
        settings: getSettings,
        subjects: getSubjects,
        filenames: getFilenames,
        students: getStudents,
        keys: getKeys,
        pool: getPool,
        logo: getLogo,
        images: getImages,
        avatarDir: getAvatarDirName,
        errors: setErrors
    }

    //console.log('=== SAMPLE JSON ===', finalList.students[0]);
    
    return finalList
}

module.exports = {
    ReadWorkBook: readWorkbookRaw,
    ReadWorkBooks: readWorkBooks
}


