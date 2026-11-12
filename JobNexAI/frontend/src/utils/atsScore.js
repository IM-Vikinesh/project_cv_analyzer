const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
};

const countWords = (value) => {
  if (typeof value !== 'string') return 0;
  return value.trim().split(/\s+/).filter(Boolean).length;
};

const parseSkills = (value) => {
  if (Array.isArray(value)) return value.map((skill) => String(skill).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value.split(/[,;\n|•]+/).map((skill) => skill.trim()).filter(Boolean);
};

const getStatus = (score) => {
  if (score >= 80) return { label: 'Excellent', tone: 'excellent' };
  if (score >= 60) return { label: 'Good', tone: 'good' };
  if (score >= 40) return { label: 'Fair', tone: 'fair' };
  if (score > 0) return { label: 'Needs Work', tone: 'needsWork' };
  return { label: 'Add details', tone: 'missing' };
};

const scoreSkills = (skills) => {
  const count = skills.length;
  if (count >= 10) return 100;
  if (count >= 7) return 90;
  if (count >= 5) return 80;
  if (count >= 3) return 65;
  if (count >= 1) return 45;
  return 0;
};

const ACTION_VERBS = [
  'led', 'managed', 'developed', 'built', 'designed', 'implemented', 'created',
  'achieved', 'improved', 'increased', 'reduced', 'delivered', 'launched',
  'coordinated', 'analyzed', 'collaborated', 'maintained', 'optimized', 'mentored',
];

const scoreExperience = (text) => {
  const words = countWords(text);
  if (!words) return 0;

  let score;
  if (words >= 100) score = 100;
  else if (words >= 70) score = 90;
  else if (words >= 45) score = 80;
  else if (words >= 25) score = 65;
  else if (words >= 10) score = 50;
  else score = 30;

  const lower = text.toLowerCase();
  const actionHits = ACTION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`).test(lower)).length;
  score += Math.min(actionHits * 3, 9);
  if (/\d/.test(text)) score += 4;
  if (/(19|20)\d{2}/.test(text)) score += 2;

  return clamp(score);
};

const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'bsc', 'msc', 'mba', 'phd', 'doctorate', 'diploma',
  'degree', 'university', 'college', 'institute', 'certificate', 'certification',
  'gpa', 'honours', 'honors',
];

const scoreEducation = (text) => {
  const words = countWords(text);
  if (!words) return 0;

  let score;
  if (words >= 30) score = 85;
  else if (words >= 20) score = 80;
  else if (words >= 10) score = 65;
  else if (words >= 4) score = 50;
  else score = 30;

  const lower = text.toLowerCase();
  const keywordHits = EDUCATION_KEYWORDS.filter((keyword) => lower.includes(keyword)).length;
  score += Math.min(keywordHits * 8, 20);

  return clamp(score);
};

const scoreFormat = (user) => {
  const fields = [
    [user.name, 15],
    [user.email, 15],
    [user.phone, 15],
    [user.location, 10],
    [user.bio, 15],
    [user.profile_image_url, 5],
    [user.skills, 10],
    [user.experience, 10],
    [user.education, 5],
  ];

  return clamp(
    fields.reduce((total, [value, weight]) => total + (hasValue(value) ? weight : 0), 0)
  );
};

const getMessage = (score) => {
  if (score >= 80) return 'great shape!';
  if (score >= 60) return 'good progress!';
  if (score >= 40) return 'room to improve';
  if (score > 0) return 'needs attention';
  return 'add your profile details to begin';
};

export const ATS_TONE_CLASSES = {
  excellent: { dot: 'bg-emerald-400 shadow-sm shadow-emerald-400/50', text: 'text-emerald-300' },
  good: { dot: 'bg-cyan-400 shadow-sm shadow-cyan-400/50', text: 'text-cyan-300' },
  fair: { dot: 'bg-amber-400 shadow-sm shadow-amber-400/50', text: 'text-amber-300' },
  needsWork: { dot: 'bg-rose-400 shadow-sm shadow-rose-400/50', text: 'text-rose-300' },
  missing: { dot: 'bg-white/40', text: 'text-gray-300' },
};

export const getProfileAtsAnalysis = (user) => {
  const profile = user || {};
  const skills = parseSkills(profile.skills);
  const experienceText = typeof profile.experience === 'string' ? profile.experience : '';
  const educationText = typeof profile.education === 'string' ? profile.education : '';

  const categoryScores = [
    { key: 'skills', label: 'Skills', score: scoreSkills(skills) },
    { key: 'experience', label: 'Experience', score: scoreExperience(experienceText) },
    { key: 'education', label: 'Education', score: scoreEducation(educationText) },
    { key: 'format', label: 'Format', score: scoreFormat(profile) },
  ];

  const categories = categoryScores.map((category) => ({
    ...category,
    ...getStatus(category.score),
  }));

  const weightedTotal =
    categories.find((c) => c.key === 'skills').score * 0.3 +
    categories.find((c) => c.key === 'experience').score * 0.3 +
    categories.find((c) => c.key === 'education').score * 0.2 +
    categories.find((c) => c.key === 'format').score * 0.2;

  const score = clamp(weightedTotal);

  return {
    score,
    message: getMessage(score),
    categories,
  };
};
