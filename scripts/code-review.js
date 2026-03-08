const fs = require('fs');
const path = require('path');

console.log('🔍 Running Code Review...\n');

const issues = [];

// Check for common issues
function reviewFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const filename = path.basename(filepath);
  
  // Check for console.logs in production
  if (content.includes('console.log') && !filepath.includes('test')) {
    issues.push(`⚠️  ${filename}: Contains console.log statements`);
  }
  
  // Check for hardcoded credentials
  if (content.match(/password.*=.*['"][^'"]+['"]/i)) {
    issues.push(`🚨 ${filename}: Possible hardcoded password`);
  }
  
  // Check for missing error handling
  if (content.includes('await ') && !content.includes('try {')) {
    issues.push(`⚠️  ${filename}: Async code without try-catch`);
  }
  
  // Check file size
  const lines = content.split('\n').length;
  if (lines > 500) {
    issues.push(`📏 ${filename}: Large file (${lines} lines) - consider splitting`);
  }
}

// Review all JS files
const jsFiles = [
  'js/main.js',
  'js/admin.js',
  // Add more files
];

jsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    reviewFile(file);
  }
});

// Report
console.log('📊 Code Review Results:\n');
if (issues.length === 0) {
  console.log('✅ No issues found!');
} else {
  issues.forEach(issue => console.log(issue));
  console.log(`\n❌ Found ${issues.length} issue(s)`);
}
