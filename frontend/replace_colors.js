const fs = require('fs');

const files = [
  {
    path: 'c:/Users/panhh/CNPM/Web4in1-S5-/frontend/src/app/flight/page.tsx',
    replaces: [
      { regex: /sky-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /from-blue-700 via-blue-800 to-indigo-900/g, replacement: 'from-blue-700 via-blue-800 to-blue-950' },
      { regex: /from-slate-950 to-blue-950/g, replacement: 'from-blue-900 to-blue-950' }
    ]
  },
  {
    path: 'c:/Users/panhh/CNPM/Web4in1-S5-/frontend/src/app/bus/page.tsx',
    replaces: [
      { regex: /orange-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /amber-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /rose-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /from-blue-600 via-blue-600 to-blue-700/g, replacement: 'from-blue-700 via-blue-800 to-blue-950' },
      { regex: /from-blue-900 to-blue-900/g, replacement: 'from-blue-900 to-blue-950' }
    ]
  },
  {
    path: 'c:/Users/panhh/CNPM/Web4in1-S5-/frontend/src/app/vehicle/page.tsx',
    replaces: [
      { regex: /indigo-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /cyan-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /from-blue-700 via-blue-800 to-blue-800/g, replacement: 'from-blue-700 via-blue-800 to-blue-950' },
      { regex: /from-blue-900 to-blue-900/g, replacement: 'from-blue-900 to-blue-950' }
    ]
  },
  {
    path: 'c:/Users/panhh/CNPM/Web4in1-S5-/frontend/src/app/insurance/page.tsx',
    replaces: [
      { regex: /emerald-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /teal-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /cyan-(\d{2,3})/g, replacement: 'blue-$1' },
      { regex: /from-blue-600 via-blue-700 to-blue-800/g, replacement: 'from-blue-700 via-blue-800 to-blue-950' },
      { regex: /from-blue-600 to-blue-700/g, replacement: 'from-blue-900 to-blue-950' }
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
