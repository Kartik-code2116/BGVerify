import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import { Users, Plus, Mail, Phone, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import toast from 'react-hot-toast';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidateForVerif, setSelectedCandidateForVerif] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form for new candidate
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    institution: '',
    degree: '',
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
    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        employment: formData.company
          ? [{ company: formData.company, designation: formData.designation || 'Specialist' }]
          : [],
        education: formData.institution
          ? [{ institution: formData.institution, degree: formData.degree || 'Bachelor' }]
          : [],
      };
      await candidateAPI.create(payload);
      toast.success('Candidate profile registered & portal account created!');
      setIsAddModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        designation: '',
        institution: '',
        degree: '',
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
            <h2>Candidate Directory</h2>
            <p>Manage candidate profiles, legal consent status, and submit verification jobs</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Candidate
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
              <p>Add candidate profiles to begin background verification</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Contact Info</th>
                    <th>Consent Status</th>
                    <th>Education / Experience</th>
                    <th>Date Added</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ fontSize: '15px' }}>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {c._id.substring(0, 8)}...</div>
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
                            Consent Granted
                          </span>
                        ) : (
                          <span className="status-badge pending_consent">
                            Consent Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          {c.employment?.length || 0} Employer(s) listed
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {c.education?.length || 0} Degree(s) listed
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedCandidateForVerif(c._id)}
                        >
                          <ShieldCheck size={14} color="#3b82f6" />
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Candidate</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCandidate}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Rahul"
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
                      placeholder="Sharma"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Candidate Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="candidate@example.com"
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

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Previous Employer</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Infosys / TCS"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Highest Qualification</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MBA / B.Tech"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    />
                  </div>
                </div>
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
                  {submitting ? 'Registering...' : 'Register Candidate'}
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
