const { analyzeMedicalReport } = require('./services/gemini');
const fs = require('fs');

async function test() {
    fs.writeFileSync('dummy.txt', 'This is a test medical report.');
    try {
        const result = await analyzeMedicalReport('dummy.txt', 'text/plain');
        console.log("Success:");
        console.log(result);
    } catch (e) {
        console.error("Error occurred:", e);
    }
}

test();
