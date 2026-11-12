import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI, aiAPI } from '../services/api';
import useAsyncData from '../hooks/useAsyncData';
import { JobDetailsSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateMessage';
import { formatJobSalary, getCompanyName } from '../utils/jobFormat';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: job, status, error, retry } = useAsyncData(async (signal) => {
    const response = await jobsAPI.getJob(id, { signal });
    return response.data?.job || null;
  }, [id]);

  const [appliedOverride, setAppliedOverride] = useState(null);
  const [appliedFromServer, setAppliedFromServer] = useState(null);
  const [savedOverride, setSavedOverride] = useState(null);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);
  const modalRef = useRef(null);

  const loginUrl = `/login?returnTo=${encodeURIComponent(`/jobs/${id}`)}`;
  const userId = user?.id;
  const userRole = user?.role;
  const hasApplied = appliedOverride ?? appliedFromServer ?? job?.has_applied ?? false;
  const isSaved = savedOverride ?? job?.is_saved ?? false;
  const isJobSeeker = userRole === 'job_seeker';

  useEffect(() => {
    setAppliedOverride(null);
    setAppliedFromServer(null);
    setSavedOverride(null);
    setShowApplyModal(false);
    setCoverLetter('');
  }, [id]);

  useEffect(() => {
    if (!userId || userRole !== 'job_seeker' || !job?.id) {
      setAppliedFromServer(null);
      return undefined;
    }

    let active = true;
    applicationsAPI.getUserApplications(userId)
      .then((response) => {
        if (!active) return;
        const applications = response.data?.applications || [];
        setAppliedFromServer(applications.some((application) => application.job_id === job.id));
      })
      .catch(() => {
        if (active) setAppliedFromServer(null);
      });

    return () => {
      active = false;
    };
  }, [userId, userRole, job?.id]);

  useEffect(() => {
    if (!showApplyModal) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowApplyModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [showApplyModal]);

  const openApplyModal = () => {
    if (!user) {
      navigate(loginUrl);
      return;
    }
    if (!isJobSeeker) {
      toast.error('Only job seeker accounts can apply to jobs');
      return;
    }
    if (hasApplied) {
      toast('You have already applied to this job', { icon: 'ℹ️' });
      return;
    }
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    if (!user) {
      navigate(loginUrl);
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.createApplication({
        applicant_id: user.id,
        job_id: job.id,
        cover_letter: coverLetter || undefined,
      });
      toast.success('Application submitted successfully!');
      setAppliedOverride(true);
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (requestError) {
      toast.error(requestError.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      navigate(loginUrl);
      return;
    }
    if (!isJobSeeker) {
      toast.error('Only job seeker accounts can save jobs');
      return;
    }

    setSaving(true);
    try {
      const response = await jobsAPI.saveJob(job.id);
      const nextSaved = response.data?.saved ?? !isSaved;
      setSavedOverride(nextSaved);
      toast.success(nextSaved ? 'Job saved!' : 'Job removed from saved');
    } catch (requestError) {
      toast.error(requestError.response?.data?.error || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingCover(true);
    try {
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

      if (response.data?.cover_letter) {
        setCoverLetter(response.data.cover_letter);
        toast.success('Cover letter generated!');
      } else {
        toast.error('No cover letter returned');
      }
    } catch (requestError) {
      toast.error(requestError.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setGeneratingCover(false);
    }
  };

  if (status === 'loading' || status === 'refreshing') {
    return <JobDetailsSkeleton />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="We couldn't load this job"
            message={error || 'The job listing may have been removed or is temporarily unavailable.'}
            onRetry={retry}
          />
          <div className="text-center mt-6">
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to all jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="Job not found"
            message="This job may have been filled or removed. Browse other opportunities to find your next role."
            action={
              <Link to="/jobs" className="btn-primary inline-flex items-center justify-center">
                Browse Jobs
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const skills = Array.isArray(job.skills_required)
    ? job.skills_required
    : typeof job.skills_required === 'string'
      ? job.skills_required.split(',')
      : [];

  const description = typeof job.description === 'object' ? job.description?.description || '' : job.description;
  const requirements = typeof job.requirements === 'object' ? job.requirements?.description || '' : job.requirements;
  const salary = formatJobSalary(job);
  const benefits = typeof job.benefits === 'object' ? job.benefits?.description || '' : job.benefits;
  const companyName = getCompanyName(job);

  return (
    <div className="min-h-screen py-8 rounded-[2rem] mx-2 sm:mx-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/jobs"
            className="text-primary-600 hover:text-accent-cyan inline-flex items-center gap-2 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>
        </div>

        <div className="bento-card-glass overflow-hidden">
          <div className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-cyan/20 via-primary-500/20 to-accent-violet/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-3xl">
                    {companyName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600">{companyName}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                type="button"
                onClick={handleSaveJob}
                disabled={saving}
                aria-label={isSaved ? 'Remove job from saved jobs' : 'Save this job'}
                aria-pressed={isSaved}
                className={`p-3 min-w-[44px] min-h-[44px] rounded-lg transition-colors disabled:opacity-60 ${
                  isSaved
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                {saving ? (
                  <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400 block" aria-hidden="true" />
                ) : (
                  <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            </div>

            {hasApplied && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700" role="status">
                You have already applied to this position
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {isJobSeeker && !hasApplied && (
                <button type="button" onClick={openApplyModal} className="btn-glow flex-1 min-h-[44px]">
                  Apply Now
                </button>
              )}
              {!user && (
                <button type="button" onClick={() => navigate(loginUrl)} className="btn-glow flex-1 min-h-[44px]">
                  Sign in to Apply
                </button>
              )}
              {(isJobSeeker || !user) && (
                <button
                  type="button"
                  onClick={handleSaveJob}
                  disabled={saving}
                  className="btn-outline min-h-[44px]"
                  aria-pressed={isSaved}
                >
                  {saving ? 'Saving…' : !user ? 'Sign in to Save' : isSaved ? 'Saved' : 'Save Job'}
                </button>
              )}
            </div>

            {!user && (
              <p className="text-sm text-gray-600 mb-8" role="note">
                <Link to={loginUrl} className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>{' '}
                or{' '}
                <Link
                  to={`/register?returnTo=${encodeURIComponent(`/jobs/${id}`)}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  create an account
                </Link>{' '}
                to apply and save jobs.
              </p>
            )}

            {user && !isJobSeeker && (
              <p className="text-sm text-gray-600 mb-8" role="note">
                You are signed in as a {user.role}. Only job seeker accounts can apply to or save jobs.
              </p>
            )}

            <div className="space-y-8">
              {description && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose text-gray-600 whitespace-pre-line">{description}</div>
                </section>
              )}

              {requirements && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose text-gray-600 whitespace-pre-line">{requirements}</div>
                </section>
              )}

              {benefits && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                  <div className="prose text-gray-600 whitespace-pre-line">{benefits}</div>
                </section>
              )}

              {skills.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.filter(Boolean).map((skill, index) => (
                      <span key={`${skill.trim()}-${index}`} className="badge bg-primary-100 text-primary-700">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium capitalize">{job.job_type?.replace('-', ' ')}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium capitalize">{job.experience_level}</p>
                  </div>
                  {salary && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-gray-500">Salary Range</p>
                      <p className="font-medium">
                        {salary}
                      </p>
                    </div>
                  )}
                  {job.department && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{job.department}</p>
                    </div>
                  )}
                </div>
              </section>

              {(companyName !== 'Company' || job.recruiter) && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h2>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-bold">
                          {companyName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{companyName}</p>
                        {job.recruiter?.name && (
                          <p className="text-sm text-gray-500">{job.recruiter.name}</p>
                        )}
                        {job.recruiter?.email && (
                          <p className="text-sm text-gray-500">{job.recruiter.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
            aria-describedby="apply-modal-description"
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto outline-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 id="apply-modal-title" className="text-xl font-bold text-gray-900">
                Apply for {job.title}
              </h2>
              <p className="text-gray-600">{job.company_name || job.company}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="cover-letter" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 transition-all resize-y"
                  placeholder="Write a cover letter or generate one with AI..."
                />
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCover}
                  className="mt-2 min-h-[44px] text-sm text-primary-600 hover:text-primary-500 inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {generatingCover ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" aria-hidden="true" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>

              <div id="apply-modal-description" className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/50">
                <p className="text-sm text-blue-700">
                  Your profile information will be shared with the employer.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="flex-1 btn-ghost min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                aria-busy={applying}
                className="flex-1 btn-glow min-h-[44px] inline-flex items-center justify-center gap-2"
              >
                {applying && (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true" />
                )}
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default JobDetails;
