'use strict';
process.setMaxListeners(Infinity) // fix for Puppeteer MaxListenerExceededWarning
const Puppeteer = require('puppeteer')
const {HtmlGenerator} = require('../components/HtmlGenerator')
const {WriteFile, FileExists, RandomNumber, RoundNumber, IsNumberFraction, ReadFile} = require('../components/Functions')


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const pathFirstTermResults = process.env.DIR_FIRST_TERM_RESULTS;
const pathSecondTermResults = process.env.DIR_SECOND_TERM_RESULTS;
const pathThirdTermResults = process.env.DIR_THIRD_TERM_RESULTS;
const publicDir = process.env.DIR_PUBLIC;
const cssFile = process.env.PATH_CSS_FILENAME;
const pathCssRaw = __dirname + '\\' + publicDir + '\\' + cssFile;
const pathCss = pathCssRaw.replace(`\\uploads`, '');
const tagCssReplace = process.env.TAG_CSS_REPLACE;
let jsonDir = process.env.PATH_JSON;
jsonDir = jsonDir.split('/').pop();
let htmlDir = process.env.DIR_HTML;
htmlDir = __dirname + '\\' + htmlDir.split('/').pop();
const htmlType1 = htmlDir +  '\\' + process.env.HTML_TYPE1;
const htmlType2 = htmlDir +  '\\' + process.env.HTML_TYPE2;
const htmlType3 = htmlDir +  '\\' + process.env.HTML_TYPE3;
const pathJsonPdfList = './' + jsonDir + '/' + process.env.JSON_PDF_LIST_FILENAME;
const pathJsonPdfContent = __dirname + '\\' + jsonDir + '\\' + process.env.JSON_PDF_CONTENT;

const firstTermDir = 'first-term';
const secondTermDir = 'second-term';
const thirdTermDir = 'third-term';

let cumulativeFirstTermTotalList = {};
let cumulativeSecondTermTotalList = {};

let firstTermOnce = true;
let secondTermOnce = true;
let thirdTermOnce = true;
let isActive = false;

const getPath = (p, f) => {
    let dir = pathFirstTermResults;
    switch (p) {
        case firstTermDir:
            dir = pathFirstTermResults;
            break;
        case secondTermDir:
            dir = pathSecondTermResults;
            break;
        case thirdTermDir:
            dir = pathThirdTermResults;
            break;
    
        default:
            break;
    }
    return dir + f
}

const resolution = {
    x: 1920,
    y: 1080
}

const args = [
    '--disable-gpu',
    `--window-size=${resolution.x},${resolution.y}`,
    '--no-sandbox',
]

const createPdf = (page, content, templateType, filename, className, term, sessionName, isProcessActive, pdfFileList, cb) => {
    
    let path, document, options;
    path = getPath(term, filename);

    if(path != null) {

        let options = {
            path: path,
            format: 'A4',
            printBackground: true,
            margin: {
                left: '0px',
                top: '0px',
                right: '0px',
                bottom: '0px'
            }
        }
        /**
        options = {
            format: "A3",
            orientation: "portrait",
            border: "10mm",
            timeout: 1000 * 60 * 10,
            header: {
                height: "45mm",
                contents: '<div style="text-align: center;">Author: Shyam Hajare</div>'
            },
            footer: {
                height: "28mm",
                contents: {
                    first: 'Cover page',
                    2: 'Second page', // Any page number is working. 1-based index
                    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: 'Last Page'
                }
            }
        };
         */
        
        let templateData = '';
        switch (templateType) {
            case '1':
                templateData = ReadFile(htmlType1);
                break;
            case '2':
                templateData = ReadFile(htmlType2);
                break;
            case '3':
                templateData = ReadFile(htmlType3);
                break;
        
            default:
                templateData = ReadFile(htmlType1);
                break;
        }
        
        (async() => {
            const html = HtmlGenerator(content, templateData);

            if(html != undefined && html !== '' && html != null) {
            // create PDF file
            cb(filename, className, term, sessionName, isProcessActive, pdfFileList);

                // get style from .css & replace
                const css = ReadFile(pathCss);

                await page.setContent(html, { waitUntil: 'networkidle0'});
                await page.addStyleTag(css);
                await page.pdf(options);
                page.close();
            }
        })()
    }
}

const remarkGenerator = (score, gradeList, remarkList) => {
    let data = {
        position: '',
        remark: ''
    }

    if(IsNumberFraction) {
        let position = '';
        let remark = '';
        const scoreActive = Number(score);
        gradeList.forEach((item, index) => {
            const grade = item.Grade_Name;
            const min = item.Min_Value;
            const max = item.Max_Value;
            if(scoreActive >= min && scoreActive <= max) {
                position = grade;
            }
        });

        remarkList.forEach(elem => {
            const re = elem.Remark;
            const mi = elem.Min_Value;
            const mx = elem.Max_Value;
            if(scoreActive >= mi && scoreActive <= mx) {
                remark = re
            }
        })

        data = {
            position: position,
            remark: remark
        }
    }

    return data
}

const commentGenerator = (score, remarkList, commentList) => {
    let commentPool = [];

    if(IsNumberFraction) {
        const scoreActive = Number(score);
        remarkList.forEach((item, index) => {
            const keywords = item.Keywords;
            const min = item.Min_Value;
            const max = item.Max_Value;
            if(scoreActive >= min && scoreActive <= max) {
                if(keywords.includes(',')) {
                    const mkList = keywords.split(',');
                    mkList.forEach(elem => {
                        commentList.forEach(element => {
                            const getItem = element.Pool;
                            if(getItem.includes(elem)) {
                                commentPool.push(getItem)
                            }
                        });
                    })
                 } else {
                    const keyword = keywords;
                    commentList.forEach(i => {
                        const getI = i.Pool;
                        if(getI.includes(keyword)) {
                            commentPool.push(getI)
                        }
                    })
                 }

            }
        });

        const commentIndex = RandomNumber(0, commentPool.length - 1);
        const comment = commentPool[commentIndex];

        return comment
    }

    return comment
}

const finalJson = (info, record, data, getTermName) => {
    let studentJson = {};
    let subjectRowList = [];
    let subjectRow = {
        subject: '',
        ca: 0,
        exam: 0,
        presentTerm: 0,
        firstTerm: 0,
        secondTerm: 0,
        cummulative: 0,
        average: 0,
        position: '',
        remark: ''
    };

    let subjectTotal = {
        ca: 0,
        exam: 0,
        presentTerm: 0,
        firstTerm: 0,
        secondTerm: 0,
        cummulative: 0,
        average: 0,
        remark: ''
    }

    const termName = getTermName.toUpperCase().replace('-', ' ');
    const templateType = data.keys.templateType;
    const schoolName = data.schoolInfo.School_Name;
    const schoolExtraInfo = data.schoolInfo.Extra_Info;
    const schoolAddress = data.schoolInfo.Address;
    const schoolWatermark = data.schoolInfo.Watermark;
    const session = data.classInfo.Session;
    const className = data.classInfo.Class_Name;
    const schoolCat = data.classInfo.School;
    const timesSchoolOpened = data.classInfo.Times_School_Opened;
    const nextTermBegins = data.classInfo.Next_Term_Begins;
    const principalCommentList = data.principalComment;
    const teacherCommentList = data.teacherComment;
    const juniorGradeList = data.juniorGrade;
    const juniorRemarkList = data.juniorRemark;
    const seniorGradeList = data.seniorGrade;
    const seniorRemarkList = data.seniorRemark;
    const ratingsSkillsName = data.ratings[0].Rating_Name;
    const ratingsSkillsMin = data.ratings[0].Min_Value;
    const ratingsSkillsMax = data.ratings[0].Max_Value;
    const ratingsSportsName = data.ratings[1].Rating_Name;
    const ratingsSportsMin = data.ratings[1].Min_Value;
    const ratingsSportsMax = data.ratings[1].Max_Value;
    const ratingsCurricularName = data.ratings[2].Rating_Name;
    const ratingsCurricularMin = data.ratings[2].Min_Value;
    const ratingsCurricularMax = data.ratings[2].Max_Value;
    const ratingsBehaviourName = data.ratings[3].Rating_Name;
    const ratingsBehaviourMin = data.ratings[3].Min_Value;
    const ratingsBehaviourMax = data.ratings[3].Max_Value;
    const recordFirstTerm = data.firstTerm;
    const recordSecondTerm = data.secondTerm;
    const recordThirdTerm = data.thirdTerm;

    const ratingsListSkills = data.skills; // {Pool, Override}
    const ratingsListSports = data.sports;
    const ratingsListCurricular = data.curricular;
    const ratingsListBehaviour = data.behaviour;

    let id, fName, lName, oName, admissionNumber, gender, dob, house, timesPresent,
        yearAdmission, teacherComment, autoTeacherComment, principalComment;
    
    let ratingsListLabels = {};
    let ratingsListValueSkills = [];
    let ratingsListValueSports = [];
    let ratingsListValueCurricular = [];
    let ratingsListValueBehaviour = [];

    id = info.id;
    fName = info.firstName;
    lName = info.lastName;
    oName = info.otherName;
    admissionNumber = info.admissionNumber;
    gender = info.sex;
    dob = info.dob;
    house = info.house;
    timesPresent = info.timesPresent;
    yearAdmission = info.yearAdmission;

    // set Teacher's Comment
    const getCommentRandNo = RandomNumber(0, teacherCommentList.length - 1);
    autoTeacherComment = teacherCommentList[getCommentRandNo].Pool;
    teacherComment = info.overrideTeacherComment == null? autoTeacherComment: info.overrideTeacherComment;

    // set Ratings
    ratingsListLabels = {
        skills: ratingsSkillsName,
        sports: ratingsSportsName,
        curricular: ratingsCurricularName,
        behaviour: ratingsBehaviourName
    }

    ratingsListSkills.forEach(element => {
        ratingsListValueSkills.push({
            name: element.Pool,
            value: (element.Override == null)? RandomNumber(ratingsSkillsMin, ratingsSkillsMax): element.Override
        })
    });

    ratingsListSports.forEach(element => {
        ratingsListValueSports.push({
            name: element.Pool,
            value: (element.Override == null)? RandomNumber(ratingsSportsMin, ratingsSportsMax): element.Override
        })
    });

    ratingsListCurricular.forEach(element => {
        ratingsListValueCurricular.push({
            name: element.Pool,
            value: (element.Override == null)? RandomNumber(ratingsCurricularMin, ratingsCurricularMax): element.Override
        })
    });

    ratingsListBehaviour.forEach(element => {
        ratingsListValueBehaviour.push({
            name: element.Pool,
            value: (element.Override == null)? RandomNumber(ratingsBehaviourMin, ratingsBehaviourMax): element.Override
        })
    });

    // set Result Records if First Term

    if(termName.toLowerCase().includes('first')) {
        let setCummulative = {};

        record.forEach((elem, index) => {
            const getCA = Number(Math.ceil(elem.ca));
            const getExam = Number(Math.ceil(elem.exam));
            const getTotal = getCA + getExam;
            const getSubject = elem.subject;
            const getFirstTerm = getTotal;
            const getSecondTerm = '';
            const getCumulative = getTotal;
            const getAverage = getTotal;

            let gradeList = juniorGradeList;
            let remarkList = juniorRemarkList;
            if(schoolCat.toLowerCase().includes('senior')) {
                gradeList = seniorGradeList;
                remarkList = seniorRemarkList
            }
            const getRemarkData = remarkGenerator(getAverage, gradeList, remarkList);
            
            subjectRow = {
                subject: getSubject,
                ca: getCA,
                exam: getExam,
                presentTerm: getTotal,
                firstTerm: getFirstTerm,
                secondTerm: getSecondTerm,
                cummulative: getCumulative,
                average: getAverage,
                position: getRemarkData.position,
                remark: getRemarkData.remark
            };

            subjectTotal = {
                ca: subjectTotal.ca + getCA,
                exam: subjectTotal.exam + getExam,
                presentTerm: subjectTotal.presentTerm + getTotal,
                firstTerm: subjectTotal.firstTerm + getTotal,
                secondTerm: '',
                cummulative: subjectTotal.firstTerm + getTotal,
                average: subjectTotal.firstTerm + getTotal,
                remark: getRemarkData.remark
            }

            subjectRowList.push(subjectRow);

            setCummulative[elem.subject] = getTotal;

            if((record.length - 1) == index) {
                cumulativeFirstTermTotalList[id] = setCummulative;
                subjectTotal.average = RoundNumber((subjectTotal.average / subjectRowList.length), 1);
                principalComment = commentGenerator(subjectTotal.average, remarkList, principalCommentList);
            }
        })
    }

    if(termName.toLowerCase().includes('second')) {

    }

    if(termName.toLowerCase().includes('third')) {

    }


    studentJson = {
        templateType: templateType,
        firstName: fName,
        lastName: lName,
        otherName: oName,
        admissionNumber: admissionNumber,
        gender: gender,
        dateOfBirth: dob,
        house: house,
        className: className,
        termName: termName,
        session: session,
        schoolName: schoolName,
        schoolAddress: schoolAddress,
        schoolCategory: schoolCat,
        schoolExtraInfo: schoolExtraInfo,
        timesPresent: timesPresent,
        yearAdmission: yearAdmission,
        teacherComment: teacherComment,
        timesSchoolOpened: timesSchoolOpened,
        nextTermBegins: nextTermBegins,
        principalComment: principalComment,
        results: subjectRowList,
        ratingsLabels: ratingsListLabels,
        ratingsSkills: ratingsListValueSkills,
        ratingsSports: ratingsListValueSports,
        ratingCurricular: ratingsListValueCurricular,
        ratingBehaviour: ratingsListValueBehaviour,
        totals: subjectTotal,
        schoolWatermark: schoolWatermark
    }

    return studentJson;
}

const pdfGenerator = (json, cb) => {
    let data  = {};
    let pdfFileList = [];

    if(typeof json == 'string') {
        data = JSON.parse(json)
    } else {
        data = json;
    }

    try {

    // declare defaults
    let filename = 'Student' + '.pdf';
    let termName = firstTermDir;
    const templateType = data.keys.templateType;
    const session = data.classInfo.Session;
    const sessionName = session.replace('/', '-');
    const students = data.students;
    const className = data.classInfo.Class_Name;
    const recordFirstTerm = data.firstTerm;
    const recordSecondTerm = data.secondTerm;
    const recordThirdTerm = data.thirdTerm;
    
    let pdfCreatedList = [];
    let isReset = false;

    let totalResultsExpected = Object.keys(recordFirstTerm).length + Object.keys(recordSecondTerm).length + Object.keys(recordThirdTerm).length;
    let totalResultsCount = 0;
    let jsonForPdf = {};
    let record = {};
    let sRecord, path, id, fName, lName;

    // get each student 
    let logEndOnce = true;
    let logBeforeOnce = true;
    logBeforeOnce && console.log('==============    ***     ================');
    logBeforeOnce && console.log('======== PDF GENERATION BEGINS ================');
    

    const computeResult = (page, setTerm, setRecord, setReset) => {
        const termName = setTerm;
        const record = setRecord;
        let isReset = setReset;

        logBeforeOnce && console.log(`====== ${termName} RESULTS BEGINS ======`);
            for(let elem of students){
                id = elem.id;
                fName = elem.firstName;
                lName = elem.lastName;
                filename = `${lName} ${fName} _${termName} ${sessionName}.pdf`;
                // sRecord = record.filter(function (entry) { return entry[id] !== undefined; });
                sRecord = record[id];
                path = getPath(termName, filename);
    
                // create pdf
                if(!FileExists(path) && !FileExists(pathJsonPdfList)){
                
                    // generate final JSON for the student
                    // isReset = (pdfCreatedList.includes(id))? false: true;
                    
                    jsonForPdf = finalJson(elem, sRecord, data, termName);
                    (pdfFileList.length < 1) && WriteFile(pathJsonPdfContent, JSON.stringify(jsonForPdf));
        
                    pdfFileList.push({
                      'term': termName,
                      'file': filename
                    });
                    totalResultsCount = pdfFileList.length;
                    const pdfDate = new Date();
                    console.log(`${filename} (${totalResultsCount}/${totalResultsExpected}) at ${pdfDate.getHours()}hr${pdfDate.getHours()>1?'s':''} - ${pdfDate.getMinutes()}min${pdfDate.getMinutes()>1?'s':''} - ${pdfDate.getSeconds()}sec${pdfDate.getSeconds()>1?'s':''}`);

                    isActive = (totalResultsExpected === totalResultsCount)? true: false;
                    logEndOnce = false;
                    // cb(filename, className, termName, sessionName, isActive, pdfFileList);
                    // WriteFile(path, null);
                    isReset = true;
                    createPdf(page, jsonForPdf, templateType, filename, className, termName, sessionName, isActive, pdfFileList, cb);
                }
            }


            logBeforeOnce && console.log(`====== ${termName} RESULTS ENDS ======`);
    }

    // get each student result for First Term
    const computeFirstTerm = (p) => {
        return new Promise((resolve) => {
            if(data.keys.firstTerm === '1') {
                termName = firstTermDir;
                record = recordFirstTerm;
                pdfCreatedList = [];
                isReset = false;

                computeResult(p, termName, record, isReset)
            }
            resolve()
        })
    }

    // get each student result for Second Term
    const computeSecondTerm = (p) => {
        return new Promise((resolve) => {
            if(data.keys.secondTerm === '1') {
                termName = secondTermDir;
                record = recordSecondTerm;
                pdfCreatedList = [];
                isReset = false;

                computeResult(p, termName, record, isReset)
            }
            resolve()
        })
    }

    // get each student result for Third Term
    const computeThirdTerm = (p) => {
        return new Promise((resolve) => {
            if(data.keys.thirdTerm === '1') {
                termName = thirdTermDir;
                record = recordThirdTerm;
                pdfCreatedList = [];
                isReset = false;

                computeResult(p, termName, record, isReset)
            }
            resolve()
        })
    }

    (async () => {
        browser = await Puppeteer.launch({
            headless: true,
            handleSIGINT: false,
            args: args,
        });

        const page = await browser.newPage();
    
        await page.setViewport({
            width: resolution.x,
            height: resolution.y,
        })

        await computeFirstTerm(page);
        await computeSecondTerm(page);
        await computeThirdTerm(page);
        browser.close()
    })()
    

    
    if(totalResultsExpected === totalResultsCount && totalResultsCount !== 0 && !logEndOnce) {
        logEndOnce = true;
        logBeforeOnce = false;
        console.log('======== PDF GENERATION ENDS ================');
    }



    } catch (error) {
        console.log('==== ERROR IN PDF GENERATION: ', error)
    }


}

module.exports = {
    PdfGenerator: pdfGenerator
}