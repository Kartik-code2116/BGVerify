import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../modules/users/user.model';
import { Organization } from '../modules/organizations/organization.model';
import { Wallet, WalletTransaction } from '../modules/wallet/wallet.model';
import { Candidate } from '../modules/candidates/candidate.model';
import { Verification } from '../modules/verifications/verification.model';
import { JobRole } from '../modules/roles/role.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bgverify';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing database and stale indexes
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Dropped database & cleared stale collections and indexes');

    // ─── Create Admin User ──────────────────────────────
    const admin = new User({
      email: 'admin@bgverify.ai',
      password: 'AdminPass123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });
    await admin.save();
    console.log('👤 Admin created: admin@bgverify.ai / AdminPass123!');

    // ─── Create Organization: Acme Corp ─────────────────
    const hrUser = new User({
      email: 'hr@acme-corp.com',
      password: 'HrPass123!',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'org_owner',
      isActive: true,
      isEmailVerified: true,
    });
    await hrUser.save();

    const acmeCorp = new Organization({
      name: 'Acme Corp',
      email: 'hr@acme-corp.com',
      phone: '+91-9876543210',
      website: 'https://acme-corp.com',
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001',
      },
      industry: 'Technology',
      size: '201-500',
      isKycVerified: true,
      isActive: true,
      ownerId: hrUser._id,
    });
    await acmeCorp.save();

    hrUser.organizationId = acmeCorp._id;
    await hrUser.save();

    // Create wallet for Acme Corp
    const acmeWallet = new Wallet({
      organizationId: acmeCorp._id,
      balance: 85,
      totalPurchased: 100,
      totalSpent: 15,
    });
    await acmeWallet.save();

    // Wallet transactions
    await WalletTransaction.create([
      {
        walletId: acmeWallet._id,
        organizationId: acmeCorp._id,
        type: 'purchase',
        amount: 100,
        balanceAfter: 100,
        description: 'Initial purchase of 100 BGCoins',
        referenceType: 'purchase',
        performedBy: hrUser._id,
      },
    ]);

    console.log('🏢 Acme Corp created: hr@acme-corp.com / HrPass123!');

    // ─── Create Second Organization: TechStart Inc ──────
    const hr2User = new User({
      email: 'hiring@techstart.io',
      password: 'HrPass123!',
      firstName: 'Amit',
      lastName: 'Patel',
      role: 'org_owner',
      isActive: true,
      isEmailVerified: true,
    });
    await hr2User.save();

    const techStart = new Organization({
      name: 'TechStart Inc',
      email: 'hiring@techstart.io',
      address: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
      },
      industry: 'Software',
      size: '51-200',
      isKycVerified: true,
      isActive: true,
      ownerId: hr2User._id,
    });
    await techStart.save();

    hr2User.organizationId = techStart._id;
    await hr2User.save();

    const techWallet = new Wallet({
      organizationId: techStart._id,
      balance: 45,
      totalPurchased: 50,
      totalSpent: 5,
    });
    await techWallet.save();
    console.log('🏢 TechStart Inc created: hiring@techstart.io / HrPass123!');

    // ─── Create Sector Hiring Roles for Acme Corp ───────
    const role1 = new JobRole({
      title: 'Senior Full-Stack AI Engineer',
      sector: 'Technology & IT',
      department: 'Core Platform Engineering',
      urgency: 'urgent',
      openPositions: 4,
      filledPositions: 1,
      experienceLevel: 'senior',
      locationType: 'hybrid',
      location: 'Pune / Remote',
      requiredChecks: ['education', 'employment', 'identity'],
      targetJoiningDate: new Date(Date.now() + 86400000 * 7),
      status: 'active',
      description: 'Urgent hiring for AI Background Verification platform engineer. Requires TypeScript, React, Node.js and Playwright.',
      organizationId: acmeCorp._id,
      createdBy: hrUser._id,
    });
    await role1.save();

    const role2 = new JobRole({
      title: 'Financial Risk & Compliance Analyst',
      sector: 'Financial Services & BFSI',
      department: 'Risk, Audit & AML',
      urgency: 'high',
      openPositions: 2,
      filledPositions: 1,
      experienceLevel: 'mid',
      locationType: 'onsite',
      location: 'Mumbai BKC',
      requiredChecks: ['education', 'employment', 'identity', 'criminal_record', 'credit_history'],
      targetJoiningDate: new Date(Date.now() + 86400000 * 14),
      status: 'active',
      description: 'Mandatory CIBIL, credit history, criminal record and degree verification required for BFSI regulatory compliance.',
      organizationId: acmeCorp._id,
      createdBy: hrUser._id,
    });
    await role2.save();

    const role3 = new JobRole({
      title: 'Warehouse & Logistics Lead',
      sector: 'Logistics & Supply Chain',
      department: 'Supply Chain Operations',
      urgency: 'urgent',
      openPositions: 6,
      filledPositions: 2,
      experienceLevel: 'mid',
      locationType: 'onsite',
      location: 'Navi Mumbai Warehouse',
      requiredChecks: ['identity', 'criminal_record', 'driving_license'],
      targetJoiningDate: new Date(Date.now() + 86400000 * 3),
      status: 'active',
      description: 'Urgent 24h background check required for emergency inventory shift supervisor.',
      organizationId: acmeCorp._id,
      createdBy: hrUser._id,
    });
    await role3.save();

    const role4 = new JobRole({
      title: 'Clinical Research Specialist',
      sector: 'Healthcare & Pharmaceuticals',
      department: 'Medical Trials & Lab QA',
      urgency: 'medium',
      openPositions: 3,
      filledPositions: 0,
      experienceLevel: 'lead',
      locationType: 'hybrid',
      location: 'Bangalore BioPark',
      requiredChecks: ['education', 'identity', 'employment'],
      targetJoiningDate: new Date(Date.now() + 86400000 * 30),
      status: 'active',
      description: 'Medical council verification and university credentials check required.',
      organizationId: acmeCorp._id,
      createdBy: hrUser._id,
    });
    await role4.save();

    console.log('💼 4 Sector Hiring Roles created for Acme Corp (Tech, Finance, Logistics, Healthcare)');

    // ─── Create Candidates for Acme Corp ────────────────
    const candidateUser1 = new User({
      email: 'rahul.sharma@example.com',
      password: 'CandidatePass123!',
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: 'candidate',
      isActive: true,
    });
    await candidateUser1.save();

    const candidate1 = new Candidate({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91-9123456789',
      dateOfBirth: new Date('1995-03-15'),
      organizationId: acmeCorp._id,
      submittedBy: hrUser._id,
      userId: candidateUser1._id,
      targetRole: 'Senior Full-Stack AI Engineer',
      sector: 'Technology & IT',
      urgency: 'urgent',
      jobRoleId: role1._id,
      hiringStage: 'cleared',
      clearanceScore: 98,
      consentGiven: true,
      consentDate: new Date(),
      status: 'active',
      education: [
        {
          institution: 'Pune University',
          degree: 'MBA',
          fieldOfStudy: 'Finance',
          startYear: 2017,
          endYear: 2019,
        },
      ],
      employment: [
        {
          company: 'Infosys',
          designation: 'Software Engineer',
          department: 'Technology',
          startDate: new Date('2019-07-01'),
          endDate: new Date('2022-12-31'),
          employeeId: 'INF-45678',
        },
        {
          company: 'ABC Technologies',
          designation: 'Senior Developer',
          department: 'Engineering',
          startDate: new Date('2023-01-15'),
        },
      ],
      liveSelfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      documents: [
        {
          documentType: 'Aadhaar Card',
          fileName: 'rahul_aadhaar_card.pdf',
          fileSize: '1.4 MB',
          storageKey: 'restricted/acme_corp/candidates/rahul_sharma/aadhaar.pdf',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          uploadedAt: new Date(Date.now() - 86400000 * 3),
          status: 'verified',
        },
        {
          documentType: 'Degree Certificate (MBA)',
          fileName: 'pune_university_mba_degree.pdf',
          fileSize: '2.1 MB',
          storageKey: 'restricted/acme_corp/candidates/rahul_sharma/mba_cert.pdf',
          sha256: '9f83c605ae7e08f1391eed857f406b760864f23f3719f86177304b50f14a3dc7',
          uploadedAt: new Date(Date.now() - 86400000 * 2),
          status: 'verified',
        },
        {
          documentType: 'Relieving & Experience Letter',
          fileName: 'infosys_relieving_letter.pdf',
          fileSize: '950 KB',
          storageKey: 'restricted/acme_corp/candidates/rahul_sharma/infosys_exp.pdf',
          sha256: 'ca978112ca1bbdccafac231b39a23dc4da78608141966970f06410613183fb9d',
          uploadedAt: new Date(Date.now() - 86400000 * 1),
          status: 'verified',
        },
      ],
    });
    await candidate1.save();

    const candidateUser2 = new User({
      email: 'sneha.verma@example.com',
      password: 'CandidatePass123!',
      firstName: 'Sneha',
      lastName: 'Verma',
      role: 'candidate',
      isActive: true,
    });
    await candidateUser2.save();

    const candidate2 = new Candidate({
      firstName: 'Sneha',
      lastName: 'Verma',
      email: 'sneha.verma@example.com',
      phone: '+91-9988776655',
      organizationId: acmeCorp._id,
      submittedBy: hrUser._id,
      userId: candidateUser2._id,
      targetRole: 'Financial Risk & Compliance Analyst',
      sector: 'Financial Services & BFSI',
      urgency: 'high',
      jobRoleId: role2._id,
      hiringStage: 'verifying',
      clearanceScore: 75,
      consentGiven: true,
      consentDate: new Date(),
      status: 'active',
      education: [
        {
          institution: 'IIT Bombay',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          startYear: 2015,
          endYear: 2019,
        },
      ],
      employment: [
        {
          company: 'Wipro',
          designation: 'Analyst',
          startDate: new Date('2019-08-01'),
          endDate: new Date('2023-06-30'),
        },
      ],
    });
    await candidate2.save();

    const candidateUser3 = new User({
      email: 'arjun.nair@example.com',
      password: 'CandidatePass123!',
      firstName: 'Arjun',
      lastName: 'Nair',
      role: 'candidate',
      isActive: true,
    });
    await candidateUser3.save();

    const candidate3 = new Candidate({
      firstName: 'Arjun',
      lastName: 'Nair',
      email: 'arjun.nair@example.com',
      organizationId: acmeCorp._id,
      submittedBy: hrUser._id,
      userId: candidateUser3._id,
      targetRole: 'Warehouse & Logistics Lead',
      sector: 'Logistics & Supply Chain',
      urgency: 'urgent',
      jobRoleId: role3._id,
      hiringStage: 'applied',
      clearanceScore: 40,
      status: 'pending_consent',
    });
    await candidate3.save();

    console.log('👥 3 candidates created for Acme Corp');

    // ─── Create Verifications ───────────────────────────
    const verifications = [
      {
        candidateId: candidate1._id,
        organizationId: acmeCorp._id,
        requestedBy: hrUser._id,
        verificationType: 'employment',
        status: 'completed',
        result: 'match',
        priority: 'high',
        completedAt: new Date(),
        aiAnalysis: {
          confidence: 0.95,
          summary: 'Employment records match the submitted data.',
          fieldComparisons: [
            { field: 'company', submitted: 'Infosys', found: 'Infosys Ltd', isMatch: true },
            { field: 'designation', submitted: 'Software Engineer', found: 'Software Engineer', isMatch: true },
            { field: 'duration', submitted: '2019-2022', found: '2019-2022', isMatch: true },
          ],
          flags: [],
          recommendedAction: 'Approved - all fields match',
        },
      },
      {
        candidateId: candidate1._id,
        organizationId: acmeCorp._id,
        requestedBy: hrUser._id,
        verificationType: 'education',
        status: 'completed',
        result: 'match',
        priority: 'medium',
        completedAt: new Date(),
        aiAnalysis: {
          confidence: 0.92,
          summary: 'Education records verified successfully.',
          fieldComparisons: [
            { field: 'institution', submitted: 'Pune University', found: 'Savitribai Phule Pune University', isMatch: true },
            { field: 'degree', submitted: 'MBA', found: 'MBA', isMatch: true },
          ],
          flags: [],
          recommendedAction: 'Approved',
        },
      },
      {
        candidateId: candidate2._id,
        organizationId: acmeCorp._id,
        requestedBy: hrUser._id,
        verificationType: 'employment',
        status: 'manual_review',
        result: 'partial_match',
        priority: 'high',
        aiAnalysis: {
          confidence: 0.68,
          summary: 'Employment dates do not match. Candidate claims tenure until June 2023, but records show March 2023.',
          fieldComparisons: [
            { field: 'company', submitted: 'Wipro', found: 'Wipro Ltd', isMatch: true },
            { field: 'endDate', submitted: 'June 2023', found: 'March 2023', isMatch: false },
          ],
          flags: ['date_discrepancy'],
          recommendedAction: 'Requires manual review — date discrepancy detected',
        },
      },
      {
        candidateId: candidate2._id,
        organizationId: acmeCorp._id,
        requestedBy: hrUser._id,
        verificationType: 'education',
        status: 'in_progress',
        result: 'pending',
        priority: 'medium',
      },
      {
        candidateId: candidate2._id,
        organizationId: acmeCorp._id,
        requestedBy: hrUser._id,
        verificationType: 'identity',
        status: 'pending',
        result: 'pending',
        priority: 'low',
      },
      {
        candidateId: candidate1._id,
        organizationId: acmeCorp._id,
        requestedBy: hrUser._id,
        verificationType: 'criminal',
        status: 'completed',
        result: 'match',
        priority: 'high',
        completedAt: new Date(),
        aiAnalysis: {
          confidence: 0.99,
          summary: 'No criminal records found.',
          fieldComparisons: [],
          flags: [],
          recommendedAction: 'Clear — no records found',
        },
      },
    ];

    await Verification.insertMany(verifications);

    // Update wallet transaction records for verifications
    for (let i = 0; i < verifications.length; i++) {
      await WalletTransaction.create({
        walletId: acmeWallet._id,
        organizationId: acmeCorp._id,
        type: 'debit',
        amount: 1,
        balanceAfter: 100 - (i + 1),
        description: `${verifications[i].verificationType} verification`,
        referenceType: 'verification',
        performedBy: hrUser._id,
      });
    }

    console.log('✅ 6 verifications created');

    console.log('\n═══════════════════════════════════════════');
    console.log('  🎉 Seed completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('\n  Test Accounts:');
    console.log('  ┌──────────────┬─────────────────────────┬────────────────┐');
    console.log('  │ Role         │ Email                   │ Password       │');
    console.log('  ├──────────────┼─────────────────────────┼────────────────┤');
    console.log('  │ Admin        │ admin@bgverify.ai       │ AdminPass123!  │');
    console.log('  │ HR Manager   │ hr@acme-corp.com        │ HrPass123!     │');
    console.log('  │ HR Manager   │ hiring@techstart.io     │ HrPass123!     │');
    console.log('  │ Candidate    │ rahul.sharma@example.com│ CandidatePass123!│');
    console.log('  │ Candidate    │ sneha.verma@example.com │ CandidatePass123!│');
    console.log('  └──────────────┴─────────────────────────┴────────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
