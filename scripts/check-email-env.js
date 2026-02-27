require('dotenv').config();
console.log('Checking email configuration (Resend)...');

const requiredVars = ['RESEND_API_KEY'];
const missingVars = [];

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        missingVars.push(varName);
    } else {
        console.log(`✅ ${varName} is set`);
    }
});

if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
} else {
    console.log('✅ Resend API key is present.');
}
