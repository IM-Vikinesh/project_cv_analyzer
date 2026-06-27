import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CVBuilder = () => {
  const { user, refreshUser } = useAuth();
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [savingToCloud, setSavingToCloud] = useState(false);
  const [cvData, setCvData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    summary: '',
    experience: [{ title: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    skills: user?.skills || '',
    languages: '',
    certifications: '',
  });

  const handleChange = (field, value) => {
    setCvData(prev => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...cvData.experience];
    newExperience[index][field] = value;
    setCvData(prev => ({ ...prev, experience: newExperience }));
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...cvData.education];
    newEducation[index][field] = value;
    setCvData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const generatePDFBlob = async () => {
    const element = previewRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    return pdf.output('blob');
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const blob = await generatePDFBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CV downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToCloud = async () => {
    setSavingToCloud(true);
    try {
      const blob = await generatePDFBlob();
      const file = new File([blob], `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`, { type: 'application/pdf' });
      
      const token = localStorage.getItem('firebaseToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        toast.success('CV saved to cloud successfully!');
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save CV to cloud');
    } finally {
      setSavingToCloud(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CV Builder</h1>
          <p className="text-gray-600 mt-1">Create a professional resume in minutes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Fill Your Information</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={saveToCloud}
                  disabled={savingToCloud}
                  className="btn-outline flex items-center gap-2"
                >
                  {savingToCloud ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  Save to Cloud
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  Download PDF
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={cvData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={cvData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={cvData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="input-field"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={cvData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="input-field"
                      placeholder="Colombo, Sri Lanka"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  value={cvData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Write a brief summary of your professional background..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Experience</h3>
                  <button onClick={addExperience} className="text-sm text-primary-600 hover:text-primary-500">
                    + Add Experience
                  </button>
                </div>
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        className="input-field"
                        placeholder="Job Title"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="input-field"
                        placeholder="Company"
                      />
                    </div>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                      className="input-field mb-3"
                      placeholder="Duration (e.g., Jan 2020 - Present)"
                    />
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows={2}
                      className="input-field"
                      placeholder="Job responsibilities and achievements..."
                    />
                    {cvData.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Education</h3>
                  <button onClick={addEducation} className="text-sm text-primary-600 hover:text-primary-500">
                    + Add Education
                  </button>
                </div>
                {cvData.education.map((edu, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="input-field"
                        placeholder="Degree"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        className="input-field"
                        placeholder="Institution"
                      />
                    </div>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      className="input-field"
                      placeholder="Year"
                    />
                    {cvData.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <textarea
                  value={cvData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Python, JavaScript, React, Node.js, SQL, Git..."
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <input
                  type="text"
                  value={cvData.languages}
                  onChange={(e) => handleChange('languages', e.target.value)}
                  className="input-field"
                  placeholder="Type here"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                <textarea
                  value={cvData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  rows={2}
                  className="input-field"
                  placeholder="AWS Solutions Architect, PMP, Google Analytics..."
                />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
              
              <div
                ref={previewRef}
                className="bg-white border border-gray-200 rounded-lg shadow-lg"
                style={{ fontFamily: 'Arial, sans-serif', minHeight: '900px', maxWidth: '600px', margin: '0 auto' }}
              >
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 text-white">
                  <h1 className="text-3xl font-bold mb-2">{cvData.name || 'Your Name'}</h1>
                  <div className="flex flex-wrap gap-4 text-sm opacity-90">
                    {cvData.email && <span>✉ {cvData.email}</span>}
                    {cvData.phone && <span>📞 {cvData.phone}</span>}
                    {cvData.location && <span>📍 {cvData.location}</span>}
                  </div>
                </div>

                <div className="p-6">
                  {cvData.summary && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-slate-800 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">Professional Summary</h2>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{cvData.summary}</p>
                    </div>
                  )}

                  {cvData.experience.some(e => e.title || e.company) && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-slate-800 mb-3 uppercase tracking-wide border-b border-slate-300 pb-1">Work Experience</h2>
                      {cvData.experience.filter(e => e.title || e.company).map((exp, i) => (
                        <div key={i} className="mb-4 mt-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900">{exp.title || 'Position'}</h3>
                              <p className="text-sm text-primary-600 font-medium">{exp.company}</p>
                            </div>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {cvData.education.some(e => e.degree || e.institution) && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-slate-800 mb-3 uppercase tracking-wide border-b border-slate-300 pb-1">Education</h2>
                      {cvData.education.filter(e => e.degree || e.institution).map((edu, i) => (
                        <div key={i} className="mb-3 mt-2">
                          <div className="flex justify-between">
                            <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                            <span className="text-sm text-gray-500">{edu.year}</span>
                          </div>
                          <p className="text-sm text-primary-600">{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {cvData.skills && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-slate-800 mb-3 uppercase tracking-wide border-b border-slate-300 pb-1">Skills</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cvData.skills.split(',').map((skill, i) => (
                          <span key={i} className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvData.languages && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-slate-800 mb-3 uppercase tracking-wide border-b border-slate-300 pb-1">Languages</h2>
                      <p className="text-sm text-gray-600 mt-2">{cvData.languages}</p>
                    </div>
                  )}

                  {cvData.certifications && (
                    <div>
                      <h2 className="text-base font-bold text-slate-800 mb-3 uppercase tracking-wide border-b border-slate-300 pb-1">Certifications</h2>
                      <p className="text-sm text-gray-600 mt-2">{cvData.certifications}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
