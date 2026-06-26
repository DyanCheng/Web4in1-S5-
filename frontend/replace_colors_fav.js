const fs = require('fs');

const files = [
  {
    path: 'c:/Users/panhh/CNPM/Web4in1-S5-/frontend/src/app/favorites/page.tsx',
    replaces: [
      { regex: /rose-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /pink-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /red-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /amber-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /orange-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /from-blue-500 via-blue-600 to-blue-700/g, replacement: 'from-blue-700 via-blue-800 to-blue-950' },
      { regex: /from-blue-500 to-blue-600/g, replacement: 'from-blue-600 to-blue-800' },
      { regex: /from-blue-100 to-blue-200/g, replacement: 'from-blue-100 to-blue-200' },
      { regex: /from-blue-900\/30 to-blue-900\/30/g, replacement: 'from-blue-900/30 to-blue-900/30' },
      { regex: /from-blue-400 to-blue-500/g, replacement: 'from-blue-400 to-blue-600' }
    ]
  }
];

files.forEach(f => {
  if (fs.existsSync(f.path)) {
    let content = fs.readFileSync(f.path, 'utf8');
    f.replaces.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });
    fs.writeFileSync(f.path, content, 'utf8');
    console.log(`Replaced colors in ${f.path}`);
  } else {
    console.log(`File not found: ${f.path}`);
  }
});
