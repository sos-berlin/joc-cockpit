const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const moment = require("moment/moment");
let db;

function createTable(dbName, type) {
    db = new sqlite3.Database(path.join('tmp', dbName) + '.db');
    try {
        if (type === 'ORDER') {
            db.run('CREATE TABLE ' + type.toLowerCase() + 's (id INTEGER PRIMARY KEY, ORDER_ID TEXT, WORKFLOW_NAME TEXT, START_TIME DATE, END_TIME DATE, PLANNED_TIME DATE, ORDER_STATE INTEGER, STATE INTEGER, duration INTEGER)');
        } else {
            db.run('CREATE TABLE ' + type.toLowerCase() + 's (id INTEGER PRIMARY KEY, WORKFLOW_NAME TEXT, JOB_NAME TEXT, AGENT_NAME TEXT, START_TIME DATE, END_TIME DATE, CRITICALITY INTEGER, STATE INTEGER, duration INTEGER)');

        }
    } catch (e) {
        console.log(e, type)
    }
}

function insertRecord(dataToInsert, type) {
    db.serialize(() => {
        // Start the transaction
        db.run('BEGIN TRANSACTION');
        let stmt;
        if (type === 'ORDER') {
            // Prepare the INSERT statement
            stmt = db.prepare('INSERT INTO orders ( ORDER_ID, WORKFLOW_NAME, START_TIME, END_TIME, PLANNED_TIME, ORDER_STATE, STATE, duration) VALUES (?, ?,?, ?,?, ?,?, ?)');
        } else {
            // Prepare the INSERT statement
            stmt = db.prepare('INSERT INTO jobs ( WORKFLOW_NAME, JOB_NAME, AGENT_NAME, START_TIME, END_TIME, CRITICALITY, STATE, duration) VALUES (?, ?,?, ?,?, ?,?, ?)');
        }
        // Insert data in batch
        dataToInsert.forEach(data => {
            if (type === 'ORDER') {
                stmt.run(data['ORDER_ID'], data['WORKFLOW_NAME'], data['START_TIME'], data['END_TIME'], data['PLANNED_TIME'], data['ORDER_STATE'], data['STATE'], data['duration']);
            } else {
                stmt.run(data['WORKFLOW_NAME'], data['JOB_NAME'], data['AGENT_NAME'], data['START_TIME'], data['END_TIME'], data['CRITICALITY'], data['STATE'], data['duration']);
            }
        });

        // Finalize the statement
        stmt.finalize();
        // Commit the transaction
        db.run('COMMIT');
    });
}

async function processRows(rows, template) {
    const batchSize = 1000; // Adjust the batch size as needed

    async function processBatch(batch) {
        for (const row of batch) {
            if (template.data.groupBy === 'AGENT_NAME') {
                let maxParallelJobs = 0;
                let maxParallelJobData = [];
                let _data = row.data.split('},').map(child => JSON.parse(child + (child.endsWith('}') ? '' : '}')));
                await _data.reduce(async (currentJobsPromise, job) => {
                    const currentJobs = await currentJobsPromise;
                    const overlappingJobs = currentJobs.filter(j => {
                        j.START_TIME = moment(j.START_TIME, 'YYYY-MM-DD HH:mm:ss');
                        j.END_TIME = moment(j.END_TIME, 'YYYY-MM-DD HH:mm:ss');
                        return (j.START_TIME.isBefore(job.START_TIME) && j.END_TIME.isAfter(job.START_TIME)) || (j.START_TIME.isSameOrBefore(job.START_TIME) && j.END_TIME.isSameOrAfter(job.END_TIME));
                    });
                    currentJobs.push(job);
                    if (overlappingJobs.length + 1 > maxParallelJobs) {
                        maxParallelJobs = overlappingJobs.length + 1;
                        maxParallelJobData = currentJobs.map(({WORKFLOW_NAME, JOB_NAME, START_TIME, duration}) => ({
                            WORKFLOW_NAME,
                            JOB_NAME,
                            START_TIME,
                            duration
                        }));
                    }

                    return currentJobs.filter(j => {
                        j.END_TIME = moment(j.END_TIME, 'YYYY-MM-DD HH:mm:ss');
                        return j.END_TIME.isAfter(job.START_TIME);
                    });
                }, Promise.resolve([]));

                row.count = maxParallelJobs;
                row.data = maxParallelJobData;
            } else {
                row.data = row.data?.split('},').map(child => JSON.parse(child + (child.endsWith('}') ? '' : '}')).START_TIME);
            }
        }
    }

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await processBatch(batch);
    }
}


function getDataFromDb(template, tableName, limit, file, callback) {
    let query;
    if (tableName === 'orders') {
        query = getQueryForOrder(limit, file, template.data);
    } else {
        query = getQueryForJob(limit, file, template.data);
    }
    console.log(`Read data from db wth sql query: `, query)

    db.all(query, [], async (err, rows) => {
        if (err) {
            console.error(err.message);
            callback(err, null);
            return;
        }
        if(template.data.execution === 'PARALLELISM'){
            // Process the fetched data to identify periods of parallelism
            const groupedData = Object.values(rows.reduce((acc, curr) => {
                const startTime = curr.START_TIME.split(' ')[0];
                acc[startTime] = acc[startTime] || [];
                acc[startTime].push(curr);
                return acc;
            }, {})).flatMap(group => {
                return group.reduce((acc, curr, index) => {
                    if (index === 0 || new Date(group[index - 1].END_TIME).getTime() <= new Date(curr.START_TIME).getTime()) {
                        acc.push(curr);
                    } else {
                        acc.push({
                            START_TIME: curr.START_TIME,
                            END_TIME: curr.END_TIME,
                            WORKFLOW_NAME: curr.WORKFLOW_NAME,
                            JOB_NAME: curr.JOB_NAME,
                            AGENT_NAME: curr.AGENT_NAME,
                            duration: Math.abs((new Date(curr.START_TIME).getTime() - new Date(group[index - 1].END_TIME).getTime()) / 1000)
                        });
                    }
                    return acc;
                }, []);
            }).sort((a, b) => new Date(a.START_TIME) - new Date(b.START_TIME));

            // Identify top low parallelism periods
            const periods = [];
            let currentPeriod = [];

            groupedData.forEach(job => {
                const lastJob = currentPeriod[currentPeriod.length - 1];
                if (!lastJob || new Date(lastJob.END_TIME).getTime() <= new Date(job.START_TIME).getTime()) {
                    currentPeriod.push(job);
                } else {
                    periods.push(currentPeriod);
                    currentPeriod = [job];
                }
            });

            const sortedPeriods = periods.sort((a, b) => b.length - a.length);

            // Format output for top low parallelism periods and top high parallelism periods
            const output = {
                topLowParallelismPeriods: sortedPeriods.slice(0, limit).map(period => ({
                    period: `${period[0].START_TIME} - ${period[period.length - 1].END_TIME}`,
                    data: period.map(({ WORKFLOW_NAME, JOB_NAME, AGENT_NAME, START_TIME, duration }) => ({
                        WORKFLOW_NAME,
                        JOB_NAME,
                        AGENT_NAME,
                        START_TIME,
                        duration
                    }))
                })),
                topHighParallelismPeriods: sortedPeriods.slice(-limit).reverse().map(period => ({
                    period: `${period[0].START_TIME} - ${period[period.length - 1].END_TIME}`,
                    data: period.map(({ WORKFLOW_NAME, JOB_NAME, AGENT_NAME, START_TIME, duration }) => ({
                        WORKFLOW_NAME,
                        JOB_NAME,
                        AGENT_NAME,
                        START_TIME,
                        duration
                    }))
                }))
            };
            callback(null, output);
        } else {
            await processRows(rows, template);
            callback(null, rows);
        }
    });

}

function getWhereCondition(likeStr) {
    if (likeStr.match('_to_')) {
        let dates = likeStr.split('_to_');
        return `WHERE START_TIME BETWEEN '${dates[0]} 00:00:00' AND '${dates[1]} 23:59:59'`;
    } else if (likeStr.match('-Q')) {
        const year = parseInt(likeStr.substring(0, 4));
        const quarterNumber = parseInt(likeStr.substring(6));
        let startDate, endDate;
        switch (quarterNumber) {
            case 1:
                startDate = `${year}-01-01`;
                endDate = `${year}-03-31`;
                break;
            case 2:
                startDate = `${year}-04-01`;
                endDate = `${year}-06-30`;
                break;
            case 3:
                startDate = `${year}-07-01`;
                endDate = `${year}-09-30`;
                break;
            case 4:
                startDate = `${year}-10-01`;
                endDate = `${year}-12-31`;
                break;
            default:
                throw new Error('Invalid quarter number');
        }
        return `WHERE START_TIME BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;
    } else if (likeStr.match('-H')) {
        const year = parseInt(likeStr.substring(0, 4));
        const halfYearNumber = parseInt(likeStr.substring(6));
        let startDate, endDate;
        switch (halfYearNumber) {
            case 1:
                startDate = `${year}-01-01`;
                endDate = `${year}-06-30`;
                break;
            case 2:
                startDate = `${year}-07-01`;
                endDate = `${year}-12-31`;
                break;
            default:
                throw new Error('Invalid quarter number');
        }
        return `WHERE START_TIME BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;
    } else if (/^\d{4}-\d{4}$/.test(likeStr)) {
        let dates = likeStr.split('-');
        return `WHERE START_TIME BETWEEN '${dates[0]}-01-01 00:00:00' AND '${dates[1]}-12-31 23:59:59'`;
    } else {
        return `WHERE START_TIME like '${likeStr}%'`;
    }
}

function getQueryForJob(limit, likeStr, templateData) {
    const conditionQuery = getWhereCondition(likeStr);
    if (templateData.groupBy === 'JOB_NAME') { // template 2 && 5
        return `SELECT WORKFLOW_NAME || '__' || JOB_NAME AS job_name, COUNT(*) AS count, 
           GROUP_CONCAT(json_object('id', id, 'START_TIME', START_TIME)) AS data
           FROM jobs ${conditionQuery} GROUP BY WORKFLOW_NAME, JOB_NAME ORDER BY count desc limit ${limit};`;
    } else if (templateData.groupBy === 'START_TIME' && templateData.execution === "DURATION") { // template 8
        return `SELECT  WORKFLOW_NAME, JOB_NAME, START_TIME, duration FROM jobs ${conditionQuery} ORDER BY duration desc limit ${limit};`;
    } else if (templateData.groupBy === 'AGENT_NAME') { // template 3
        return `SELECT AGENT_NAME As agentName, 
           GROUP_CONCAT(json_object('id', id, 'WORKFLOW_NAME', WORKFLOW_NAME, 'JOB_NAME', JOB_NAME, 'START_TIME', START_TIME, 'END_TIME', END_TIME, 'STATE', STATE, 'duration', duration)) AS data
           FROM jobs ${conditionQuery} GROUP BY AGENT_NAME ORDER BY AGENT_NAME desc limit ${limit};`;
    } else if (templateData.groupBy === 'START_TIME' && templateData.execution === "PARALLELISM") { // template 4
        return `SELECT WORKFLOW_NAME, JOB_NAME, AGENT_NAME, START_TIME, END_TIME FROM jobs ${conditionQuery} ORDER BY START_TIME;`;
    } else {
        return `SELECT START_TIME As startTime, 
            GROUP_CONCAT(json_object('id', id, 'WORKFLOW_NAME', WORKFLOW_NAME, 'JOB_NAME', JOB_NAME, 'START_TIME', START_TIME, 'END_TIME', END_TIME, 'STATE', STATE, 'duration', duration)) AS data
            FROM jobs ${conditionQuery} GROUP BY START_TIME ORDER BY START_TIME desc limit ${limit};`;
    }
}

function getQueryForOrder(limit, likeStr, templateData) {
    const conditionQuery = getWhereCondition(likeStr);
    if (templateData.orderState) { // template 6
        return `SELECT WORKFLOW_NAME AS workflow_name, COUNT(*) AS count, 
           GROUP_CONCAT(json_object('id', id, 'WORKFLOW_NAME', WORKFLOW_NAME, 'START_TIME', START_TIME, 'END_TIME', END_TIME, 'ORDER_STATE', ORDER_STATE, 'STATE', STATE, 'duration', duration)) AS data
           FROM orders ${conditionQuery} GROUP BY  WORKFLOW_NAME ORDER BY count desc limit ${limit};`;
    } else if (templateData.execution) { // template 7
        return `SELECT WORKFLOW_NAME, START_TIME, duration FROM orders ${conditionQuery} ORDER BY duration desc limit ${limit};`;
    } else if (templateData.groupBy === 'START_TIME') { // template 9
        return `SELECT * FROM orders ${conditionQuery} ORDER BY duration desc limit ${limit};`;
    } else { // template 1
        return `SELECT WORKFLOW_NAME AS workflow_name, COUNT(*) AS count, 
           GROUP_CONCAT(json_object('id', id, 'WORKFLOW_NAME', WORKFLOW_NAME, 'START_TIME', START_TIME, 'END_TIME', END_TIME, 'ORDER_STATE', ORDER_STATE, 'STATE', STATE, 'duration', duration)) AS data
           FROM orders ${conditionQuery} GROUP BY  WORKFLOW_NAME ORDER BY count desc limit ${limit};`;
    }
}

function closeConnection() {
    // Close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database connection closed.');
    });
}

function deleteDb(databaseFile) {
    // Check if the file exists
    fs.access(databaseFile, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Database file does not exist:', err);
            return;
        }

        // Delete the database file
        fs.unlink(databaseFile, (err) => {
            if (err) {
                console.error('Error deleting database file:', err);
                return;
            }
            console.log('Database file deleted successfully.');
        });
    });
}

module.exports = {
    createTable: createTable,
    insertRecord: insertRecord,
    getDataFromDb: getDataFromDb,
    deleteDb: deleteDb,
    closeConnection: closeConnection
};