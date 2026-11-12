export const getCompanyName = (job = {}) =>
  [job.company_name, job.company, job.recruiter?.company_name]
    .find((name) => typeof name === 'string' && name.trim())
    ?.trim() || 'Company';

export const formatJobSalary = (job = {}) => {
  const min = Number(job.salary_min);
  const max = Number(job.salary_max);
  const currency = job.salary_currency || 'Rs.';

  if (!Number.isFinite(min) || min <= 0) return '';
  if (!Number.isFinite(max) || max <= 0) return `${currency} ${min.toLocaleString()}+`;

  return `${currency} ${min.toLocaleString()} - ${currency} ${max.toLocaleString()}`;
};
