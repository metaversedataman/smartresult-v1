const {IsArrayUnique, IsNumber, IsNumberFraction, IsSigned, SortListByKey} = require('./Functions')

const verifyResults = (dataJson, cb) => {
    const firstTermName = 'First Term';
    const secondTermName = 'Second Term';
    const thirdTermName = 'Third Term';
    let data = {};
    let error = [];
    let feedback = [];
    let result = {};
    let cbError = [];
    let completed = false;

    const getErrorCount = (type) => {
        if(error.length > cbError.length) {
            cbError = [...error];
        }
        cb(type, error, feedback, completed, result)
    }
    getErrorCount('Result verification initiated');

    if(typeof dataJson == 'string') {
        data = JSON.parse(dataJson)
    } else {
        data = dataJson;
    }

    try {
        // get variables
        const getAvatarState = data.settings.isAvatar;
        const getIdState = data.settings.isAdminId;
        const getStudents = data.students[0]['Students Data'];
        const getClassInfo = data.students[0]['Class Info'][0];
        const getAvatars = data.images;
        const getavatarDir = data.avatarDir;
        const getLogo = data.logo;
        const getLogoState = getLogo != null? '1': '0';
        const getFilenames = data.filenames;
        const getFirstTermState = data.settings.isFirstTerm;
        const getSecondTermState = data.settings.isSecondTerm;
        const getThirdTermState = data.settings.isThirdTerm;
        const getTemplateType = data.settings.templateType;
        const getSubjectList = data.subjects;

        const getJuniorGrade = data.keys[0]['Junior Grade Keys'];
        const getJuniorRemark = data.keys[0]['Junior Remark Keys'];
        const getSeniorGrade = data.keys[0]['Senior Grade Keys'];
        const getSeniorRemark = data.keys[0]['Senior Remark Keys'];
        const getRatings = data.keys[0]['Rating Keys'];
        const getGradeMax = data.keys[0]['Grade Max'][0];
        const getSchoolInfo = data.keys[0]['School Info'][0];
        
        const getPrincipalComment = data.pool[0]['Principal Comment'];
        const getTeacherComment = data.pool[0]['Teacher Comment'];
        const getSkills = data.pool[0]['Skills'];
        const getSports = data.pool[0]['Sports'];
        const getCurricular = data.pool[0]['Curricular'];
        const getBehaviour = data.pool[0]['Behaviour'];
        
        const genderAcceptedList = ['male','female','m','f'];

        result = {
            keys: {
                id: getIdState,
                avatar: getAvatarState,
                logo: getLogoState,
                firstTerm: getFirstTermState,
                secondTerm: getSecondTermState,
                thirdTerm: getThirdTermState,
                templateType: getTemplateType
            },
            juniorGrade: getJuniorGrade,
            juniorRemark: getJuniorRemark,
            seniorGrade: getSeniorGrade,
            seniorRemark: getSeniorRemark,
            ratings: getRatings,
            schoolInfo: getSchoolInfo,
            classInfo: getClassInfo,
            principalComment: getPrincipalComment,
            teacherComment: getTeacherComment,
            skills: getSkills,
            sports: getSports,
            curricular: getCurricular,
            behaviour: getBehaviour,
            students: [],
            firstTerm: {},
            secondTerm: {},
            thirdTerm: {},
            logo: getLogo,
            avatars: getAvatars,
            avatarDir: getavatarDir
        }

        // verify #1: if avatars are permitted & same number of images included
        if(getAvatarState == '1') {
            if(getStudents.length > getAvatars.length) {
                feedback.unshift(`${getAvatars.length} Image${getAvatars.length>1?'s':''} supplied for Avatar is less than the expected number (${getStudents.length}) of students`);
                feedback.unshift('Some Results may not include Avatar')
            }
            if(getStudents.length < getAvatars.length) {
                feedback.unshift(`${getAvatars.length} Images supplied for Avatar is more than the number of ${getStudents.length} students`);
                feedback.unshift('This may not pose any problem except possible mismatch')
            }
        } else {
            feedback.unshift('Avatar will not be included in any result')
        }
        getErrorCount('verify #1: if avatars are permitted & same number of images included');

        // verify #2: if logo is included
        if(getLogo == null) {
            feedback.unshift('No image was added as logo, and hence, will not be included')
        }
        getErrorCount('verify #2: if logo is included');

        // verify #3: if Template Type is set
        if(getTemplateType == null) {
            error.unshift(`Template Type on Settings worksheet is empty, Students file`)
        }        
        if(IsSigned(getTemplateType)) {
            error.unshift(`Template Type on Settings worksheet is empty, Students file`)
        }
        getErrorCount('verify #3: if template type is set');

        // verify #4: if empty value for Admin Numbers, Names, other fields in Students file
        let idArray = [];
        let idList = {};
        let countItem = 0;
        let innerCount = 0;
        for(let k = 0; k < getStudents.length; k++) {
            let d = getStudents[k];
            countItem = k + 1;
            let fName, lName, idName, oName, regNo, house, yOa, dOb, sex, tPresent;
            let overrideComment, skillMusic, skillDrawing, skillCraft, skillTools, skillHandwriting;
            let sportIndoor, sportBall, sportCombative, sportTrack, sportGymn;
            let currJets, currFarmers, currDebating, currHomemaker, currDrama, currVoluntary, currOthers;
            let behReliability, behNeatness, behPoliteness, behHonesty, behCreativity, behLeadership, behSpirituality, behCooporation;

            if(d.Admin_Number != undefined && d.Admin_Number !== '') {
                regNo =  d.Admin_Number;
            } else {
                regNo =  '';
            }
            
            if(getIdState == '1') {
                if(d.Admin_Number != undefined && d.Admin_Number !== '') {
                    idArray.push(d.Admin_Number);
                    idList[d.Admin_Number] = d;
                    idName = d.Admin_Number;
                } else {
                    error.unshift(`Admin Number for Student at row "${countItem}" is empty, in Students workbook`)
                }
            }

            if(d.Firstname != undefined && d.Firstname !== '') {
                fName = d.Firstname
            } else {
                error.unshift(`Firstname for Student at row "${countItem}" is empty, in Students workbook`)
            }
            if(d.Surname != undefined && d.Surname !== '') {
                lName = d.Surname
            } else {
                error.unshift(`Surname for Student at row "${countItem}" is empty, in Students workbook`)
            }
            if(fName != undefined && lName != undefined) {
                if(getIdState === '0') {
                    idName = `${lName}-${fName}`;
                    idArray.push(idName);
                    idList[idName] = d;
                }
            }

            if(d.House != undefined && d.House !== '') {
                house = d.House
            } else {
                error.unshift(`House for Student at row "${countItem}" is empty, in Students workbook`)
            }

            if(d.DOB != undefined && d.DOB !== '') {
                dOb = d.DOB
            } else {
                error.unshift(`Date Of Birth for Student at row "${countItem}" is empty, in Students workbook`)
            }
            
            if(d.Sex != undefined && d.Sex !== '') {
                const tsex = d.Sex;
                if(genderAcceptedList.includes(tsex.toLowerCase())){
                    sex = tsex
                } else {
                    error.unshift(`Sex/Gender contains invalid value at row "${countItem}", in Students workbook`);
                }
            } else {
                error.unshift(`Sex/Gender for Student at row "${countItem}" is empty, in Students workbook`)
            }
            
            if(d.Times_Present != undefined && d.Times_Present !== '') {
                tPresent = d.Times_Present
            } else {
                error.unshift(`Number of Times Present for Student at row "${countItem}" is empty, in Students workbook`)
            }


            if(error.length < 1) {

                // optionals: set if defined
                oName = (d.Other_Name != undefined)? d.Other_Name: null;
                yOa = (d.YOA != undefined)? d.YOA: null;
                overrideComment = (d.Override_Teacher_Comment != undefined)? d.Override_Teacher_Comment: null;
                skillMusic = (d.Override_Skills_Musical != undefined)? d.Override_Skills_Musical: null;
                skillDrawing = (d.Override_Skills_Painting != undefined)? d.Override_Skills_Painting: null;
                skillCraft = (d.Override_Skills_Craft != undefined)? d.Override_Skills_Craft: null;
                skillTools = (d.Override_Skills_Tools != undefined)? d.Override_Skills_Tools: null;
                skillHandwriting = (d.Override_Skills_Fluency != undefined)? d.Override_Skills_Fluency: null;
                sportIndoor = (d.Override_Sports_Indoor != undefined)? d.Override_Sports_Indoor: null;
                sportBall = (d.Override_Sports_Ball != undefined)? d.Override_Sports_Ball: null;
                sportCombative = (d.Override_Sports_Combative != undefined)? d.Override_Sports_Combative: null;
                sportTrack = (d.Override_Sports_Track != undefined)? d.Override_Sports_Track: null;
                sportGymn = (d.Override_Sports_Gymnastics != undefined)? d.Override_Sports_Gymnastics: null;
                currJets = (d.Override_Curricular_Jets != undefined)? d.Override_Curricular_Jets: null;
                currFarmers = (d.Override_Curricular_Farmers != undefined)? d.Override_Curricular_Farmers: null;
                currDebating = (d.Override_Curricular_Debating != undefined)? d.Override_Curricular_Debating: null;
                currHomemaker = (d.Override_Curricular_Homemaker != undefined)? d.Override_Curricular_Homemaker: null;
                currDrama = (d.Override_Curricular_Drama != undefined)? d.Override_Curricular_Drama: null;
                currVoluntary = (d.Override_Curricular_Voluntary != undefined)? d.Override_Curricular_Voluntary: null;
                currOthers = (d.Override_Curricular_Others != undefined)? d.Override_Curricular_Others: null;
                behReliability = (d.Override_Behaviour_Reliability != undefined)? d.Override_Behaviour_Reliability: null;
                behNeatness = (d.Override_Behaviour_Neatness != undefined)? d.Override_Behaviour_Neatness: null;
                behPoliteness = (d.Override_Behaviour_Politeness != undefined)? d.Override_Behaviour_Politeness: null;
                behHonesty = (d.Override_Behaviour_Honesty != undefined)? d.Override_Behaviour_Honesty: null;
                behCreativity = (d.Override_Behaviour_Creativity != undefined)? d.Override_Behaviour_Creativity: null;
                behLeadership = (d.Override_Behaviour_Leadership != undefined)? d.Override_Behaviour_Leadership: null;
                behSpirituality = (d.Override_Behaviour_Spirituality != undefined)? d.Override_Behaviour_Spirituality: null;
                behCooporation = (d.Override_Behaviour_Cooporation != undefined)? d.Override_Behaviour_Cooporation: null;

                result.students.push({
                    id: idName,
                    lastName: lName,
                    firstName: fName,
                    otherName: oName,
                    admissionNumber: regNo,
                    sex: sex,
                    dob: dOb,
                    house: house,
                    timesPresent: tPresent,
                    yearAdmission: yOa,
                    overrideTeacherComment: overrideComment,
                    overrideSkillMusic: skillMusic,
                    overrideSkillDrawing: skillDrawing,
                    overrideSkillCraft: skillCraft,
                    overrideSkillTools: skillTools,
                    overrideSkillHandwriting: skillHandwriting,
                    overrideSportIndoor: sportIndoor,
                    overrideSportBall: sportBall,
                    overrideSportCombartive: sportCombative,
                    overrideSportTrack: sportTrack,
                    overrideSportGymn: sportGymn,
                    overrideCurricularJets: currJets,
                    overrideCurricularFarmers: currFarmers,
                    overrideCurricularDebating: currDebating,
                    overrideCurricularHomemaker: currHomemaker,
                    overrideCurricularDrama: currDrama,
                    overrideCurricularVoluntary: currVoluntary,
                    overrideCurricularOthers: currOthers,
                    overrideBehaviourReliability: behReliability,
                    overrideBehaviourNeatness: behNeatness,
                    overrideBehaviourPoliteness: behPoliteness,
                    overrideBehaviourHonesty: behHonesty,
                    overrideBehaviourCreativity: behCreativity,
                    overrideBehaviourLeadership: behLeadership,
                    overrideBehaviourSpirituality: behSpirituality,
                    overrideBehaviourCooporation: behCooporation
                })
            }

            getErrorCount('verify #4: if empty value for Admin Numbers, Names, other fields in Students file');
        };

        // verify #5: if IDs for Students file is unique
        if(!IsArrayUnique(idArray)) {
            (getIdState == '1') && error.unshift(`One or more Student Admin Numbers are not unique, in Students file`);
            (getIdState == '0') && error.unshift(`One or more Student names are not unique, in Students file`);
        }
        getErrorCount('verify #5: if IDs for Students file is unique');

        // verify #6: if empty value for Class Info, in Students file
        if(getClassInfo.Class_Name == undefined) {
            error.unshift('Class Name of Class Info worksheet is empty, in Students file')
        }
        if(getClassInfo.School == undefined) {
            error.unshift('School Name of Class Info worksheet is empty, in Students file')
        }
        if(getClassInfo.Session == undefined) {
            error.unshift('Session of Class Info worksheet is empty, in Students file')
        }
        if(getClassInfo.Times_School_Opened == undefined) {
            error.unshift('No of Times School Opened of Class Info worksheet is empty, in Students file')
        }
        
        getErrorCount('verify #6: if empty values for Class Name, School Name, Session, & Times School Opened, in Students file');

        countItem = 0;
        
        let listFirstTerm = [];
        let listSecondTerm = [];
        let listThirdTerm = [];

        let innError = false;
        for(let i = 0; i < getSubjectList.length; i++) {
            let sub = getSubjectList[i];
            let gFile = getFilenames[i];
            countItem = i + 1;
            innError = false;
            let list = [];
            let subj, fName, lName, sName, termName, subjectName;

        const computeFirstTerm = () => {
            return new Promise((resolve) => {
            if(getFirstTermState == '1') {
                // verify #7: if empty Class Info in Subject files for First Term
                innError = false;
                termName = firstTermName;
                subj = sub[firstTermName];
                list.length = 0;

                if(sub['Class Info'][0].Class_Name == undefined) {
                    innError = true;
                    error.unshift(`Class Name in ${gFile} is empty`)
                }
                if(sub['Class Info'][0].Subject == undefined) {
                    innError = true;
                    error.unshift(`Subject Name in ${gFile} is empty`)
                } else {
                    subjectName = sub['Class Info'][0].Subject
                }
                if(subj < 1) {
                    innError = true;
                    error.unshift(`Subject scores for ${termName} cannot be found in ${gFile}`)
                }
                getErrorCount(`verify #7: if empty Class value in Subject files for ${termName}`);
                
                if(!innError) {
                    innerCount = 0;

                    for(let j = 0; j < subj.length; j++) {
                        // verify #8: if empty values for Student's info in Subject file
                        let item = subj[j];
                        innerCount = j + 1;
                        if(item.Surname == undefined) {
                            // innError = true;
                            error.unshift(`Surname for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }
                        if(item.Firstname == undefined) {
                            // innError = true;
                            error.unshift(`Firstname for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }
                        if(item.Admin_Number == undefined && getIdState == '1') {
                            // innError = true;
                            error.unshift(`Admin Number for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }

                        if(!innError) {
                            // verify #9: if both CA & Exam are not empty
                            fName = item.Firstname;
                            lName = item.Surname;
                            if(item.CA == undefined) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                            }
                            if(item.Exam == undefined) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                            }
                        }

                        // verify #10: if both CA & Exam are numbers for First Term
                        if(!innError) {
                            let caNumberType = false;
                            let examNumberType = false;
                            if(IsNumberFraction(item.CA, null)) {
                                caNumberType = true;
                            }
                            if(IsNumberFraction(item.Exam, null)) {
                                examNumberType = true;
                            }

                            if(!IsNumber(item.CA)) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is ${caNumberType?'not a whole number': 'not a number'} (${item.CA}), for ${termName} in ${gFile}`)
                            }
                            if(!IsNumber(item.Exam)) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is ${examNumberType?'not a whole number': 'not a number'} (${item.Exam}), for ${termName} in ${gFile}`)
                            }

                            if(IsSigned(item.CA)) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is signed (${item.CA}), for ${termName} in ${gFile}`)
                            }
                            if(IsSigned(item.Exam)) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is signed (${item.Exam}), for ${termName} in ${gFile}`)
                            }
                        }

                        if(!innError) {
                            // verify #11: if Total is > 45 & < 50, for First Term
                            const itemTotal = Number(item.CA) + Number(item.Exam);
                            if(itemTotal > 45 && itemTotal < 50) {
                                // innError = true;
                                error.unshift(`The CA (CA: ${item.CA}; Exam: ${item.Exam}; Total: ${itemTotal}) for "${lName} ${fName}" at row ${innerCount}, should be upgraded to 50, for ${termName} in ${gFile}`)
                            }
                            
                            // verify #12: if max not exceeded for both CA & Exam, for First Term
                            if(getGradeMax.length > 0) {
                                const elemMax = getGradeMax[0];
                                (item.CA > elemMax.CA_Max) && error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} exceeded set max value (${item.CA} vs ${elemMax.CA_Max}), for ${termName} in ${gFile}`);
                                (item.Exam > elemMax.Exam_Max) && error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} exceeded set max value (${item.CA} vs ${elemMax.Exam_Max}), for ${termName} in ${gFile}`)
                            }
                        }


                        if(!innError) {
                            if(getIdState == '1'){
                                sName = item.Admin_Number;
                                list.push(sName);
                            } else {
                                sName = lName + '/' + fName;
                                list.push(`${sName}`);
                            }

                            listFirstTerm = [...list];

                            // verify #13: match IDs as Admin Number or Names for First Term
                            // if(idList.indexOf(sName) === -1) {
                            if(idList[sName] === undefined) {
                                // innError = true;
                                (getIdState == '1') && error.unshift(`Student Admin Number "${sName}" is mismatched, for ${termName} in ${gFile}`);
                                (getIdState == '0') && error.unshift(`Student name "${lName} ${fName}" is mismatched, for ${termName} in ${gFile}`);
                            }
                        }

                        /** previous logic
                        (error.length < 1) && result.firstTerm.push({
                            id: sName,
                            subject: subjectName,
                            ca: item.CA,
                            exam: item.Exam
                        })
                         */

                        if(error.length < 1){
                            let mkGrade = {
                                subject: subjectName,
                                ca: item.CA,
                                exam: item.Exam
                            }
                            
                            if(result.firstTerm[sName] !== undefined) { // change term accordingly
                                result.firstTerm[sName].push(mkGrade)
                            } else {
                                result.firstTerm[sName] = [mkGrade]
                            }

                        }

                    }

                    getErrorCount('verify #8 - #13: if empty values in Subject files for First Term');

                    // verify #14: if unique IDs for First Term
                    if(!innError) {
                        if(Object.keys(list).length == list.length) {
                            if(!IsArrayUnique(list)){
                                // innError = true;
                                // (getIdState == '1') && error.unshift(`One or more Student Admin Numbers are not unique, for ${termName} in ${gFile}`);
                                // (getIdState == '0') && error.unshift(`One or more Student names are not unique, for ${termName} in ${gFile}`);
                                (getIdState == '1') && feedback.unshift(`One or more Student Admin Numbers are not unique, for ${termName} in ${gFile}`);
                                (getIdState == '0') && feedback.unshift(`One or more Student names are not unique, for ${termName} in ${gFile}`);
                            }
                        } else {
                            // innError = true;
                            // error.unshift(`Found ${list.length} Students against expected ${idList.length} number of Students, for ${termName} in ${gFile}`)
                            error.unshift(`Found ${list.length} Students against expected ${Object.keys(idList).length} number of Students, for ${termName} in ${gFile}`);
                        }
                    }
                    getErrorCount('verify #14: if unique IDs for First Term');
                }
            }
            resolve()
            })
        }

        const computeSecondTerm = () => {
            return new Promise((resolve) => {
            if(getSecondTermState == '1') {
                // verify #15: if empty Class Info in Subject files for Second Term
                // innError = false;
                termName = secondTermName;
                subj = sub[secondTermName];
                list.length = 0;

                if(sub['Class Info'][0].Class_Name == undefined) {
                    innError = true;
                    error.unshift(`Class Name in ${gFile} is empty`)
                }
                if(sub['Class Info'][0].Subject == undefined) {
                    innError = true;
                    error.unshift(`Subject Name in ${gFile} is empty`)
                } else {
                    subjectName = sub['Class Info'][0].Subject
                }
                if(subj < 1) {
                    innError = true;
                    error.unshift(`Subject scores for ${termName} cannot be found in ${gFile}`)
                }
                getErrorCount(`verify #15: if empty Class value in Subject files for ${termName}`);

                if(!innError) {
                    innerCount = 0;

                    for(let j = 0; j < subj.length; j++) {
                        // verify #16: if empty values for Student's info in Subject file
                        let item = subj[j];
                        innerCount = j + 1;
                        if(item.Surname == undefined) {
                            // innError = true;
                            error.unshift(`Surname for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }
                        if(item.Firstname == undefined) {
                            // innError = true;
                            error.unshift(`Firstname for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }
                        if(item.Admin_Number == undefined && getIdState == '1') {
                            // innError = true;
                            error.unshift(`Admin Number for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }

                        if(!innError) {
                            // verify #17: if both CA & Exam are not empty
                            fName = item.Firstname;
                            lName = item.Surname;
                            if(item.CA == undefined) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                            }
                            if(item.Exam == undefined) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                            }
                        }

                        // verify #18: if both CA & Exam are numbers for Second Term
                        if(!innError) {
                            let caNumberType = false;
                            let examNumberType = false;
                            if(IsNumberFraction(item.CA, null)) {
                                caNumberType = true;
                            }
                            if(IsNumberFraction(item.Exam, null)) {
                                examNumberType = true;
                            }

                            if(!IsNumber(item.CA)) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is ${caNumberType?'not a whole number': 'not a number'} (${item.CA}), for ${termName} in ${gFile}`)
                            }
                            if(!IsNumber(item.Exam)) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is ${examNumberType?'not a whole number': 'not a number'} (${item.Exam}), for ${termName} in ${gFile}`)
                            }

                            if(IsSigned(item.CA)) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is signed (${item.CA}), for ${termName} in ${gFile}`)
                            }
                            if(IsSigned(item.Exam)) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is signed (${item.Exam}), for ${termName} in ${gFile}`)
                            }
                        }

                        if(!innError) {
                            // verify #19: if Total is > 45 & < 50, for Second Term
                            const itemTotal = Number(item.CA) + Number(item.Exam);
                            if(itemTotal > 45 && itemTotal < 50) {
                                // innError = true;
                                error.unshift(`The CA (CA: ${item.CA}; Exam: ${item.Exam}; Total: ${itemTotal}) for "${lName} ${fName}" at row ${innerCount}, should be upgraded to 50, for ${termName} in ${gFile}`)
                            }
                            
                            // verify #20: if max not exceeded for both CA & Exam, for Second Term
                            if(getGradeMax.length > 0) {
                                const elemMax = getGradeMax[0];
                                (item.CA > elemMax.CA_Max) && error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} exceeded set max value (${item.CA} vs ${elemMax.CA_Max}), for ${termName} in ${gFile}`);
                                (item.Exam > elemMax.Exam_Max) && error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} exceeded set max value (${item.CA} vs ${elemMax.Exam_Max}), for ${termName} in ${gFile}`)
                            }
                        }


                        if(!innError) {
                            if(getIdState == '1'){
                                sName = item.Admin_Number;
                                list.push(sName);
                            } else {
                                sName = lName + '/' + fName;
                                list.push(`${sName}`);
                            }

                            listSecondTerm = [...list];

                            // verify #21: match IDs as Admin Number or Names for Second Term
                            if(idList[sName] === undefined) {
                                // innError = true;
                                (getIdState == '1') && error.unshift(`Student Admin Number "${sName}" is mismatched, for ${termName} in ${gFile}`);
                                (getIdState == '0') && error.unshift(`Student name "${lName} ${fName}" is mismatched, for ${termName} in ${gFile}`);
                            }
                        }

                        if(error.length < 1){
                            let mkGrade = {
                                subject: subjectName,
                                ca: item.CA,
                                exam: item.Exam
                            }
                            
                            if(result.secondTerm[sName] !== undefined) { // change term accordingly   
                                result.secondTerm[sName].push(mkGrade)
                            } else {
                                result.secondTerm[sName] = [mkGrade]
                            }
                        }

                    }                        
                    getErrorCount(`verify #16 - #21: if empty values in Subject files for ${termName}`);

                    // verify #22: if unique IDs for Second 
                    if(!innError) {
                        if(Object.keys(list).length == list.length) {
                            if(!IsArrayUnique(list)){
                                // innError = true;
                                // (getIdState == '1') && error.unshift(`One or more Student Admin Numbers are not unique, for ${termName} in ${gFile}`);
                                // (getIdState == '0') && error.unshift(`One or more Student names are not unique, for ${termName} in ${gFile}`);
                                (getIdState == '1') && feedback.unshift(`One or more Student Admin Numbers are not unique, for ${termName} in ${gFile}`);
                                (getIdState == '0') && feedback.unshift(`One or more Student names are not unique, for ${termName} in ${gFile}`);
                            }
                        } else {
                            // innError = true;
                            // error.unshift(`Found ${list.length} Students against expected ${idList.length} number of Students, for ${termName} in ${gFile}`)
                            error.unshift(`Found ${list.length} Students against expected ${Object.keys(idList).length} number of Students, for ${termName} in ${gFile}`);
                        }
                    }
                    getErrorCount('verify #22: if unique IDs for Second Term');
                }
            }
            resolve()
            })
        }

        const computeThirdTerm = () => {
            return new Promise((resolve) => {
            if(getThirdTermState == '1') {
                // verify #23: if empty Class Info in Subject files for third Term
                // innError = false;
                termName = thirdTermName;
                subj = sub[thirdTermName];
                list.length = 0;

                if(sub['Class Info'][0].Class_Name == undefined) {
                    innError = true;
                    error.unshift(`Class Name in ${gFile} is empty`)
                }
                if(sub['Class Info'][0].Subject == undefined) {
                    innError = true;
                    error.unshift(`Subject Name in ${gFile} is empty`)
                } else {
                    subjectName = sub['Class Info'][0].Subject
                }
                if(subj < 1) {
                    innError = true;
                    error.unshift(`Subject scores for ${termName} cannot be found in ${gFile}`)
                }
                getErrorCount(`verify #23: if empty Class value in Subject files for ${termName}`);

                console.log('INNERROR THIRD: ', innError);
                if(!innError) {
                    innerCount = 0;

                    for(let j = 0; j < subj.length; j++) {
                        // verify #24: if empty values for Student's info in Subject file for third term
                        let item = subj[j];
                        innerCount = j + 1;
                        if(item.Surname == undefined) {
                            // innError = true;
                            error.unshift(`Surname for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }
                        if(item.Firstname == undefined) {
                            // innError = true;
                            error.unshift(`Firstname for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }
                        if(item.Admin_Number == undefined && getIdState == '1') {
                            // innError = true;
                            error.unshift(`Admin Number for a Student at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                        }

                        if(!innError) {
                            // verify #25: if both CA & Exam are not empty
                            fName = item.Firstname;
                            lName = item.Surname;
                            if(item.CA == undefined) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                            }
                            if(item.Exam == undefined) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is empty, for ${termName} in ${gFile}`)
                            }
                        }

                        // verify #26: if both CA & Exam are numbers for third Term
                        if(!innError) {
                            let caNumberType = false;
                            let examNumberType = false;
                            if(IsNumberFraction(item.CA, null)) {
                                caNumberType = true;
                            }
                            if(IsNumberFraction(item.Exam, null)) {
                                examNumberType = true;
                            }

                            if(!IsNumber(item.CA)) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is ${caNumberType?'not a whole number': 'not a number'} (${item.CA}), for ${termName} in ${gFile}`)
                            }
                            if(!IsNumber(item.Exam)) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is ${examNumberType?'not a whole number': 'not a number'} (${item.Exam}), for ${termName} in ${gFile}`)
                            }

                            if(IsSigned(item.CA)) {
                                // innError = true;
                                error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} is signed (${item.CA}), for ${termName} in ${gFile}`)
                            }
                            if(IsSigned(item.Exam)) {
                                // innError = true;
                                error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} is signed (${item.Exam}), for ${termName} in ${gFile}`)
                            }
                        }

                        if(!innError) {
                            // verify #27: if Total is > 45 & < 50, for third Term
                            const itemTotal = Number(item.CA) + Number(item.Exam);
                            if(itemTotal > 45 && itemTotal < 50) {
                                // innError = true;
                                error.unshift(`The CA (CA: ${item.CA}; Exam: ${item.Exam}; Total: ${itemTotal}) for "${lName} ${fName}" at row ${innerCount}, should be upgraded to 50, for ${termName} in ${gFile}`)
                            }
                            
                            // verify #28: if max not exceeded for both CA & Exam, for third Term
                            if(getGradeMax.length > 0) {
                                const elemMax = getGradeMax[0];
                                (item.CA > elemMax.CA_Max) && error.unshift(`CA for "${lName} ${fName}" at row ${innerCount} exceeded set max value (${item.CA} vs ${elemMax.CA_Max}), for ${termName} in ${gFile}`);
                                (item.Exam > elemMax.Exam_Max) && error.unshift(`Exam for "${lName} ${fName}" at row ${innerCount} exceeded set max value (${item.CA} vs ${elemMax.Exam_Max}), for ${termName} in ${gFile}`)
                            }
                        }


                        if(!innError) {
                            if(getIdState == '1'){
                                sName = item.Admin_Number;
                                list.push(sName);
                            } else {
                                sName = lName + '/' + fName;
                                list.push(`${sName}`);
                            }

                            listThirdTerm = [...list];

                            // verify #29: match IDs as Admin Number or Names for third Term
                            if(idList[sName] === undefined) {
                                // innError = true;
                                (getIdState == '1') && error.unshift(`Student Admin Number "${sName}" is mismatched, for ${termName} in ${gFile}`);
                                (getIdState == '0') && error.unshift(`Student name "${lName} ${fName}" is mismatched, for ${termName} in ${gFile}`);
                            }
                        }

                        if(error.length < 1){
                            let mkGrade = {
                                subject: subjectName,
                                ca: item.CA,
                                exam: item.Exam
                            }
                            
                            if(result.thirdTerm[sName] !== undefined) { // change term accordingly   
                                result.thirdTerm[sName].push(mkGrade)
                            } else {
                                result.thirdTerm[sName] = [mkGrade]
                            }
                        }

                    }        
                    getErrorCount(`verify #24 - #29: if empty values in Subject files for ${termName}`);

                    // verify #30: if unique IDs for third Term
                    if(!innError) {
                        if(Object.keys(list).length == list.length) {
                            if(!IsArrayUnique(list)){
                                // innError = true;
                                // (getIdState == '1') && error.unshift(`One or more Student Admin Numbers are not unique, for ${termName} in ${gFile}`);
                                // (getIdState == '0') && error.unshift(`One or more Student names are not unique, for ${termName} in ${gFile}`);
                                (getIdState == '1') && feedback.unshift(`One or more Student Admin Numbers are not unique, for ${termName} in ${gFile}`);
                                (getIdState == '0') && feedback.unshift(`One or more Student names are not unique, for ${termName} in ${gFile}`);
                            }
                        } else {
                            // innError = true;
                            // error.unshift(`Found ${list.length} Students against expected ${idList.length} number of Students, for ${termName} in ${gFile}`)
                            error.unshift(`Found ${list.length} Students against expected ${Object.keys(idList).length} number of Students, for ${termName} in ${gFile}`);
                        }
                    }
                    getErrorCount('verify #30: if unique IDs for Third Term');
                }
            }

            resolve()
        })
        }

        const computeEnd = () => {
            return null
        }

        (async () => {
            await computeFirstTerm();
            await computeSecondTerm();
            await computeThirdTerm();
            computeEnd()
        })()

        }

        // verify #31: Sort in English, Mathematics, and others in ascending order
        let sortEnglish = [];
        let sortMaths = [];
        let sortOthers = [];
        let compareOthers = [];
        let sortedList = [];
        let studentList = [];

        const sortFirstTermSubjects = () => {
            return new Promise((resolve) => {
                listFirstTerm.forEach(s => {
                    if(result.firstTerm[s] !== undefined) {
                    studentList = result.firstTerm[s];
                    studentList.forEach(i => {
                        const getSubj = i.subject;
                        const testSubj = getSubj.toLowerCase();
                        if(testSubj.includes('english')) {
                            sortEnglish.push(i)
                        }
                        else if(testSubj.includes('mathematics')) {
                            sortMaths.push(i)
                        }
                        else {
                            sortOthers.push(i)
                        }
                    })
    
                    compareOthers = SortListByKey('subjects', sortOthers);
            
                    sortedList = sortEnglish.concat(sortMaths, compareOthers);
                    result.firstTerm[s] = [...sortedList];
                    sortEnglish.length = 0;
                    sortMaths.length = 0;
                    sortOthers.length = 0;
                    compareOthers.length = 0;
                    sortedList.length = 0;
                    studentList.length = 0;
                }
                })

                resolve()
            })
        }

        const sortSecondTermSubjects = () => {
            return new Promise((resolve) => {
                listSecondTerm.forEach(s => {     
                    studentList = result.secondTerm[s];
                    if(result.secondTerm[s] !== undefined) {
                    studentList.forEach(i => {
                        const getSubj = i.subject;
                        const testSubj = getSubj.toLowerCase();
                        if(testSubj.includes('english')) {
                            sortEnglish.push(i)
                        }
                        else if(testSubj.includes('mathematics')) {
                            sortMaths.push(i)
                        }
                        else {
                            sortOthers.push(i)
                        }
                    })
    
                    compareOthers = sortOthers.sort(function(a, b){
                        let x = a.subject.toLowerCase();
                        let y = b.subject.toLowerCase();
                        if (x < y) {return -1;}
                        if (x > y) {return 1;}
                        return 0;
                    });
            
                    sortedList = sortEnglish.concat(sortMaths, compareOthers);
                    result.secondTerm[s] = [...sortedList];
                    sortEnglish.length = 0;
                    sortMaths.length = 0;
                    sortOthers.length = 0;
                    compareOthers.length = 0;
                    sortedList.length = 0;
                    studentList.length = 0;
                }
                })

                resolve()
            })
        }

        const sortThirdTermSubjects = () => {
            return new Promise((resolve) => {
                listThirdTerm.forEach(s => {     
                    studentList = result.thirdTerm[s];
                    if(result.thirdTerm[s] !== undefined) {
                    studentList.forEach(i => {
                        const getSubj = i.subject;
                        const testSubj = getSubj.toLowerCase();
                        if(testSubj.includes('english')) {
                            sortEnglish.push(i)
                        }
                        else if(testSubj.includes('mathematics')) {
                            sortMaths.push(i)
                        }
                        else {
                            sortOthers.push(i)
                        }
                    })

                    compareOthers = sortOthers.sort(function(a, b){
                        let x = a.subject.toLowerCase();
                        let y = b.subject.toLowerCase();
                        if (x < y) {return -1;}
                        if (x > y) {return 1;}
                        return 0;
                    });
            
                    sortedList = sortEnglish.concat(sortMaths, compareOthers);
                    result.thirdTerm[s] = [...sortedList];
                    sortEnglish.length = 0;
                    sortMaths.length = 0;
                    sortOthers.length = 0;
                    compareOthers.length = 0;
                    sortedList.length = 0;
                    studentList.length = 0;
                }
                })
            resolve()
            })
        }

        const sortEnd = () => {
            // return null


        // verify #31: if any worksheet is empty for in Keys file
        (getJuniorGrade.length < 1) && error.unshift('Junior Grade Keys data is empty in Keys file');
        (getSeniorGrade.length < 1) && error.unshift('Senior Grade Keys data is empty in Keys file');
        (getRatings.length < 1) && error.unshift('Rating Keys data is empty in Keys file');
        (getGradeMax.length < 1) && error.unshift('Grade Max data is empty in Keys file');
        (getSchoolInfo.length < 1) && error.unshift('School Info data is empty in Keys file');
            
        getErrorCount('verify #31: if any worksheet is empty for in Keys file');

        // verify #32: if empty values exist for entered data set in Keys file
        (getJuniorGrade.length > 0) && getJuniorGrade.forEach((elem, index) => {
            if(elem.Grade_Name == undefined || elem.Grade_Name == null || elem.Grade_Name === '') {
                error.unshift(`Grade Name at row ${index + 1} on Junior Grade Keys worksheet is empty, in Keys file`)
            }
            if(elem.Min_Value == undefined || elem.Min_Value == null || elem.Min_Value === '') {
                error.unshift(`Minimum Value at row ${index + 1} on Junior Grade Keys worksheet is empty, in Keys file`)
            }
            if(elem.Max_Value == undefined || elem.Max_Value == null || elem.Max_Value === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Junior Grade Keys worksheet is empty, in Keys file`)
            }

            if(!IsNumberFraction(elem.Min_Value, null)) {
                error.unshift( `Minimum value at row ${index + 1} on Junior Grade Keys worksheet is not a number (${elem.Min_Value}), in Keys file`)
            }
            if(!IsNumberFraction(elem.Max_Value, null)) {
                error.unshift( `Maximum value at row ${index + 1} on Junior Grade Keys worksheet is not a number (${elem.Max_Value}), in Keys file`)
            }

            if(IsSigned(elem.Min_Value)) {
                error.unshift( `Minimum value at row ${index + 1} on Junior Grade Keys worksheet is signed (${elem.Min_Value}), in Keys file`)
            }
            if(IsSigned(elem.Max_Value)) {
                error.unshift( `Maximum value at row ${index + 1} on Junior Grade Keys worksheet is signed (${elem.Max_Value}), in Keys file`)
            }
            
        });

        (getJuniorRemark.length > 0) && getJuniorRemark.forEach((elem, index) => {
            if(elem.Remark == undefined || elem.Remark == null || elem.Remark === '') {
                error.unshift(`Remark at row ${index + 1} on Junior Remark Keys worksheet is empty, in Keys file`)
            }
            if(elem.Min_Value == undefined || elem.Min_Value == null || elem.Min_Value === '') {
                error.unshift(`Minimum Value at row ${index + 1} on Junior Remark Keys worksheet is empty, in Keys file`)
            }
            if(elem.Max_Value == undefined || elem.Max_Value == null || elem.Max_Value === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Junior Remark Keys worksheet is empty, in Keys file`)
            }
            if(elem.Keywords == undefined || elem.Keywords == null || elem.Keywords === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Junior Remark Keys worksheet is empty, in Keys file`)
            }

            if(!IsNumberFraction(elem.Min_Value, null)) {
                error.unshift( `Minimum value at row ${index + 1} on Junior Remark Keys worksheet is not a number (${elem.Min_Value}), in Keys file`)
            }
            if(!IsNumberFraction(elem.Max_Value, null)) {
                error.unshift( `Maximum value at row ${index + 1} on Junior Remark Keys worksheet is not a number (${elem.Max_Value}), in Keys file`)
            }

            if(IsSigned(elem.Min_Value)) {
                error.unshift( `Minimum value at row ${index + 1} on Junior Remark Keys worksheet is signed (${elem.Min_Value}), in Keys file`)
            }
            if(IsSigned(elem.Max_Value)) {
                error.unshift( `Maximum value at row ${index + 1} on Junior Remark Keys worksheet is signed (${elem.Max_Value}), in Keys file`)
            }
            
        });

        (getSeniorGrade.length > 0) && getSeniorGrade.forEach((elem, index) => {
            if(elem.Grade_Name == undefined || elem.Grade_Name == null || elem.Grade_Name === '') {
                error.unshift(`Grade Name at row ${index + 1} on Junior Grade Keys worksheet is empty, in Keys file`)
            }
            if(elem.Min_Value == undefined || elem.Min_Value == null || elem.Min_Value === '') {
                error.unshift(`Minimum Value at row ${index + 1} [${elem.Grade_Name}] <${elem.Min_Value}> on Senior Grade Keys worksheet is empty, in Keys file`)
            }
            if(elem.Max_Value == undefined || elem.Max_Value == null || elem.Max_Value === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Senior Grade Keys worksheet is empty, in Keys file`)
            }

            if(!IsNumberFraction(elem.Min_Value, null)) {
                error.unshift( `Minimum value at row ${index + 1} on Senior Grade Keys worksheet is not a number (${elem.Min_Value}), in Keys file`)
            }
            if(!IsNumberFraction(elem.Max_Value, null)) {
                error.unshift( `Maximum value at row ${index + 1} on Senior Grade Keys worksheet is not a number (${elem.Max_Value}), in Keys file`)
            }

            if(IsSigned(elem.Min_Value)) {
                error.unshift( `Minimum value at row ${index + 1} on Senior Grade Keys worksheet is signed (${elem.Min_Value}), in Keys file`)
            }
            if(IsSigned(elem.Max_Value)) {
                error.unshift( `Maximum value at row ${index + 1} on Senior Grade Keys worksheet is signed (${elem.Max_Value}), in Keys file`)
            }
            
        });

        (getSeniorRemark.length > 0) && getSeniorRemark.forEach((elem, index) => {
            if(elem.Remark == undefined || elem.Remark == null || elem.Remark === '') {
                error.unshift(`Remark at row ${index + 1} on Senior Remark Keys worksheet is empty, in Keys file`)
            }
            if(elem.Min_Value == undefined || elem.Min_Value == null || elem.Min_Value === '') {
                error.unshift(`Minimum Value at row ${index + 1} on Senior Remark Keys worksheet is empty, in Keys file`)
            }
            if(elem.Max_Value == undefined || elem.Max_Value == null || elem.Max_Value === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Senior Remark Keys worksheet is empty, in Keys file`)
            }
            if(elem.Keywords == undefined || elem.Keywords == null || elem.Keywords === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Senior Remark Keys worksheet is empty, in Keys file`)
            }

            if(!IsNumberFraction(elem.Min_Value, null)) {
                error.unshift( `Minimum value at row ${index + 1} on Senior Remark Keys worksheet is not a number (${elem.Min_Value}), in Keys file`)
            }
            if(!IsNumberFraction(elem.Max_Value, null)) {
                error.unshift( `Maximum value at row ${index + 1} on Senior Remark Keys worksheet is not a number (${elem.Max_Value}), in Keys file`)
            }

            if(IsSigned(elem.Min_Value)) {
                error.unshift( `Minimum value at row ${index + 1} on Senior Remark Keys worksheet is signed (${elem.Min_Value}), in Keys file`)
            }
            if(IsSigned(elem.Max_Value)) {
                error.unshift( `Maximum value at row ${index + 1} on Senior Remark Keys worksheet is signed (${elem.Max_Value}), in Keys file`)
            }
            
        });

        (getRatings.length > 0) && getRatings.forEach((elem, index) => {
            if(elem.Rating_Name == undefined || elem.Rating_Name == null || elem.Rating_Name === '') {
                error.unshift(`Rating Name at row ${index + 1} on Rating Keys worksheet is empty, Keys file`)
            }
            if(elem.Min_Value == undefined || elem.Min_Value == null || elem.Min_Value === '') {
                error.unshift(`Minimum Value at row ${index + 1} on Rating Keys worksheet is empty, Keys file`)
            }
            if(elem.Max_Value == undefined || elem.Max_Value == null || elem.Max_Value === '') {
                error.unshift(`Maximum Value at row ${index + 1} on Rating Keys worksheet is empty, Keys file`)
            }
            if(!IsNumber(elem.Min_Value)) {
                error.unshift( `Minimum value at row ${index + 1} on Rating Keys worksheet is not a number, in Keys file`)
            }
            if(!IsNumber(elem.Max_Value)) {
                error.unshift( `Maximum value at row ${index + 1} on Rating Keys worksheet is not a number, in Keys file`)
            }

        });

        if(getGradeMax.length > 0) {
            const elemt = getGradeMax[0];
            if(elemt.CA_Max == undefined || elemt.CA_Max == null || elemt.CA_Max === '') {
                error.unshift(`CA Max at row ${index + 1} on Grade Max worksheet is empty, Keys file`)
            }
            if(elemt.Exam_Max == undefined || elemt.Exam_Max == null || elemt.Exam_Max === '') {
                error.unshift(`Exam Max at row ${index + 1} on Grade Max worksheet is empty, Keys file`)
            }
            if(!IsNumber(elemt.CA_Max)) {
                error.unshift( `CA Max on Grade Max worksheet is not a number, in Keys file`)
            }
            if(!IsNumber(elemt.Exam_Max)) {
                error.unshift( `Exam Max on Grade Max worksheet is not a number, in Keys file`)
            }
            
        };

        if(getSchoolInfo.length == 1) {
            const elem = getSchoolInfo[0];
            if(elem.School_Name == undefined || elem.School_Name == null || elem.School_Name === '') {
                error.unshift(`School Name at row ${index + 1} on School Info worksheet is empty, in Keys file`)
            }
            if(elem.Extra_Info == undefined || elem.Extra_Info == null || elem.Extra_Info === '') {
                error.unshift(`Extra Info at row ${index + 1} on School Info worksheet is empty, in Keys file`)
            }
            if(elem.Address == undefined || elem.Address == null || elem.Address === '') {
                error.unshift(`Address at row ${index + 1} on School Info worksheet is empty, in Keys file`)
            }
            if(elem.Title == undefined || elem.Title == null || elem.Title === '') {
                error.unshift(`Title at row ${index + 1} on School Info worksheet is empty, in Keys file`)
            }
            if(elem.Watermark == undefined || elem.Watermark == null || elem.Watermark === '') {
                feedback.unshift(`Watermark at row ${index + 1} on School Info worksheet is empty, in Keys file`)
            }

        };
        getErrorCount('verify #32: if empty values exist for entered data set in Keys file');

        // verify #33: if extra row(s) was added to School Info field in Keys file
        if(getSchoolInfo.length > 1){
            let rowError = [];
            getSchoolInfo.forEach((elem, index) => {
                if((elem.School_Name != null && elem.School_Name !== '') || 
                    (elem.Extra_Info != null && elem.Extra_Info !== '') || 
                    (elem.Address != null && elem.Address !== '') || 
                    (elem.Title != null && elem.Title !== '') || 
                    (elem.Watermark != null && elem.Watermark !== '')) {
                        (index > 0) && rowError.push(index + 1)
                }
            });
            (rowError.length > 0) && error.unshift(`Found ${getSchoolInfo.length} rows of data at (${rowError.toString()}) against expected 1 row, on School Info worksheet, in Keys file`);
        
            getErrorCount('verify #33: if extra row(s) was added to School Info field in Keys file');
        }

        // verify #34: if any worksheet is empty for in Pool file
        (getPrincipalComment.length < 1) && error.unshift('Principal Comment worksheet is empty in Pool file');
        (getTeacherComment.length < 1) && error.unshift('Teacher Comment worksheet is empty in Pool file');
        (getSkills.length < 1) && error.unshift('Skills worksheet is empty in Pool file');
        (getSports.length < 1) && error.unshift('Sports worksheet is empty in Pool file');
        (getCurricular.length < 1) && error.unshift('Curricular worksheet is empty in Pool file');
        (getBehaviour.length < 1) && error.unshift('Behaviour worksheet is empty in Pool file');
        
        getErrorCount('verify #34: if any worksheet is empty for in Pool file');

        
        // verify #35: if Forced Frequency is set for any value, must be a number for Principal & Teacher Comment, in Pool file
        (getPrincipalComment.length > 0) && getPrincipalComment.forEach((elem, index) => {
            if(elem.Pool == undefined && elem.Frequency != undefined && elem.Frequency != null) {
                error.unshift(`Frequency ${elem.Frequency} was set for empty comment at row ${index + 1}, on Principal Comment worksheet, in Pool file`)
            }
            if(elem.Pool != undefined && elem.Frequency != undefined && elem.Frequency != null && elem.Frequency !== '' && !IsNumber(elem.Frequency)) {
                error.unshift(`Frequency "${elem.Frequency}" set at row ${index + 1} is not a number, on Principal Comment worksheet, in Pool file`)
            }
            if(elem.Frequency == undefined) {
                result.principalComment[index].Frequency = null
            }
        });
        
        (getTeacherComment.length > 0) && getTeacherComment.forEach((elem, index) => {
            if(elem.Pool == undefined && elem.Frequency != undefined && elem.Frequency != null) {
                error.unshift(`Frequency ${elem.Frequency} was set for empty comment at row ${index + 1}, on Teacher Comment worksheet, in Pool file`)
            }
            if(elem.Pool != undefined && elem.Frequency != undefined && elem.Frequency != null && elem.Frequency !== '' && !IsNumber(elem.Frequency)) {
                error.unshift(`Frequency "${elem.Frequency}" set at row ${index + 1} is not a number, on Teacher Comment worksheet, in Pool file`)
            }
            if(elem.Frequency == undefined) {
                result.teacherComment[index].Frequency = null
            }
        });
        
        getErrorCount('verify #35: if Forced Frequency is set for any value, must be a number for Principal & Teacher Comment, in Pool file');

        
        // verify #36: if Override Minimum is set for any value, must be a number for Skills, Sports, Curricular, Behaviour, in Pool file
        (getSkills.length > 0) && getSkills.forEach((elem, index) => {
            if(elem.Pool == undefined && elem.Override != undefined && elem.Override != null) {
                error.unshift(`Override Minimum ${elem.Override} was set for empty data at row ${index + 1}, on Skills worksheet, in Pool file`)
            }
            if(elem.Pool != undefined && elem.Override != undefined && elem.Override != null && elem.Override !== '' && !IsNumber(elem.Override)) {
                error.unshift(`Override Minimum "${elem.Override}" set at row ${index + 1} is not a number, on Skills worksheet, in Pool file`)
            }
            if(elem.Override == undefined) {
                result.skills[index].Override = null
            }
        });
        
        (getSports.length > 0) && getSports.forEach((elem, index) => {
            if(elem.Pool == undefined && elem.Override != undefined && elem.Override != null) {
                error.unshift(`Override Minimum ${elem.Override} was set for empty data at row ${index + 1}, on Sports worksheet, in Pool file`)
            }
            if(elem.Pool != undefined && elem.Override != undefined && elem.Override != null && elem.Override !== '' && !IsNumber(elem.Override)) {
                error.unshift(`Override Minimum "${elem.Override}" set at row ${index + 1} is not a number, on Sports worksheet, in Pool file`)
            }
            if(elem.Override == undefined) {
                result.sports[index].Override = null
            }
        });
        
        (getCurricular.length > 0) && getCurricular.forEach((elem, index) => {
            if(elem.Pool == undefined && elem.Override != undefined && elem.Override != null) {
                error.unshift(`Override Minimum ${elem.Override} was set for empty data at row ${index + 1}, on Curricular worksheet, in Pool file`)
            }
            if(elem.Pool != undefined && elem.Override != undefined && elem.Override != null && elem.Override !== '' && !IsNumber(elem.Override)) {
                error.unshift(`Override Minimum "${elem.Override}" set at row ${index + 1} is not a number, on Curricular worksheet, in Pool file`)
            }
            if(elem.Override == undefined) {
                result.curricular[index].Override = null
            }
        });
        
        (getBehaviour.length > 0) && getBehaviour.forEach((elem, index) => {
            if(elem.Pool == undefined && elem.Override != undefined && elem.Override != null) {
                error.unshift(`Override Minimum ${elem.Override} was set for empty data at row ${index + 1}, on Behaviour worksheet, in Pool file`)
            }
            if(elem.Pool != undefined && elem.Override != undefined && elem.Override != null && elem.Override !== '' && !IsNumber(elem.Override)) {
                error.unshift(`Override Minimum "${elem.Override}" set at row ${index + 1} is not a number, on Behaviour worksheet, in Pool file`)
            }
            if(elem.Override == undefined) {
                result.behaviour[index].Override = null
            }
        });
        
        completed = true;
        getErrorCount('verify #36: if Override Minimum is set for any value, must be a number for Skills, Sports, Curricular, Behaviour, in Pool file');

    }


        (async () => {
            await sortFirstTermSubjects();
            await sortSecondTermSubjects();
            await sortThirdTermSubjects();
            sortEnd()
        })()

    } catch (err) {
        error.unshift(err)
    }

    const res = {
        data: result,
        error: error,
        feedback: feedback
    }

    return res;
}

module.exports = {
    VerifyResults: verifyResults
}