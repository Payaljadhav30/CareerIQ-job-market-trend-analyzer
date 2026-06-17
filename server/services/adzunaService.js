const axios = require('axios');

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/in'; // 'in' = India

// Field → search keywords mapping
const fieldKeywords = {
  'full stack development': 'full stack developer',
  'ai/ml': 'machine learning engineer',
  'data science': 'data scientist',
  'devops': 'devops engineer',
  'cybersecurity': 'cybersecurity analyst',
  'cloud computing': 'cloud engineer',
  'frontend development': 'frontend react developer',
  'backend development': 'backend node developer',
  'mobile development': 'mobile app developer',
  'blockchain': 'blockchain developer',
  'generative ai': 'generative ai engineer',
  'ui/ux design': 'ui ux designer',
};

// Fetch real jobs from Adzuna API
const fetchAdzunaJobs = async (field, what, page = 1) => {
  const keyword = what || fieldKeywords[field?.toLowerCase()] || 'software developer';

  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY ||
      ADZUNA_APP_ID === 'your_adzuna_app_id_here' ||
      ADZUNA_API_KEY === 'your_adzuna_api_key_here') {
    return getFallbackJobs(field);
  }

  try {
    const res = await axios.get(`${ADZUNA_BASE}/search/${page}`, {
     params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 8,
        what: keyword,
        sort_by: 'date',
      },
      timeout: 8000,
    });

    const jobs = res.data.results || [];
    return jobs.map(job => ({
      title: job.title,
      company: job.company?.display_name || 'Company',
      location: job.location?.display_name || 'India',
      salary: job.salary_min && job.salary_max
        ? `₹${Math.round(job.salary_min / 100000)}-${Math.round(job.salary_max / 100000)} LPA`
        : 'Competitive',
      experience: job.contract_time === 'full_time' ? '0-3 years' : 'Internship',
      link:  job.url || job.redirect_url,
      source: 'Adzuna',
      type: job.contract_type || 'job',
      description: job.description?.substring(0, 120) + '...',
      postedAt: job.created,
    }));
  } catch (err) {
    console.error('Adzuna API error:', err.message);
    console.error('Adzuna full error:', err.response?.data);
    console.error('Adzuna URL called:', err.config?.url);
    console.error('Adzuna params:', err.config?.params);
    return getFallbackJobs(field);
  }
};

// Fetch trending skills data from Adzuna histogram
const fetchSkillTrends = async (field) => {
  const keyword = fieldKeywords[field?.toLowerCase()] || 'software developer';

  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY ||
      ADZUNA_APP_ID === 'your_adzuna_app_id_here' ||
      ADZUNA_API_KEY === 'your_adzuna_api_key_here') {
    return getStaticSkills(field);
  }

  try {
    // Use Adzuna histogram to get salary/demand data
    const res = await axios.get(`${ADZUNA_BASE}/histogram`, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        what: keyword,
        content_type: 'application/json',
      },
      timeout: 8000,
    });
    // Adzuna histogram gives salary data, we overlay with our skill data
    return getStaticSkills(field);
  } catch (err) {
    return getStaticSkills(field);
  }
};

// Static skill data (always reliable, enhanced with categories)
const getStaticSkills = (field) => {
  const skillsMap = {
    'full stack development': [
      { skill: 'React.js', demand: 95, growth: '+42%', category: 'Frontend' },
      { skill: 'Node.js', demand: 92, growth: '+38%', category: 'Backend' },
      { skill: 'TypeScript', demand: 88, growth: '+55%', category: 'Language' },
      { skill: 'MongoDB', demand: 85, growth: '+30%', category: 'Database' },
      { skill: 'REST APIs', demand: 90, growth: '+25%', category: 'Backend' },
      { skill: 'Docker', demand: 75, growth: '+40%', category: 'DevOps' },
      { skill: 'GraphQL', demand: 68, growth: '+35%', category: 'API' },
      { skill: 'Next.js', demand: 80, growth: '+60%', category: 'Frontend' },
    ],
    'ai/ml': [
      { skill: 'Python', demand: 98, growth: '+50%', category: 'Language' },
      { skill: 'TensorFlow', demand: 88, growth: '+45%', category: 'Framework' },
      { skill: 'PyTorch', demand: 85, growth: '+48%', category: 'Framework' },
      { skill: 'LLMs/GenAI', demand: 92, growth: '+80%', category: 'AI' },
      { skill: 'Scikit-learn', demand: 80, growth: '+30%', category: 'ML' },
      { skill: 'NLP', demand: 82, growth: '+55%', category: 'AI' },
      { skill: 'MLOps', demand: 75, growth: '+60%', category: 'DevOps' },
      { skill: 'Computer Vision', demand: 78, growth: '+42%', category: 'AI' },
    ],
    'data science': [
      { skill: 'Python', demand: 97, growth: '+45%', category: 'Language' },
      { skill: 'SQL', demand: 93, growth: '+30%', category: 'Database' },
      { skill: 'Pandas', demand: 90, growth: '+35%', category: 'Library' },
      { skill: 'Tableau', demand: 80, growth: '+28%', category: 'Visualization' },
      { skill: 'Power BI', demand: 82, growth: '+32%', category: 'Visualization' },
      { skill: 'Statistics', demand: 88, growth: '+25%', category: 'Core' },
      { skill: 'Machine Learning', demand: 85, growth: '+42%', category: 'ML' },
      { skill: 'Apache Spark', demand: 70, growth: '+38%', category: 'Big Data' },
    ],
    'devops': [
      { skill: 'Docker', demand: 95, growth: '+50%', category: 'Containers' },
      { skill: 'Kubernetes', demand: 90, growth: '+55%', category: 'Orchestration' },
      { skill: 'AWS', demand: 92, growth: '+45%', category: 'Cloud' },
      { skill: 'CI/CD', demand: 88, growth: '+40%', category: 'Automation' },
      { skill: 'Terraform', demand: 82, growth: '+60%', category: 'IaC' },
      { skill: 'Linux', demand: 85, growth: '+20%', category: 'OS' },
      { skill: 'GitHub Actions', demand: 80, growth: '+65%', category: 'CI/CD' },
      { skill: 'Ansible', demand: 72, growth: '+35%', category: 'Automation' },
    ],
    'cybersecurity': [
      { skill: 'Penetration Testing', demand: 90, growth: '+48%', category: 'Offensive' },
      { skill: 'Network Security', demand: 88, growth: '+35%', category: 'Core' },
      { skill: 'SIEM Tools', demand: 82, growth: '+40%', category: 'Monitoring' },
      { skill: 'Ethical Hacking', demand: 85, growth: '+45%', category: 'Offensive' },
      { skill: 'Cloud Security', demand: 87, growth: '+55%', category: 'Cloud' },
      { skill: 'Zero Trust', demand: 80, growth: '+60%', category: 'Architecture' },
      { skill: 'SOC Analysis', demand: 78, growth: '+38%', category: 'Defensive' },
      { skill: 'Cryptography', demand: 72, growth: '+25%', category: 'Core' },
    ],
    'cloud computing': [
      { skill: 'AWS', demand: 95, growth: '+45%', category: 'Platform' },
      { skill: 'Azure', demand: 88, growth: '+42%', category: 'Platform' },
      { skill: 'GCP', demand: 82, growth: '+40%', category: 'Platform' },
      { skill: 'Terraform', demand: 85, growth: '+60%', category: 'IaC' },
      { skill: 'Serverless', demand: 80, growth: '+55%', category: 'Architecture' },
      { skill: 'Kubernetes', demand: 87, growth: '+52%', category: 'Orchestration' },
      { skill: 'Microservices', demand: 83, growth: '+38%', category: 'Architecture' },
      { skill: 'Cost Optimization', demand: 75, growth: '+35%', category: 'FinOps' },
    ],
    'frontend development': [
      { skill: 'React.js', demand: 95, growth: '+42%', category: 'Framework' },
      { skill: 'TypeScript', demand: 90, growth: '+55%', category: 'Language' },
      { skill: 'Next.js', demand: 85, growth: '+60%', category: 'Framework' },
      { skill: 'CSS/Tailwind', demand: 88, growth: '+35%', category: 'Styling' },
      { skill: 'JavaScript ES6+', demand: 93, growth: '+25%', category: 'Language' },
      { skill: 'Web Performance', demand: 78, growth: '+40%', category: 'Core' },
      { skill: 'Testing (Jest)', demand: 75, growth: '+38%', category: 'Testing' },
      { skill: 'WebAssembly', demand: 65, growth: '+50%', category: 'Advanced' },
    ],
    'backend development': [
      { skill: 'Node.js', demand: 92, growth: '+38%', category: 'Runtime' },
      { skill: 'Python/FastAPI', demand: 88, growth: '+42%', category: 'Framework' },
      { skill: 'PostgreSQL', demand: 85, growth: '+30%', category: 'Database' },
      { skill: 'Redis', demand: 80, growth: '+35%', category: 'Cache' },
      { skill: 'GraphQL APIs', demand: 78, growth: '+40%', category: 'API' },
      { skill: 'Microservices', demand: 82, growth: '+40%', category: 'Architecture' },
      { skill: 'Message Queues', demand: 75, growth: '+45%', category: 'Async' },
      { skill: 'Java/Spring Boot', demand: 83, growth: '+22%', category: 'Framework' },
    ],
    'mobile development': [
      { skill: 'React Native', demand: 88, growth: '+45%', category: 'Cross-platform' },
      { skill: 'Flutter', demand: 85, growth: '+55%', category: 'Cross-platform' },
      { skill: 'Swift (iOS)', demand: 80, growth: '+28%', category: 'Native' },
      { skill: 'Kotlin (Android)', demand: 82, growth: '+32%', category: 'Native' },
      { skill: 'Firebase', demand: 78, growth: '+38%', category: 'Backend' },
      { skill: 'Mobile UI/UX', demand: 80, growth: '+35%', category: 'Design' },
      { skill: 'App Store Deploy', demand: 75, growth: '+20%', category: 'Publishing' },
      { skill: 'Push Notifications', demand: 72, growth: '+25%', category: 'Features' },
    ],
    'blockchain': [
      { skill: 'Solidity', demand: 88, growth: '+65%', category: 'Language' },
      { skill: 'Web3.js/Ethers.js', demand: 85, growth: '+60%', category: 'Library' },
      { skill: 'Smart Contracts', demand: 90, growth: '+70%', category: 'Core' },
      { skill: 'DeFi Protocols', demand: 80, growth: '+75%', category: 'Finance' },
      { skill: 'Hardhat/Truffle', demand: 78, growth: '+55%', category: 'Tools' },
      { skill: 'IPFS', demand: 70, growth: '+45%', category: 'Storage' },
      { skill: 'Layer 2 Solutions', demand: 72, growth: '+80%', category: 'Scaling' },
      { skill: 'NFT Development', demand: 75, growth: '+50%', category: 'NFT' },
    ],

    'generative ai': [
  { skill: 'LLMs', demand: 96, growth: '+95%', category: 'AI' },
  { skill: 'Prompt Engineering', demand: 92, growth: '+90%', category: 'AI' },
  { skill: 'LangChain', demand: 88, growth: '+85%', category: 'Framework' },
  { skill: 'RAG', demand: 85, growth: '+80%', category: 'AI' },
  { skill: 'Vector DBs', demand: 82, growth: '+75%', category: 'Database' },
  { skill: 'Fine-tuning', demand: 78, growth: '+70%', category: 'ML' },
  { skill: 'OpenAI API', demand: 90, growth: '+88%', category: 'API' },
  { skill: 'Hugging Face', demand: 80, growth: '+72%', category: 'Framework' },
],
'ui/ux design': [
  { skill: 'Figma', demand: 95, growth: '+42%', category: 'Tool' },
  { skill: 'Prototyping', demand: 88, growth: '+35%', category: 'Core' },
  { skill: 'User Research', demand: 85, growth: '+30%', category: 'Core' },
  { skill: 'Adobe XD', demand: 75, growth: '+20%', category: 'Tool' },
  { skill: 'Wireframing', demand: 90, growth: '+32%', category: 'Core' },
  { skill: 'Design Systems', demand: 82, growth: '+45%', category: 'Advanced' },
  { skill: 'Usability Testing', demand: 78, growth: '+28%', category: 'Core' },
  { skill: 'Accessibility', demand: 72, growth: '+38%', category: 'Core' },
],
  };

  const defaultSkills = [
    { skill: 'Python', demand: 98, growth: '+50%', category: 'Language' },
    { skill: 'JavaScript', demand: 95, growth: '+35%', category: 'Language' },
    { skill: 'React.js', demand: 92, growth: '+42%', category: 'Frontend' },
    { skill: 'Node.js', demand: 90, growth: '+38%', category: 'Backend' },
    { skill: 'SQL', demand: 88, growth: '+28%', category: 'Database' },
    { skill: 'Docker', demand: 85, growth: '+50%', category: 'DevOps' },
    { skill: 'AWS', demand: 87, growth: '+45%', category: 'Cloud' },
    { skill: 'TypeScript', demand: 86, growth: '+55%', category: 'Language' },
    
  ];

  
  // const key = field?.toLowerCase();
  // return skillsMap[key] || defaultSkills;
  const key = field?.toLowerCase()?.trim();
// try exact match first
if (skillsMap[key]) return skillsMap[key];
// try partial match — handles 'ai/ml' vs 'aiml' etc
const matchedKey = Object.keys(skillsMap).find(k => 
  key?.includes(k) || k?.includes(key)
);
return skillsMap[matchedKey] || defaultSkills;
};

// Fallback jobs when Adzuna is unavailable
const getFallbackJobs = (field) => {
  const jobsMap = {
    'full stack development': [
      { title: 'Full Stack Developer', company: 'TCS', experience: '0-2 years', salary: '4-8 LPA', location: 'Bangalore', link: 'https://www.naukri.com/full-stack-developer-jobs', source: 'Naukri', type: 'job' },
      { title: 'MERN Stack Developer', company: 'Infosys', experience: 'Fresher', salary: '3-6 LPA', location: 'Pune', link: 'https://www.naukri.com/mern-stack-developer-jobs', source: 'Naukri', type: 'job' },
      { title: 'React + Node Developer', company: 'Wipro', experience: '0-1 years', salary: '3-5 LPA', location: 'Hyderabad', link: 'https://www.naukri.com/react-node-developer-jobs', source: 'Naukri', type: 'job' },
    ],
    'ai/ml': [
      { title: 'ML Engineer', company: 'Amazon', experience: '0-2 years', salary: '8-15 LPA', location: 'Hyderabad', link: 'https://www.naukri.com/machine-learning-engineer-jobs', source: 'Naukri', type: 'job' },
      { title: 'AI Engineer', company: 'Microsoft', experience: '0-2 years', salary: '12-20 LPA', location: 'Bangalore', link: 'https://www.naukri.com/ai-engineer-jobs', source: 'Naukri', type: 'job' },
    ],
    'data science': [
      { title: 'Data Analyst', company: 'Accenture', experience: '0-2 years', salary: '5-10 LPA', location: 'Mumbai', link: 'https://www.naukri.com/data-analyst-jobs', source: 'Naukri', type: 'job' },
      { title: 'Data Engineer', company: 'Deloitte', experience: '1-3 years', salary: '8-15 LPA', location: 'Bangalore', link: 'https://www.naukri.com/data-engineer-jobs', source: 'Naukri', type: 'job' },
    ],
    'devops': [
      { title: 'DevOps Engineer', company: 'IBM', experience: '0-2 years', salary: '6-12 LPA', location: 'Bangalore', link: 'https://www.naukri.com/devops-engineer-jobs', source: 'Naukri', type: 'job' },
      { title: 'Cloud Engineer', company: 'Accenture', experience: '0-1 years', salary: '5-10 LPA', location: 'Hyderabad', link: 'https://www.naukri.com/cloud-engineer-jobs', source: 'Naukri', type: 'job' },
    ],
  };
  const key = field?.toLowerCase();
  return jobsMap[key] || [
    { title: 'Software Developer', company: 'Various Companies', experience: '0-2 years', salary: '4-10 LPA', location: 'Bangalore', link: 'https://www.naukri.com/software-developer-jobs', source: 'Naukri', type: 'job' },
    { title: 'Junior Developer', company: 'TCS/Infosys/Wipro', experience: 'Fresher', salary: '3-6 LPA', location: 'Multiple Cities', link: 'https://www.naukri.com/fresher-jobs', source: 'Naukri', type: 'job' },
  ];
};

module.exports = { fetchAdzunaJobs, fetchSkillTrends, getStaticSkills, getFallbackJobs };
