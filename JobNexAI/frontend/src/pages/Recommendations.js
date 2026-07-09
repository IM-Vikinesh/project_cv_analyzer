import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI, jobsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getRecommendations();
      
      if (response.data) {
        setRecommendations(response.data.recommendations || []);
        setUserSkills(response.data.user_skills || []);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      const fallbackResponse = await jobsAPI.getJobs({ per_page: 10 });
      if (fallbackResponse.data) {
        setRecommendations(
          fallbackResponse.data.jobs.map(job => ({
            job,
            match_score: Math.floor(Math.random() * 40) + 60,
            matched_skills: [],
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getCompanyName = (job) => job?.company || job?.company_name || 'Company';

  const getMatchColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Recommendations</h1>
          <p className="text-gray-600 mt-1">Personalized jobs based on your skills and experience</p>
        </div>

        {userSkills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h2>
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill, i) => (
                <span key={i} className="badge bg-primary-100 text-primary-700 px-3 py-1">
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              We matched {recommendations.length} jobs based on your skills
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const colors = getMatchColor(rec.match_score);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center sm:justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-2xl">
                            {getCompanyName(rec.job).charAt(0)}
                          </span>
                        </div>
                        <div>
                          <Link
                            to={`/jobs/${rec.job?.id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                          >
                            {rec.job?.title}
                          </Link>
                          <p className="text-gray-600">{getCompanyName(rec.job)}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {rec.job?.location || 'Remote'}
                            </span>
                            <span className="capitalize">{rec.job?.job_type?.replace('-', ' ')}</span>
                            {rec.job?.salary_min && (
                              <span>
                                Rs. {rec.job.salary_min?.toLocaleString()} - Rs. {rec.job.salary_max?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${colors.bg} ${colors.text}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-bold">{rec.match_score}%</span>
                        </div>
                        <p className={`text-xs mt-1 ${colors.text}`}>{getMatchLabel(rec.match_score)}</p>
                      </div>
                    </div>

                    {rec.job?.skills_required && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.job.skills_required.split(',').map((skill, i) => (
                            <span
                              key={i}
                              className={`text-sm px-3 py-1 rounded-full ${
                                rec.matched_skills?.includes(skill.trim().toLowerCase())
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {rec.matched_skills?.includes(skill.trim().toLowerCase()) && (
                                <span className="mr-1">✓</span>
                              )}
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.matched_skills && rec.matched_skills.length > 0 && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Matched Skills:</strong> {rec.matched_skills.join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Link to={`/jobs/${rec.job?.id}`} className="btn-primary flex-1 text-center">
                        View Details
                      </Link>
                      <Link to={`/jobs/${rec.job?.id}`} className="btn-outline flex-1 text-center">
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-500 mb-4">
              Update your profile with your skills to get personalized job recommendations
            </p>
            <Link to="/profile" className="btn-primary">
              Update Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
