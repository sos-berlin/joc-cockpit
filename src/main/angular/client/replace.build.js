var replaceFile = require('replace-in-file');
var package = require("./package.json");
var buildVersion = package.version;
const options = {
	files: 'src/environments/environment.prod.ts',
	from: /version: '(.*)'/g,
	to: "version: '"+ buildVersion + "'",
	allowEmptyPaths: false,
};

try {
	let changeFiles = replaceFile.sync(options);
	 if (changeFiles == 0) {
		throw "Please make sure file have version";
	 }
	console.log('Build version set: ' + buildVersion);
}
catch (error) {
	console.error('Error occurred:', error);
	throw error
}