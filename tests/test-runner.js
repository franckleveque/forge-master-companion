// tests/test-runner.js
import fs from 'fs';
import path from 'path';

const suitesDir = path.resolve(process.cwd(), 'tests/passives/suites');
const testFiles = fs.readdirSync(suitesDir).filter(file => file.endsWith('.js'));

async function runAllTests() {
    let allTests = {};
    for (const file of testFiles) {
        const modulePath = path.join(suitesDir, file);
        const testModule = await import(`file://${modulePath}`);
        const testSuite = Object.values(testModule)[0]; // Assuming one export per file
        Object.assign(allTests, testSuite);
    }

    let passed = 0;
    let failed = 0;
    for (const [suiteName, suiteTests] of Object.entries(allTests)) {
        console.log(`\nRunning suite: ${suiteName}`);
        for (const [testName, testFn] of Object.entries(suiteTests)) {
            try {
                testFn();
                console.log(`  ✓ ${testName}`);
                passed++;
            } catch (error) {
                console.error(`  ✗ ${testName}`);
                console.error(error.message);
                failed++;
            }
        }
    }
    console.log(`\nTests passed: ${passed}, Tests failed: ${failed}`);
    if (failed > 0) {
        process.exit(1);
    }
}

runAllTests();
