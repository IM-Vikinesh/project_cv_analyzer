import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { isCanceledRequest } from '../hooks/useAsyncData';
import { JobGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState, InlineError } from '../components/StateMessage';
import { formatJobSalary, getCompanyName } from '../utils/jobFormat';

const readFilters = (searchParams) => ({
  search: searchParams.get('search') || '',
  job_type: searchParams.get('job_type') || '',
  experience_level: searchParams.get('experience_level') || '',
  location: searchParams.get('location') || '',
});

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const candidates = new Set([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
    currentPage - 2,
    currentPage + 2,
  ].filter((page) => page >= 1 && page <= totalPages));

  const sorted = Array.from(candidates).sort((a, b) => a - b);
  const items = [];
  let previous = 0;

  sorted.forEach((page) => {
    if (previous && page - previous > 1) {
      items.push(`ellipsis-${page}`);
    }
    items.push(page);
    previous = page;
  });

  return items;
};

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1, current_page: 1 });
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [locationInput, setLocationInput] = useState(() => searchParams.get('location') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedRef = useRef(false);

  const currentSearch = searchParams.get('search') || '';
  const currentLocation = searchParams.get('location') || '';

  useEffect(() => {
    const nextFilters = readFilters(searchParams);
    setFilters(nextFilters);
    setSearchInput(nextFilters.search);
    setLocationInput(nextFilters.location);
  }, [searchParams]);

  useEffect(() => {
    const nextSearch = searchInput.trim();
    const nextLocation = locationInput.trim();

    if (nextSearch === currentSearch && nextLocation === currentLocation) return undefined;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (nextSearch) params.set('search', nextSearch);
      else params.delete('search');
      if (nextLocation) params.set('location', nextLocation);
      else params.delete('location');
      params.delete('page');
      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, locationInput, currentSearch, currentLocation, searchParams, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setStatus(hasLoadedRef.current ? 'refreshing' : 'loading');
    setError('');

    const params = {
      page: searchParams.get('page') || 1,
      per_page: 12,
      search: searchParams.get('search') || undefined,
      job_type: searchParams.get('job_type') || undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      location: searchParams.get('location') || undefined,
    };

    jobsAPI.getJobs(params, { signal: controller.signal })
      .then((response) => {
        if (!active) return;
        const data = response.data || {};
        setJobs(data.jobs || []);
        setPagination({
          total: data.total || 0,
          pages: data.pages || 1,
          current_page: data.current_page || 1,
        });
        hasLoadedRef.current = true;
        setStatus('success');
      })
      .catch((requestError) => {
        if (!active || isCanceledRequest(requestError)) return;
        setError(requestError.response?.data?.error || 'We could not load jobs right now. Please try again.');
        setStatus('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [searchParams, reloadKey]);

  const applySearchInputs = (params) => {
    const nextSearch = searchInput.trim();
    const nextLocation = locationInput.trim();
    if (nextSearch) params.set('search', nextSearch);
    else params.delete('search');
    if (nextLocation) params.set('location', nextLocation);
    else params.delete('location');
    return params;
  };

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    const params = applySearchInputs(new URLSearchParams(searchParams));
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params, { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const nextSearch = searchInput.trim();
    const nextLocation = locationInput.trim();
    if (nextSearch) params.set('search', nextSearch);
    else params.delete('search');
    if (nextLocation) params.set('location', nextLocation);
    else params.delete('location');
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = applySearchInputs(new URLSearchParams(searchParams));
    params.set('page', page);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setFilters({ search: '', job_type: '', experience_level: '', location: '' });
    setSearchParams({}, { replace: true });
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-orange-100 text-orange-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-green-100 text-green-800',
      'remote': 'bg-teal-100 text-teal-800',
    };
    return colors[type] || 'bg-white/30 text-gray-800';
  };

  const getExperienceColor = (level) => {
    const colors = {
      'entry': 'bg-green-100 text-green-700',
      'mid': 'bg-blue-100 text-blue-700',
      'senior': 'bg-purple-100 text-purple-700',
      'lead': 'bg-orange-100 text-orange-700',
      'executive': 'bg-red-100 text-red-700',
    };
    return colors[level] || 'bg-white/30 text-gray-700';
  };

  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const hasJobs = jobs.length > 0;

  return (
    <div className="min-h-screen py-8 rounded-[2rem] mx-2 sm:mx-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
          <p className="text-gray-600 mt-1 min-h-[24px]" aria-live="polite">
            {isLoading ? (
              <span className="skeleton inline-block h-4 w-52 rounded align-middle" aria-label="Loading job count" />
            ) : status === 'error' && !hasJobs ? (
              'Job listings are temporarily unavailable'
            ) : (
              `Discover ${pagination.total.toLocaleString()} ${pagination.total === 1 ? 'opportunity' : 'opportunities'}`
            )}
          </p>
        </div>

        <div className="bento-card-glass p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 input-field min-h-[44px]"
                  aria-label="Search jobs by title, company, or keyword"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary min-h-[44px] inline-flex items-center justify-center gap-2" aria-busy={isRefreshing}>
              {isRefreshing && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true" />
              )}
              {isRefreshing ? 'Searching…' : 'Search Jobs'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-ghost min-h-[44px]"
              aria-expanded={showFilters}
              aria-controls="job-filters"
            >
              Filters
            </button>
          </form>

          {showFilters && (
            <div id="job-filters" className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.job_type}
                onChange={(event) => updateFilter('job_type', event.target.value)}
                className="input-field min-h-[44px]"
                aria-label="Filter by job type"
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>

              <select
                value={filters.experience_level}
                onChange={(event) => updateFilter('experience_level', event.target.value)}
                className="input-field min-h-[44px]"
                aria-label="Filter by experience level"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>

              <input
                type="text"
                placeholder="Location"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                className="input-field min-h-[44px]"
                aria-label="Filter by location"
              />

              <button
                type="button"
                onClick={clearFilters}
                className="min-h-[44px] text-gray-600 hover:text-gray-900 font-medium rounded-lg px-3 hover:bg-white/30 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <JobGridSkeleton count={12} />
        ) : status === 'error' && !hasJobs ? (
          <ErrorState
            title="We couldn't load jobs"
            message={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : !hasJobs ? (
          <EmptyState
            title="No jobs found"
            message="Try adjusting your search or filters to see more opportunities."
            action={
              <button type="button" onClick={clearFilters} className="btn-primary inline-flex items-center justify-center">
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            {status === 'error' && (
              <div className="mb-4">
                <InlineError message={error} onRetry={() => setReloadKey((key) => key + 1)} />
              </div>
            )}
            {isRefreshing && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500" role="status">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" aria-hidden="true" />
                Updating results…
              </div>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
              {jobs.map((job) => {
                const company = getCompanyName(job);
                const salary = formatJobSalary(job);
                return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bento-card-glass p-6 group hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">
                        {company.charAt(0)}
                      </span>
                    </div>
                    <span className={`badge ${getJobTypeColor(job.job_type)}`}>
                      {job.job_type?.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                  <p className="text-gray-600 mb-3">{company}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location || 'Remote'}
                    </div>
                    {salary && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {salary}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className={`badge ${getExperienceColor(job.experience_level)}`}>
                      {job.experience_level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {job.application_count || 0} applicants
                    </span>
                  </div>
                </Link>
                );
              })}
            </div>
          </>
        )}

        {!isLoading && hasJobs && pagination.pages > 1 && (
          <div className="mt-8 flex flex-wrap justify-center gap-1 sm:gap-2">
            {getPageItems(pagination.current_page, pagination.pages).map((item) => {
              if (typeof item === 'string') {
                return (
                  <span key={item} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400" aria-hidden="true">
                    …
                  </span>
                );
              }

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  disabled={isRefreshing}
                  aria-current={pagination.current_page === item ? 'page' : undefined}
                  aria-label={`Go to page ${item}`}
                  className={`min-w-[44px] min-h-[44px] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed ${
                    pagination.current_page === item ? 'btn-primary' : 'glass hover:bg-white/60'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
