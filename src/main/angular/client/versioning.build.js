var fs = require('fs');
const path = require('path')
var replaceFile = require('replace-in-file');
var angular = require("./angular.json");
var buildPath = '\\';
var defaultProject = angular.defaultProject;
var appendUrl = '?v=' + new Date().getTime();

const getNestedObject = (nestedObj, pathArr) => {
	return pathArr.reduce((obj, key) =>
		(obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
}

const relativePath = getNestedObject(angular, ['projects',defaultProject,'architect','build','options','outputPath']); // relative build path
buildPath += relativePath.replace(/[/]/g, '\\');
var indexPath = __dirname + buildPath + path.sep + 'index.html';

console.log('Angular build path:', __dirname + buildPath);

fs.readdir(__dirname + buildPath, (err, files) => {
  if(files) {
    files.forEach(file => {
      if (file.match(/^(es2015-polyfills|main|polyfills|runtime|scripts|styles)+([a-z0-9.\-])*(js|css)$/g)) {
        console.log('Current Filename:', file);
        const currentPath = file;
        const changePath = file + appendUrl;
        changeIndex(currentPath, changePath);
      }
    });
  }
});

function changeIndex(currentfilename, changedfilename) {

	const options = {
		files: indexPath,
		from: '"'+ currentfilename + '"',
		to: '"'+ changedfilename + '"',
		allowEmptyPaths: false,
	};

	try {
		let changedFiles = replaceFile.sync(options);
		if (changedFiles == 0) {
			console.log("File updated failed");
		} else if (changedFiles[0].hasChanged === false) {
			console.log("File already updated");
		}
		console.log('Changed Filename:',changedfilename);
		// process.exit(1);
	}
	catch (error) {
		console.error('Error occurred:', error);
		throw error
	}
}
