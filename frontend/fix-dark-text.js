const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace text-slate-X without blindly duplicating existing dark:text-
    // We use a regex that matches text-slate-X and then we check if it already has dark:text- in the same className string.
    // A simpler way: just replace, then clean up duplicates.

    // 1. Append dark:text- variants
    content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-50');
    content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
    content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
    content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');

    // 2. Clean up duplicates if the original code already had dark:text- variants
    // Examples: "text-slate-900 dark:text-slate-50 dark:text-white" -> "text-slate-900 dark:text-white"
    // "text-slate-800 dark:text-slate-200 dark:text-slate-300" -> "text-slate-800 dark:text-slate-300"
    
    // We can do this by finding all className="..." and deduplicating or prioritizing the latter.
    // Actually, a simpler regex for cleanup:
    content = content.replace(/dark:text-slate-\d+\s+(dark:text-[a-z0-9-]+)/g, '$1');
    content = content.replace(/dark:text-slate-\d+\s+(dark:text-[a-z0-9-]+)/g, '$1'); // run twice just in case
    
    // Clean up exact duplicates
    content = content.replace(/dark:text-slate-50\s+dark:text-slate-50/g, 'dark:text-slate-50');
    content = content.replace(/dark:text-slate-200\s+dark:text-slate-200/g, 'dark:text-slate-200');
    content = content.replace(/dark:text-slate-300\s+dark:text-slate-300/g, 'dark:text-slate-300');
    content = content.replace(/dark:text-slate-400\s+dark:text-slate-400/g, 'dark:text-slate-400');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
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
