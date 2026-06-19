const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const regex1 = /\/\/ ============================================================\n\/\/ 📚 LEARN:[\s\S]*?\/\/ ============================================================\n/g;
// some might be missing the 3rd line or have different formats, but all have the first two.
// Let's use a regex that matches from // ==== \n // 📚 LEARN: down to the next empty line or next // ==== block and the empty line after it.
const regex2 = /\/\/ ============================================================\n\/\/ 📚 LEARN:[\s\S]*?(?=\n\n|\n[A-Za-z]|\nexport|\nimport|\nconst)/g;

walkDir('./src', function(filePath) {
    if (!filePath.match(/\.(ts|tsx)$/)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Also remove single line // 📚 LEARN: ... just in case
    let newContent = content.replace(/\/\/ ============================================================\n\/\/ 📚 LEARN:[\s\S]*?\/\/ ============================================================\n/g, '');
    newContent = newContent.replace(/\/\/ 📚 LEARN:.*\n/g, '');
    
    if(newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log('Cleaned:', filePath);
    }
});
