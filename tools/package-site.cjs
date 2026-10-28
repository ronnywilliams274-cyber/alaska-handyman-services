const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = ['index.html','services.html','projects.html','about.html','service-areas.html','estimate.html','styles.css','home.css','hierarchy.css','main.js','lead-form.js','logo.svg','before.png','after.png','before1.png','after1.png','hero.mp4','mobilehero.mp4'];
const output = path.join(root,'publish');
fs.mkdirSync(output, { recursive:true });
for (const file of files) fs.copyFileSync(path.join(root,file),path.join(output,file));
console.log(`Prepared ${files.length} website files in ${output}. No tests, backups, or development files included.`);
