import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getJob(id);
      if (response.data?.job) {
        setJob(response.data.job);
        setHasApplied(response.data.job.has_applied || false);
        setIsSaved(response.data.job.is_saved || false);
        
        if (user?.role === 'job_seeker') {
          fetchMatchScore();
        }
      }
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchScore = async () => {
    try {
      const response = await aiAPI.matchJob(id);
      if (response.data?.match_result) {
        setMatchScore(response.data.match_result.score);
      }
    } catch (error) {
      console.error('Error fetching match score:', error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    if (hasApplied) {
      toast.error('You have already applied to this job');
      return;
    }

    console.log('Applying with:', { applicant_id: user.id, job_id: job.id });

    setApplying(true);
    try {
      const response = await applicationsAPI.createApplication({
        applicant_id: user.id,
        job_id: job.id,
        cover_letter: coverLetter || undefined,
      });
      console.log('Application response:', response.data);
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (error) {
      console.error('Apply error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      await jobsAPI.saveJob(job.id);
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved!');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingCover(true);
    try {
      console.log('Generating cover letter with:', {
        job_title: job.title,
        company: job.company_name || job.company,
        applicant_name: user?.name,
        applicant_skills: user?.skills,
      });
      
      const response = await aiAPI.generateCoverLetter({
        job_title: job.title,
        company: job.company_name || job.company,
        job_description: job.description || '',
        requirements: job.requirements || '',
        skills_required: job.skills_required || '',
        applicant_name: user?.name || '',
        applicant_skills: user?.skills || '',
        applicant_experience: user?.experience || '',
        applicant_bio: user?.bio || '',
        applicant_location: user?.location || '',
      });
      
      console.log('Cover letter response:', response.data);
      
      if (response.data?.cover_letter) {
        setCoverLetter(response.data.cover_letter);
        toast.success('Cover letter generated!');
      } else {
        toast.error('No cover letter returned');
      }
    } catch (error) {
      console.error('Cover letter error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setGeneratingCover(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/jobs" className="text-primary-600 hover:text-primary-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-3xl">
                    {(job.company_name || job.company || 'C').charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600">{job.company_name || job.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location || 'Remote'}
                    </span>
                    <span className="capitalize">{job.job_type?.replace('-', ' ')}</span>
                    <span className="capitalize">{job.experience_level} Level</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveJob}
                className={`p-2 rounded-lg ${isSaved ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {matchScore !== null && user?.role === 'job_seeker' && (
              <div className={`mb-6 p-4 rounded-xl ${getMatchColor(matchScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Your Match Score</h3>
                    <p className="text-sm opacity-80">Based on your resume and skills</p>
                  </div>
                  <span className="text-3xl font-bold">{matchScore}%</span>
                </div>
              </div>
            )}

            {hasApplied && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                You have already applied to this position
              </div>
            )}

            <div className="flex gap-4 mb-8">
              {user?.role === 'job_seeker' && !hasApplied && (
                <button onClick={() => setShowApplyModal(true)} className="btn-primary flex-1">
                  Apply Now
                </button>
              )}
              <button onClick={handleSaveJob} className="btn-outline">
                {isSaved ? 'Saved' : 'Save Job'}
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose text-gray-600 whitespace-pre-line">
                  {typeof job.description === 'object' ? job.description.description || '' : job.description}
                </div>
              </section>

              {job.requirements && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose text-gray-600 whitespace-pre-line">
                    {typeof job.requirements === 'object' ? job.requirements.description || '' : job.requirements}
                  </div>
                </section>
              )}

              {job.benefits && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                  <div className="prose text-gray-600 whitespace-pre-line">
                    {typeof job.benefits === 'object' ? job.benefits.description || '' : job.benefits}
                  </div>
                </section>
              )}

              {job.skills_required && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.split(',').map((skill, i) => (
                      <span key={i} className="badge bg-primary-100 text-primary-700">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium capitalize">{job.job_type?.replace('-', ' ')}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium capitalize">{job.experience_level}</p>
                  </div>
                  {job.salary_min && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Salary Range</p>
                      <p className="font-medium">
                        ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {job.department && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{job.department}</p>
                    </div>
                  )}
                </div>
              </section>

              {job.recruiter && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-bold">
                          {job.recruiter.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{job.recruiter.name}</p>
                        <p className="text-sm text-gray-500">{job.recruiter.email}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Apply for {job.title}</h2>
              <p className="text-gray-600">{job.company_name || job.company}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  className="input-field"
                  placeholder="Write a cover letter or leave blank to generate one with AI..."
                />
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCover}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-500 flex items-center gap-2"
                >
                  {generatingCover ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Your profile information will be shared with the employer.
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex gap-4">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 btn-primary"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
