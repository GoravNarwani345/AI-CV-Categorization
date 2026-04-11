// Test script to verify company filtering logic
// Run with: node backend/test-company-filter.js

// Helper function to check if job company matches user's company
const isUserCompany = (jobCompany, currentCompanies) => {
    if (!jobCompany) return false;
    const jobCompanyLower = jobCompany.trim().toLowerCase();
    
    return currentCompanies.some(userCompany => {
        // Extract main keywords (remove common words like university, institute, etc.)
        const extractKeywords = (name) => {
            return name
                .replace(/\b(university|institute|college|campus|technology|sciences?|pvt|ltd|limited|inc|corporation|company)\b/gi, '')
                .trim()
                .split(/\s+/)
                .filter(word => word.length > 2);
        };
        
        const userKeywords = extractKeywords(userCompany);
        const jobKeywords = extractKeywords(jobCompanyLower);
        
        // Check if any significant keyword matches
        if (userKeywords.length > 0 && jobKeywords.length > 0) {
            const hasMatch = userKeywords.some(uk => 
                jobKeywords.some(jk => jk.includes(uk) || uk.includes(jk))
            );
            if (hasMatch) return true;
        }
        
        // Also check direct substring match
        return jobCompanyLower.includes(userCompany) || userCompany.includes(jobCompanyLower);
    });
};

// Test cases
console.log('🧪 Testing Company Filtering Logic\n');

const testCases = [
    {
        userCompanies: ['szabist university hyderabad'],
        jobCompany: 'SZABIST',
        expected: true,
        description: 'SZABIST University employee should NOT see SZABIST jobs'
    },
    {
        userCompanies: ['szabist university hyderabad'],
        jobCompany: 'SZABIST Hyderabad Campus',
        expected: true,
        description: 'SZABIST University employee should NOT see SZABIST Hyderabad Campus jobs'
    },
    {
        userCompanies: ['szabist university hyderabad'],
        jobCompany: 'SZABIST ZABTech',
        expected: true,
        description: 'SZABIST University employee should NOT see SZABIST ZABTech jobs'
    },
    {
        userCompanies: ['google inc'],
        jobCompany: 'Google',
        expected: true,
        description: 'Google employee should NOT see Google jobs'
    },
    {
        userCompanies: ['microsoft corporation'],
        jobCompany: 'Microsoft',
        expected: true,
        description: 'Microsoft employee should NOT see Microsoft jobs'
    },
    {
        userCompanies: ['szabist university hyderabad'],
        jobCompany: 'University of Sindh',
        expected: false,
        description: 'SZABIST employee SHOULD see University of Sindh jobs'
    },
    {
        userCompanies: ['google inc'],
        jobCompany: 'Amazon',
        expected: false,
        description: 'Google employee SHOULD see Amazon jobs'
    }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = isUserCompany(test.jobCompany, test.userCompanies);
    const success = result === test.expected;
    
    if (success) {
        console.log(`✅ Test ${index + 1}: PASSED`);
        passed++;
    } else {
        console.log(`❌ Test ${index + 1}: FAILED`);
        console.log(`   Expected: ${test.expected}, Got: ${result}`);
        failed++;
    }
    console.log(`   ${test.description}`);
    console.log(`   User Companies: ${test.userCompanies.join(', ')}`);
    console.log(`   Job Company: ${test.jobCompany}\n`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. Please review the logic.');
    process.exit(1);
}
