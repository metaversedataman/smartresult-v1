'use strict';
process.setMaxListeners(Infinity) // fix for Puppeteer MaxListenerExceededWarning
const Puppeteer = require('puppeteer')
const fsPromise = require('fs').promises
const {HtmlGenerator} = require('../components/HtmlGenerator')
const {WriteFile, FileExists, RandomNumber, RoundNumber, IsNumberFraction, ReadFile, ReplaceAll} = require('../components/Functions')


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const pathWatchResults = process.env.PATH_WATCH_RESULTS;
const pathFirstTermResults = process.env.DIR_FIRST_TERM_RESULTS;
const pathSecondTermResults = process.env.DIR_SECOND_TERM_RESULTS;
const pathThirdTermResults = process.env.DIR_THIRD_TERM_RESULTS;
const pathTextFeedback = pathWatchResults + '/' + process.env.TEXT_FEEDBACK;
const publicDir = process.env.DIR_PUBLIC;
// const avatarDirPath = process.env.DIR_AVATAR;
const avatarReplacePath = process.env.AVATAR_REPLACE_PATH;
const logoReplacePath = process.env.LOGO_REPLACE_PATH;
let jsonDir = process.env.PATH_JSON;
jsonDir = jsonDir.split('/').pop();
let htmlDir = process.env.DIR_HTML;
htmlDir = __dirname + '\\' + htmlDir.split('/').pop();
const htmlType1 = htmlDir +  '\\' + process.env.HTML_TYPE1;
const htmlType2 = htmlDir +  '\\' + process.env.HTML_TYPE2;
const htmlType3 = htmlDir +  '\\' + process.env.HTML_TYPE3;
const cssType1 =  __dirname + '\\' + publicDir + '\\' + process.env.CSS_TYPE1;
const cssType2 =  __dirname + '\\' + publicDir + '\\' + process.env.CSS_TYPE2;
const cssType3 =  __dirname + '\\' + publicDir + '\\' + process.env.CSS_TYPE3;
const pathJsonPdfList = './' + jsonDir + '/' + process.env.JSON_PDF_LIST_FILENAME;
const pathJsonPdfContent = __dirname + '\\' + jsonDir + '\\' + process.env.JSON_PDF_CONTENT;
const pathJsonPdfFailedJobs = __dirname + '\\' + jsonDir + '\\' + process.env.JSON_PDF_FAILED;

const avatarDefaultName = process.env.AVATAR_DEFAULT_NAME;
const aliasAvatar = process.env.ALIAS_AVATAR;


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
    const schoolResultTitle = data.schoolInfo.Title;
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
        resultTitle: schoolResultTitle,
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

const getCss = (templateType) => {
    let cssData, cssPath = '';

    switch (templateType) {
        case '1':
            cssPath = cssType3.replace(`\\uploads`, '');
            break;
        case '2':
            cssPath = cssType2.replace(`\\uploads`, '');
            break;
        case '3':
            cssPath = cssType3.replace(`\\uploads`, '');
            break;
    
        default:
            cssPath = cssType1.replace(`\\uploads`, '');
            break;
    }

    cssData = ReadFile(cssPath);

    return cssData;
}

const getHtml = (content, templateType) => {
    let templateData = '';

    switch (templateType) {
        case '1':
            templateData = ReadFile(htmlType3);
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
    
    const html = HtmlGenerator(content, templateData);
    return html;
}


const defaultPrinterOptions = {
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
        left: '0px',
        top: '0px',
        right: '0px',
        bottom: '0px'
    }
}

class PdfPrinter {
    /**
     * Script supplied by Silvan Bregy (ID: 8018716)
     * as answer to a Question by Emeka Ndefo
     * on 18th February, 2022
     * https://stackoverflow.com/questions/71154854/puppeteer-create-pdf-files-from-html-data-hangs-windows-10-system
     */

    maxBrowsers = 2
    enqueuedPrintJobs = []
    failedJobs = []
    browserInstances = 0

    // max browser instances in parallel 
    constructor(maxBrowsers) {
        console.log('Printing Job begins...');
        this.maxBrowsers = maxBrowsers
    }

    /**
     * 
     * @param {*} html the html content to print
     * @param {*} css to apply to the page
     * @param {*} printOptions options passed to puppeteer
     */
    // enqueues a print but the exact end moment cannot be known..
    enqueuePrint = (html, css, path, done, list, cb) => {

        // merge custom options with defaultOptions..
        const printOptions = {
            ...defaultPrinterOptions,

            // add the path to the options.
            path: path
        }

        // create a function which can be stored in an array
        // it will later be grabbed by startPrinter() OR at the time any 
        // brwoser freed up.. 
        // the function needs to be passed the actual used browser instance!
        this.enqueuedPrintJobs.push(async(browser) => {
            // catch the error which may be produced when printing something..
            try {
                // print the document
                await this.print(browser, html, css, printOptions, list, cb)
            } catch (err) {
                console.error('error when printing document... CLosing browser and starting a new job!!', printOptions.path)
                console.error(err)

                // store someting so you now what failed and could be retried or something..
                // this.failedJobs.push({ html, css, path: printOptions.path })
                this.failedJobs.push({ file: list.file })

                // puppeteer can run into erros too!! 
                // so close the browser and launch a new one!
                await this.closeBrowser(browser)
                browser = await this.launchBrowser()
            }

            // after the print, call done() so the promise is resovled in the right moment when 
            // this particular print has ended.!
            done()

            // start the next job right now  if there are any left.
            const job = this.enqueuedPrintJobs.shift()

            if (!job) {

                console.log('No print jobs available anymore. CLosing this browser instance.. Remaining browsers now:', this.maxBrowsers - this.browserInstances + 1)
                await this.closeBrowser(browser)
                return
            }

            // job is actually this function itself! It will be executed
            // and automatically grab a new job after completion :)
            // we pass the same browser instance to the next job!.
            await job(browser)
        })

        // whenever a print job added make sure to start the printer
        // this starts new browser instances if the limit is not exceeded resp. if no browser is instantiated yet,
        // and does nothing if maximum browser count is reached..
        this.tryStartPrinter()
    }

    // same as enqueuePrint except it wraps it in a promise so we can now the
    // exact end moment and await it..
    enqueuePrintPromise(html, css, path, list, cb) {
        return new Promise((resolve, reject) => {
            try {
                this.enqueuePrint(html, css, path, resolve, list, cb)
            } catch (err) {
                console.error('unexpected error when setting up print job..', err)
                reject(err)
            }
        })

    }

    // If browser instance limit is not reached will isntantiate a new one and run a print job with it.
    // a print job will automatically grab a next job with the created browser if there are any left.
    tryStartPrinter = async() => {

        // Max browser count in use OR no jobs left.
        if (this.browserInstances >= this.maxBrowsers || this.enqueuedPrintJobs.length === 0) {
            return
        }
        // browser instances available! 
        // create a new one 

        console.log('launching new browser. Available after launch:', this.maxBrowsers - this.browserInstances - 1)
        const browser = await this.launchBrowser()
        
        // run job
        const job = this.enqueuedPrintJobs.shift()
        await job(browser)

    }

    closeBrowser = async(browser) => {


        // decrement browsers in use!
        // important to call before closing browser!!
        this.browserInstances--
        await browser.close()

    }

    launchBrowser = async() => {
        // increment browsers in use!
        // important to increase before actualy launching (async stuff..)
        this.browserInstances++

        // this code you have to adjust according your enviromnemt..
        // const browserFetcher = await Puppeteer.createBrowserFetcher();
        // const revisionInfo = await browserFetcher.download('818858');
        const browser = await Puppeteer.launch({
            // executablePath: revisionInfo.executablePath,
            headless: true,
            handleSIGINT: false,
            args: args
        })

        return browser
    }


    // The actual print function which creates a pdf.
    print = async(browser, html, css, printOptions, list, cb) => {
        // execute callback
        // cb(dataObj, false);

        const pdfPath = printOptions.path;
        const pdfName = pdfPath.split('/').pop();
        const msg = `Converting page to pdf: ${pdfName}`;
        console.log(msg);
        list.message = msg;
        const cbObject = list;
        cb(cbObject, false);
            // Run pdf creation in seperate page.
        const page = await browser.newPage();

        // await page.setDefaultTimeout(0);
        // await page.waitForNavigation({timeout: 10 * 60 * 1000});
        // await page.setContent(html);
        await page.setContent(html, { waitUntil: 'load', timeout: 0 });
        await page.setDefaultNavigationTimeout(0);
        await page.addStyleTag({ content: css });
        await page.pdf(printOptions);
        await page.close();

    }

}

// testing the PDFPrinter with some jobs.
// make sure to run the printer in an `async` function so u can 
// use await... 
const pdfGenerator = async(json, cb) => {
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
        const logo = data.logo;
        const logoState = data.keys.logo;
        const avatarState = data.keys.avatar;
        const avatars = data.avatars;
        const avatarDirName = data.avatarDir;
        
        let pdfCreatedList = [];
    
        let totalResultsExpected = Object.keys(recordFirstTerm).length + Object.keys(recordSecondTerm).length + Object.keys(recordThirdTerm).length;
        let totalResultsCount = 0;
        let jsonForPdf = {};
        let record = {};
        let sRecord, path, id, fName, lName, gender;
    
        // get each student 
        let logEndOnce = true;
        let logBeforeOnce = (totalResultsExpected <= totalResultsCount)? true: false;
        logBeforeOnce && console.log('==============    ***     ================');
        logBeforeOnce && console.log('======== PDF GENERATION BEGINS ================');

    // config
    const maxOpenedBrowsers = 5; // amount of browser instances which are allowed to be opened in parallel
    const testJobCount = totalResultsExpected; // amount of test pdf jobs to be created

    // create sample jobs for testing...
    let jobs = [];
    let completed = false;
    let cbObject = {
        file: null,
        class: null,
        term: null,
        session: null,
        list: [],
        message: null
    };

    const css = getCss(templateType);

    let logoName = null;
    if(logoState && logo != '') {
        logoName = logo;
    }

    let cumFeedback = [];

    const computeResult = (setTerm, setRecord) => {
        const termName = setTerm;
        const record = setRecord;
        let clb = [];

        (!FileExists(pathJsonPdfContent)) && console.log(`====== ${termName} RESULTS BEGINS ======`);
            for(let elem of students){
                id = elem.id;
                fName = elem.firstName;
                lName = elem.lastName;
                gender = elem.sex;
                filename = `${lName} ${fName} _${termName} ${sessionName}.pdf`;
                // sRecord = record.filter(function (entry) { return entry[id] !== undefined; });

                if(record[id] != undefined) {
                sRecord = record[id];
                path = getPath(termName, filename);

                // create pdf
                if(!FileExists(path) && !pdfCreatedList.includes(filename)){
                
                    // generate final JSON for the student
                    // isReset = (pdfCreatedList.includes(id))? false: true;
        
                    pdfFileList.push({
                      'term': termName,
                      'file': filename
                    });
                    totalResultsCount = pdfFileList.length;
                    
                    jsonForPdf = finalJson(elem, sRecord, data, termName);

                    // const pdfDate = new Date();
                    // console.log(`${filename} (${totalResultsCount}/${totalResultsExpected}) at ${pdfDate.getHours()}hr${pdfDate.getHours()>1?'s':''} - ${pdfDate.getMinutes()}min${pdfDate.getMinutes()>1?'s':''} - ${pdfDate.getSeconds()}sec${pdfDate.getSeconds()>1?'s':''}`);

                    // isActive = (totalResultsExpected === totalResultsCount)? true: false;
                    // logEndOnce = false;
                    // WriteFile(path, null);
                    // isReset = true;
                    // createPdf(page, jsonForPdf, templateType, filename, className, termName, sessionName, isActive, pdfFileList, cb);

                    let html = getHtml(jsonForPdf, templateType);

                    if(logoName !== null) {
                        const logoPath = aliasAvatar + '/' + logoName;
                        html = html.replace(logoReplacePath, logoPath);
                    }

                    if(avatarState == '1' && Object.keys(avatars).length > 0) {
                        const imgName = ReplaceAll(id, '/', '');
                        if(avatars[imgName] != undefined) {
                            let newPath = avatarDirName.replace('\\', '/');
                            newPath = newPath.replace('\\', '/');
                            newPath = newPath.split('/').pop();
                            const avatarPath = aliasAvatar + '/' + newPath + '/' + avatars[imgName];
                            const imgPath = avatarReplacePath + '/' + avatarDefaultName
                            html = html.replace(imgPath, avatarPath);
                        }
                        else {
                            if(gender.toLowerCase() == 'f' || gender.toLowerCase() == 'female') {
                                html = html.replace(avatarDefaultName, 'avatar-female.png')
                            }
                        }
                    } else {
                        const defaultPathFind = avatarDefaultName + '"';
                        const defaultPathReplace = '" style="display: none"';
                        html = html.replace(defaultPathFind, defaultPathReplace)
                    }

                    clb.push({
                        html: html,
                        path: path,
                        file: filename,
                        class: className,
                        term: termName,
                        session: sessionName,
                        list: pdfFileList,
                        static: jsonForPdf
                    });

                    if(clb.length == 0) {
                        clb = [...clb, {static: jsonForPdf}]
                    }
                    
                    WriteFile(path, null);
                }
                
                logBeforeOnce = (!FileExists(pathJsonPdfContent))? true: false;
                (!pdfCreatedList.includes(filename)) && pdfCreatedList.push(filename);
            } else {
                const newFeedback = `*** ${lName} ${fName} is not registered for ${termName}. No result generated.`;
                cumFeedback.push(newFeedback);
                console.log(newFeedback);
                }
            }


            (!FileExists(pathJsonPdfContent)) && console.log(`====== ${termName} RESULTS ENDS ======`);

            return clb
    }

    let getCbl = [];

    if(!FileExists(pathJsonPdfContent)){
        if(data.keys.firstTerm === '1') {
            termName = firstTermDir;
            record = recordFirstTerm;
            getCbl = computeResult(termName, record);
            jobs = [...jobs, ...getCbl]
        }
        
        if(data.keys.secondTerm === '1') {
            termName = secondTermDir;
            record = recordSecondTerm;
            getCbl = computeResult(termName, record);
            jobs = [...jobs, ...getCbl]
        }
        
        if(data.keys.thirdTerm === '1') {
            termName = thirdTermDir;
            record = recordThirdTerm;
            getCbl = computeResult(termName, record);
            jobs = [...jobs, ...getCbl]
        }


    if(jobs.length > 0){
            // run the actual pdf generation..
            const printer = new PdfPrinter(maxOpenedBrowsers);
    
            let msg = null;
            console.log(`Ready to print ${jobs.length} jobs`);
    
            const jobProms = [];
    
            for (let job of jobs) {
                (jobProms.length == 0) && WriteFile(pathJsonPdfContent, JSON.stringify(job.static));
    
                const fPath = job.file;
    
                msg = `Queued: ${fPath}`;
                cbObject = {
                    file: fPath,
                    class: job.class,
                    term: job.term,
                    session: job.session,
                    list: job.list,
                    message: msg
                }
    
                completed && (cbObject.message = `Printed a total of ${jobs.length}`);
    
                cb(cbObject, completed);
                console.log(msg);
    
                if(jobs.length === jobProms.length) {
                    cbObject.message = `All ${jobs.length} jobs enqueued!! Wating for finish now.`;
                    cb(cbObject, completed)
                }
    
                // run jobs in parallel. Each job wil be runned async and return a Promise therefor
                
                jobProms.push(
                    printer.enqueuePrintPromise(job.html, css, job.path, cbObject, cb)
                );
                
            }
    
    
            msg = 'All jobs enqueued!! Wating for finish now.';
            console.log(msg);
            const label = 'printed a total of ' + jobProms.length + ' pdfs!';
            console.time(label);
            cbObject.message = msg;
            cb(cbObject, completed);
    
            // helper function which awaits all the print jobs, resp. an array of promises.
            await Promise.all(jobProms);
            
    
            // track time
            console.timeEnd(label);
    
            completed = (jobs.length === jobProms.length)? true: false;
            msg = `printed a total of ${jobProms.length} pdfs!`;
            cbObject.message = msg;
            cb(cbObject, completed);

            // other feedback

            let previousFeedback = null;
            let feedbackText = null;
            FileExists(pathTextFeedback) && (previousFeedback = ReadFile(pathTextFeedback));
        if(cumFeedback.length > 0) {
            const newFeedback = cumFeedback.join('\n');
            feedbackText = previousFeedback + '\n\n' + newFeedback;
        }
    
            // failed jobs::
            const getFailedJobs = printer.failedJobs;
            console.log('jobs failed:', getFailedJobs);
            let newFeedback = '';
            if(getFailedJobs.length > 0) {
                newFeedback = getFailedJobs.map(({file}) => (file + '\n'));
                // newFeedback = ReplaceAll(newFeedback, ',', '\n');
                feedbackText = previousFeedback + `\n\n ${getFailedJobs.length} FAILED PDFs: \n` + newFeedback;
            }
            (feedbackText !== null) && WriteFile(pathTextFeedback, feedbackText);
    
            // as file:
            await fsPromise.writeFile(pathJsonPdfFailedJobs, JSON.stringify(printer.failedJobs))
    }
}
} catch (error) {
    console.log('==== ERROR IN PDF GENERATION: ', error)
}
}


module.exports = {
    PdfGenerator: pdfGenerator
}