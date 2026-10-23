import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import {
  Users,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  UserCheck,
  Calendar,
  Hash,
  Award,
} from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import toast from 'react-hot-toast';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('personal'); // 'personal' | 'academic' | 'employment'
  const [selectedCandidateForVerif, setSelectedCandidateForVerif] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form for new candidate/student
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    aadhaarNumber: '',
    panNumber: '',

    // Student & Academic Info (for Education Verification)
    institution: '',
    degree: '',
    fieldOfStudy: '',
    rollNumber: '',
    endYear: new Date().getFullYear(),
    grade: '',

    // Employment / Internship Info (for Employment Verification)
    company: '',
    designation: '',
    employeeId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.list();
      setCandidates(res.data.data.candidates || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('First Name, Last Name, and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        aadhaarNumber: formData.aadhaarNumber || undefined,
        panNumber: formData.panNumber || undefined,
        education: formData.institution
          ? [
              {
                institution: formData.institution,
                degree: formData.degree || 'Degree',
                fieldOfStudy: formData.fieldOfStudy || 'General',
                rollNumber: formData.rollNumber || undefined,
                endYear: Number(formData.endYear) || undefined,
                grade: formData.grade || undefined,
              },
            ]
          : [],
        employment: formData.company
          ? [
              {
                company: formData.company,
                designation: formData.designation || 'Specialist',
                employeeId: formData.employeeId || undefined,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
              },
            ]
          : [],
      };

      await candidateAPI.create(payload);
      toast.success('Candidate profile registered & portal credentials generated!');
      setIsAddModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        aadhaarNumber: '',
        panNumber: '',
        institution: '',
        degree: '',
        fieldOfStudy: '',
        rollNumber: '',
        endYear: new Date().getFullYear(),
        grade: '',
        company: '',
        designation: '',
        employeeId: '',
        startDate: '',
        endDate: '',
      });
      loadCandidates();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || 'Failed to create candidate';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Candidate & Student Directory</h2>
            <p>Register candidates, record academic & work credentials, and dispatch Playwright verification checks</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Candidate / Student
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={32} />
              </div>
              <h3>No candidates added yet</h3>
              <p>Add candidate or student profiles to initiate autonomous background verification</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate / Student</th>
                    <th>Contact & Identity</th>
                    <th>Consent Status</th>
                    <th>Academic Credentials</th>
                    <th>Work Experience</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => {
                    const topEdu = c.education?.[0];
                    const topEmp = c.employment?.[0];

                    return (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ fontSize: '15px' }}>{c.firstName} {c.lastName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            ID: {c._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color="var(--text-muted)" /> {c.email}
                          </div>
                          {c.phone && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> {c.phone}
                            </div>
                          )}
                        </td>
                        <td>
                          {c.consentGiven ? (
                            <span className="status-badge completed">
                              Consent Signed
                            </span>
                          ) : (
                            <span className="status-badge pending_consent">
                              Consent Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {topEdu ? (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{topEdu.degree}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {topEdu.institution}
                                {topEdu.endYear ? ` (${topEdu.endYear})` : ''}
                              </div>
                              {topEdu.rollNumber && (
                                <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
                                  Roll: {topEdu.rollNumber}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not specified</span>
                          )}
                        </td>
                        <td>
                          {topEmp ? (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{topEmp.designation}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{topEmp.company}</div>
                              {topEmp.employeeId && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Emp ID: {topEmp.employeeId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Fresh Graduate</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedCandidateForVerif(c._id)}
                          >
                            <ShieldCheck size={14} />
                            Verify
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Register Candidate / Student</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Provide candidate information to be verified by Playwright automated agents
                </p>
              </div>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>

            {/* Navigation tabs inside modal */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', background: 'var(--bg-elevated)' }}>
              {[
                { id: 'personal', label: '1. Personal & Contact', icon: UserCheck },
                { id: 'academic', label: '2. Student / Academic', icon: GraduationCap },
                { id: 'employment', label: '3. Employment History', icon: Briefcase },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                      color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddCandidate}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {activeFormTab === 'personal' && (
                  <div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Rahul"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Sharma"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="rahul.sharma@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="+91-9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Aadhaar / National ID (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="XXXX-XXXX-1234"
                          value={formData.aadhaarNumber}
                          onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'academic' && (
                  <div>
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: '10px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#93c5fd',
                    }}>
                      💡 Playwright Education Bots use the <strong>University</strong> and <strong>Roll / Registration Number</strong> to query institutional databases and Registrar registers.
                    </div>

                    <div className="form-group">
                      <label className="form-label">University / Examining Board *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Pune University / Savitribai Phule Pune University"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      />
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Degree / Program Awarded</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. B.Tech Computer Science / MBA"
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Student Roll No / PRN / Reg No *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 71928341 / PRN-2024-819"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Passing / Graduation Year</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="2024"
                          value={formData.endYear}
                          onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Grade / CGPA / Division</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 8.5 CGPA / First Class with Distinction"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'employment' && (
                  <div>
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: '10px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#93c5fd',
                    }}>
                      💡 Playwright Employment Bots query employer verification portals and EPFO records using <strong>Company Name</strong> and <strong>Employee ID</strong>.
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Company / Organization Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Infosys Ltd / TCS"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Designation / Role Title</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Associate Software Engineer"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Employee ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. INF-45678"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tenure Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. July 2022 - Dec 2024"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Save & Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCandidateForVerif && (
        <NewVerificationModal
          isOpen={!!selectedCandidateForVerif}
          onClose={() => setSelectedCandidateForVerif(null)}
          initialCandidateId={selectedCandidateForVerif}
          onSuccess={loadCandidates}
        />
      )}
    </div>
  );
}
