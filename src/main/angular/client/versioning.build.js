const fs = require('fs');
const path = require('path')
const replaceFile = require('replace-in-file');
const os = require('os');
let buildPath = '\\';
if (os.platform() === 'linux') {
  buildPath = '//';
}

const appendUrl = '?v=' + new Date().getTime();

const relativePath = 'dist'; // relative build path
buildPath += relativePath ? relativePath.replace(/\//g, '\\') : relativePath;
const indexPath = __dirname + buildPath + path.sep + 'index.html';

console.log('Angular build path:', __dirname + buildPath);

fs.readdir(__dirname + buildPath, (err, files) => {
  if (files) {
    files.forEach(file => {
      if (file.match(/\.[0-9a-z\-]*(js|css)$/g)) {
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
    from: '"' + currentfilename + '"',
    to: '"' + changedfilename + '"',
    allowEmptyPaths: false,
  };

  try {
    let changedFiles = replaceFile.sync(options);
    if (changedFiles?.length > 0 && changedFiles[0].hasChanged === false) {
      console.log("File already updated...");
    }
    console.log('Changed Filename:', changedfilename);
    // process.exit(1);
  } catch (error) {
    console.error('Error occurred:', error);
    //throw error
  }
}
