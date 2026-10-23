import { playwrightBotService } from '../modules/verifications/playwrightBot.service';

async function testBot() {
  console.log('Testing Real Playwright Automation Bot...\n');

  const mockCandidate = {
    firstName: 'Kartik',
    lastName: 'Thorat',
    education: [
      {
        institution: 'Vishwakarma Institute of Technology, Pune',
        degree: 'Bachelor of Technology in Artificial Intelligence & Data Science',
        rollNumber: '12210087',
        endYear: 2026,
        grade: '9.1 CGPA',
      },
    ],
    employment: [
      {
        company: 'Infosys Limited',
        designation: 'Software Engineer',
        employeeId: 'INF-48291',
        startDate: 'Jan 2023',
        endDate: 'Present',
      },
    ],
  };

  console.log('--- TEST 1: EDUCATION VERIFICATION WITH PLAYWRIGHT ---');
  const eduResult = await playwrightBotService.executeVerification({
    candidate: mockCandidate,
    verificationType: 'education',
  });

  console.log('Edu Result Status:', eduResult.status, 'Result:', eduResult.result);
  console.log('Confidence:', eduResult.confidence);
  console.log('Summary:', eduResult.summary);
  console.log('SHA-256 Digest:', eduResult.evidenceSha256);
  console.log('Screenshot Base64 Length:', eduResult.screenshotBase64.length);
  console.log('Bot Logs:', eduResult.botLogs);

  console.log('\n--- TEST 2: EMPLOYMENT VERIFICATION WITH PLAYWRIGHT ---');
  const empResult = await playwrightBotService.executeVerification({
    candidate: mockCandidate,
    verificationType: 'employment',
  });

  console.log('Emp Result Status:', empResult.status, 'Result:', empResult.result);
  console.log('SHA-256 Digest:', empResult.evidenceSha256);
  console.log('Screenshot Base64 Length:', empResult.screenshotBase64.length);
  console.log('Bot Logs count:', empResult.botLogs.length);

  console.log('\n ALL REAL PLAYWRIGHT TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

testBot().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
