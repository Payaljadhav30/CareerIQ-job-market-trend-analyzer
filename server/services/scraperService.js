const puppeteer = require('puppeteer');

// Scrape Naukri jobs
const scrapeNaukriJobs = async (role, skills = []) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const searchQuery = encodeURIComponent(role);
    await page.goto(`https://www.naukri.com/${searchQuery}-jobs`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.jobTuple', { timeout: 10000 }).catch(() => {});

    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.jobTuple, article.jobTupleHeader');
      const results = [];

      jobCards.forEach((card, i) => {
        if (i >= 10) return;
        const title = card.querySelector('.title, .jobTitle')?.innerText?.trim();
        const company = card.querySelector('.subTitle, .companyName')?.innerText?.trim();
        const experience = card.querySelector('.expwdth, li[class*="experience"]')?.innerText?.trim();
        const salary = card.querySelector('.salary, li[class*="salary"]')?.innerText?.trim();
        const location = card.querySelector('.loc, li[class*="location"]')?.innerText?.trim();
        const link = card.querySelector('a')?.href;

        if (title && company) {
          results.push({ title, company, experience, salary, location, link, source: 'Naukri' });
        }
      });
      return results;
    });

    return jobs.length > 0 ? jobs : getFallbackJobs(role);
  } catch (err) {
    console.error('Scraping error:', err.message);
    return getFallbackJobs(role);
  } finally {
    if (browser) await browser.close();
  }
};

// Fallback static jobs if scraping fails
const getFallbackJobs = (role) => {
  const jobs = {
    'full stack': [
      { title: 'Full Stack Developer', company: 'TCS', experience: '0-2 years', salary: '4-8 LPA', location: 'Bangalore', link: 'https://www.naukri.com/full-stack-developer-jobs', source: 'Naukri' },
      { title: 'MERN Stack Developer', company: 'Infosys', experience: '0-1 years', salary: '3-6 LPA', location: 'Pune', link: 'https://www.naukri.com/mern-stack-developer-jobs', source: 'Naukri' },
      { title: 'Junior Web Developer', company: 'Wipro', experience: 'Fresher', salary: '3-5 LPA', location: 'Hyderabad', link: 'https://www.naukri.com/junior-web-developer-jobs', source: 'Naukri' },
    ],
    'aiml': [
      { title: 'ML Engineer Intern', company: 'Google', experience: 'Fresher', salary: '20-40k/month', location: 'Bangalore', link: 'https://www.naukri.com/machine-learning-engineer-jobs', source: 'Naukri' },
      { title: 'Data Scientist', company: 'Amazon', experience: '0-2 years', salary: '8-15 LPA', location: 'Hyderabad', link: 'https://www.naukri.com/data-scientist-jobs', source: 'Naukri' },
      { title: 'AI Engineer', company: 'Microsoft', experience: '0-2 years', salary: '10-18 LPA', location: 'Bangalore', link: 'https://www.naukri.com/ai-engineer-jobs', source: 'Naukri' },
    ]
  };

  const key = Object.keys(jobs).find(k => role.toLowerCase().includes(k)) || 'full stack';
  return jobs[key] || jobs['full stack'];
};

module.exports = { scrapeNaukriJobs, getFallbackJobs };
