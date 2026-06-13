import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';

const CVAnalysisResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const [saveDismissed, setSaveDismissed] = useState(false);
  const [recs, setRecs] = useState(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [skillGaps, setSkillGaps] = useState([]);

  useEffect(() => {
    const analysisId = searchParams.get('id');
    if (analysisId) {
      loadAnalysis(analysisId);
    } else {
      navigate('/cv-upload');
    }
  }, [searchParams]);

  const loadAnalysis = async (id) => {
    try {
      const response = await aiAPI.getAnalysis(id);
      if (response.data?.success) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const resultData = analysis?.result_data || analysis;
    const skills = resultData?.skills;
    if (skills && skills.length > 0) {
      setRecsLoading(true);
      aiAPI.recommendFromSkills({ skills })
        .then((res) => {
          if (res.data?.success) {
            setRecs(res.data.recommendations || []);
            setSkillGaps(res.data.skill_gaps || []);
          }
        })
        .catch(() => {})
        .finally(() => setRecsLoading(false));
    }
  }, [analysis]);

  const handleSaveToProfile = async () => {
    const analysisId = searchParams.get('id');
    if (!analysisId || !user?.id) return;
    setSaving(true);
    try {
      await aiAPI.saveAnalysisToProfile({
        user_id: user.id,
        analysis_id: analysisId,
      });
      setSaveDone(true);
      await refreshUser();
    } catch (err) {
      console.error('Save to profile failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Found</h2>
          <p className="text-gray-500 mb-8">We couldn't locate the analysis you're looking for. It might have been deleted or doesn't exist.</p>
          <button onClick={() => navigate('/cv-upload')} className="w-full btn-primary py-3 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02]">
            Upload New Resume
          </button>
        </div>
      </div>
    );
  }

  const resultData = analysis.result_data || analysis;
  const experienceData = resultData.experience || [];
  const educationData = resultData.education || {};
  const educationEntries = educationData.entries || [];
  const degrees = educationData.degrees || [];
  const organizations = resultData.organizations || [];
  const achievements = resultData.achievements || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-blue-500"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/cv-upload')}
              className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              Back to Upload
            </button>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button onClick={() => navigate('/cv-upload')} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm shadow-sm flex-1 sm:flex-none text-center">
                Analyze Another
              </button>
              <button onClick={() => navigate('/recommendations')} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors shadow-lg shadow-gray-900/20 text-sm flex-1 sm:flex-none text-center">
                View Recommendations
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 text-white transform -rotate-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Resume Analysis</h1>
              <p className="text-gray-500 mt-1 text-lg">We've broken down your resume into actionable insights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {!saveDone && !saveDismissed && user?.id && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-8 shadow-lg shadow-primary-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Save to Profile</h3>
                  <p className="text-white/80 text-sm">Add extracted skills, experience, and education to your profile</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveToProfile}
                  disabled={saving}
                  className="px-6 py-2.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg disabled:opacity-50 text-sm flex-1 sm:flex-none text-center"
                >
                  {saving ? 'Saving...' : 'Add to Profile'}
                </button>
                <button
                  onClick={() => setSaveDismissed(true)}
                  disabled={saving}
                  className="px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 text-sm flex-1 sm:flex-none text-center"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        )}

        {saveDone && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 mb-8 shadow-lg shadow-green-500/20 text-white relative overflow-hidden">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Resume data saved to your profile successfully!</p>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Words Processed', value: resultData.word_count || 0, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
            { label: 'Skills Detected', value: resultData.skills?.length || 0, color: 'from-primary-500 to-primary-600', shadow: 'shadow-primary-500/20' },
            { label: 'Sentences', value: resultData.sentence_count || 0, color: 'from-secondary-500 to-secondary-600', shadow: 'shadow-secondary-500/20' },
            { label: 'Roles Found', value: resultData.experience?.length || 0, color: 'from-green-500 to-green-600', shadow: 'shadow-green-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg ${stat.shadow} relative overflow-hidden transform transition-all hover:-translate-y-1`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <p className="text-sm font-medium text-white/80 mb-2 relative z-10">{stat.label}</p>
              <p className="text-4xl font-extrabold relative z-10">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        {resultData.summary && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI Summary
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">{resultData.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Meta Data */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Contact Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
              </div>
              
              <div className="space-y-4">
                {resultData.contact?.emails?.length > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                    <span className="text-gray-900 font-medium break-all bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">{resultData.contact.emails[0]}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic px-3 border-l-2 border-gray-200">No email detected</div>
                )}
                
                {resultData.contact?.phones?.length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</span>
                    <span className="text-gray-900 font-medium bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">{resultData.contact.phones[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Skills Core</h2>
              </div>
              
              {resultData.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resultData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:border-primary-300 hover:text-primary-700 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic px-3 border-l-2 border-gray-200">No skills identified</div>
              )}
            </div>

            {/* Organizations */}
            {organizations.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Entities</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {organizations.slice(0, 8).map((org, index) => (
                    <span key={index} className="px-3 py-1.5 bg-orange-50 text-orange-800 rounded-lg text-sm font-medium">
                      {org}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Experience Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                </div>
                <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{experienceData.length} Roles</span>
              </div>
              
              {experienceData.length > 0 ? (
                <div className="space-y-8">
                  {experienceData.map((exp, index) => (
                    <div key={index} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-2rem] before:w-0.5 before:bg-gray-100 last:before:hidden group">
                      <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-4 border-purple-100 rounded-full group-hover:border-purple-300 transition-colors z-10"></div>
                      
                      {typeof exp === 'object' ? (
                        <div className="bg-gray-50/50 hover:bg-gray-50 p-5 rounded-2xl border border-transparent hover:border-gray-100 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{exp.role || 'Professional Role'}</h3>
                              {exp.company && <p className="text-purple-600 font-medium">{exp.company}</p>}
                            </div>
                            {exp.duration && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 whitespace-nowrap">
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mt-3">{typeof exp.description === 'object' ? exp.description.description || '' : exp.description}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-5 rounded-2xl">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No detailed experience found</p>
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Education Background</h2>
              </div>
              
              {(educationEntries.length > 0 || degrees.length > 0) ? (
                <div className="space-y-6">
                  {degrees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                      <span className="text-sm font-semibold text-green-800 self-center mr-2">Degrees Recognized:</span>
                      {degrees.map((degree, index) => (
                        <span key={index} className="px-3 py-1 bg-white text-green-700 rounded-lg text-sm font-bold shadow-sm border border-green-100">
                          {degree}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {educationEntries.map((edu, index) => (
                      <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        {edu.institution ? <p className="font-bold text-gray-900 text-lg mb-1">{edu.institution}</p> : <p className="font-bold text-gray-400 italic mb-1">Institution Unknown</p>}
                        {edu.degree && <p className="text-green-600 font-medium mb-2">{edu.degree} {edu.field && <span className="text-gray-600 font-normal">in {edu.field}</span>}</p>}
                        {edu.year && (
                          <div className="inline-flex items-center text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 mt-2">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {edu.year}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No education details detected</p>
                </div>
              )}
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Notable Achievements</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50/30 rounded-2xl border border-yellow-100 hover:bg-yellow-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">{typeof achievement === 'object' ? achievement.description || '' : achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
        {/* Job Recommendations Section */}
        {(recsLoading || recs) && (
          <div className="mt-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Job Recommendations</h2>
                </div>
                {recs && recs.length > 0 && (
                  <Link to="/recommendations" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                )}
              </div>

              {recsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : recs && recs.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {recs.slice(0, 3).map((rec, i) => {
                      const scoreColor = rec.match_score >= 80 ? 'text-green-600 bg-green-50' : rec.match_score >= 60 ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600 bg-gray-50';
                      return (
                        <Link key={i} to={`/jobs/${rec.job?.id}`} className="block group">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-primary-600 text-lg">{(rec.job?.company || rec.job?.company_name || 'C').charAt(0)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{rec.job?.title}</p>
                                <p className="text-sm text-gray-500 truncate">{rec.job?.company || rec.job?.company_name} {rec.job?.location && `· ${rec.job.location}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              {rec.missing_skills && rec.missing_skills.length > 0 && (
                                <span className="text-xs text-orange-500 hidden sm:block">{rec.missing_skills.length} skill{rec.missing_skills.length > 1 ? 's' : ''} to grow</span>
                              )}
                              <div className={`px-3 py-1.5 rounded-xl font-bold text-sm ${scoreColor}`}>{rec.match_score}%</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {skillGaps.length > 0 && (
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="font-bold text-gray-900">Skills to Develop</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">These skills appear in job listings matching your CV. Consider adding them to your skillset:</p>
                      <div className="flex flex-wrap gap-2">
                        {skillGaps.slice(0, 8).map((gap, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-200 rounded-lg text-sm font-medium text-orange-700 shadow-sm">
                            {gap.skill}
                            <span className="text-xs text-orange-400 bg-orange-50 rounded-full px-1.5 py-0.5">{gap.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <Link to="/recommendations" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-medium text-sm shadow-lg shadow-gray-900/20">
                      View All {recs.length} Job Matches
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No matching jobs available right now</p>
                  <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CVAnalysisResults;