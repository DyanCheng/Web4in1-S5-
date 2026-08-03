const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace bg-white (but not bg-white/something)
    // We use a regex with word boundaries or negative lookahead for /
    // \bbg-white\b(?!\/) will match bg-white but not bg-white/90
    content = content.replace(/\bbg-white\b(?!\/)/g, 'bg-white dark:bg-slate-900');

    // Clean up duplicates (e.g. if it already had dark:bg-something)
    content = content.replace(/dark:bg-slate-900\s+(dark:bg-[a-z0-9-]+)/g, '$1');
    content = content.replace(/dark:bg-[a-z0-9-]+\s+dark:bg-[a-z0-9-]+/g, (match) => {
        const parts = match.split(/\s+/);
        // keep the second one if they are different, or just keep one if they are the same
        return parts[1] || parts[0];
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated bg in ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
