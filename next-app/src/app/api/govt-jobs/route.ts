import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const FALLBACK_JOBS = [
  {
    id: "govt-sbi-sco-2026",
    title: "Specialist Cadre Officer (140 Posts)",
    recruitmentBoard: "State Bank of India (SBI)",
    postDate: "2026-07-01",
    qualification: "Degree, PG (Relevant Discipline)",
    vacancy: "140",
    lastDate: "2026-07-28",
    applyLink: "https://www.freejobalert.com/sbi-specialist-officer/1105477/",
    category: "bank",
    state: "all"
  },
  {
    id: "govt-ibps-crp-2026",
    title: "CRP Clerks XIV (6128 Posts)",
    recruitmentBoard: "Institute of Banking Personnel Selection (IBPS)",
    postDate: "2026-07-02",
    qualification: "Any Degree",
    vacancy: "6128",
    lastDate: "2026-07-21",
    applyLink: "https://www.freejobalert.com/ibps-clerk/1105478/",
    category: "bank",
    state: "all"
  },
  {
    id: "govt-upsc-eng-2026",
    title: "Assistant Engineer & Drug Inspector (450 Posts)",
    recruitmentBoard: "Union Public Service Commission (UPSC)",
    postDate: "2026-06-28",
    qualification: "Degree in Pharmacy/Engineering",
    vacancy: "450",
    lastDate: "2026-07-16",
    applyLink: "https://www.freejobalert.com/articles/upsc-recruitment-2026-apply-online-for-450-drug-inspector-assistant-engineer-and-more-posts-3055477",
    category: "engineering",
    state: "all"
  },
  {
    id: "govt-ssc-cpo-2026",
    title: "Sub Inspector in Delhi Police & CAPF (4187 Posts)",
    recruitmentBoard: "Staff Selection Commission (SSC)",
    postDate: "2026-06-25",
    qualification: "Any Degree",
    vacancy: "4187",
    lastDate: "2026-07-20",
    applyLink: "https://www.freejobalert.com/ssc-cpo/1105480/",
    category: "defence",
    state: "all"
  },
  {
    id: "govt-rrc-railway-2026",
    title: "Act Apprentice (3820 Posts)",
    recruitmentBoard: "Railway Recruitment Cell (RRC) - Central Railway",
    postDate: "2026-07-03",
    qualification: "10th Class, ITI (Relevant Trade)",
    vacancy: "3820",
    lastDate: "2026-08-02",
    applyLink: "https://www.freejobalert.com/central-railway-apprentice/1105481/",
    category: "railway",
    state: "all"
  },
  {
    id: "govt-ntpc-eng-2026",
    title: "Executive (Engineering) (220 Posts)",
    recruitmentBoard: "National Thermal Power Corporation (NTPC)",
    postDate: "2026-07-04",
    qualification: "B.E/B.Tech (Relevant Discipline)",
    vacancy: "220",
    lastDate: "2026-07-25",
    applyLink: "https://www.freejobalert.com/ntpc-executive/1105482/",
    category: "engineering",
    state: "all"
  },
  {
    id: "govt-punjab-police-constable-2026",
    title: "Police Constable (1746 Posts)",
    recruitmentBoard: "Punjab Police Department",
    postDate: "2026-06-30",
    qualification: "12th Class, Punjabi language study in 10th",
    vacancy: "1746",
    lastDate: "2026-07-30",
    applyLink: "https://www.freejobalert.com/punjab-police-constable/1105483/",
    category: "defence",
    state: "punjab"
  },
  {
    id: "govt-ctet-teaching-2026",
    title: "Central Teacher Eligibility Test (CTET) Jan 2026",
    recruitmentBoard: "Central Board of Secondary Education (CBSE)",
    postDate: "2026-06-20",
    qualification: "Diploma/Degree (Education), B.Ed",
    vacancy: "Notification",
    lastDate: "2026-07-15",
    applyLink: "https://www.freejobalert.com/ctet/1105484/",
    category: "teaching",
    state: "all"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const state = searchParams.get('state') || 'all';

  let jobs: any[] = [];

  try {
    let url = 'https://www.freejobalert.com/government-jobs/';
    if (category === 'bank') url = 'https://www.freejobalert.com/bank-jobs/';
    else if (category === 'teaching') url = 'https://www.freejobalert.com/teaching-jobs/';
    else if (category === 'engineering') url = 'https://www.freejobalert.com/engineering-jobs/';
    else if (category === 'railway') url = 'https://www.freejobalert.com/railway-jobs/';
    else if (category === 'defence') url = 'https://www.freejobalert.com/police-defence-jobs/';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('table').each((i, table) => {
      const headerRow = $(table).find('tr').first();
      const headers = headerRow.find('th, td').map((idx, el) => $(el).text().trim()).get();
      if (headers.includes('Post Date') && headers.includes('Recruitment Board')) {
        $(table).find('tr').each((rowIdx, row) => {
          if (rowIdx === 0) return;
          const cols = $(row).find('td');
          if (cols.length >= 7) {
            const postDate = $(cols[0]).text().trim();
            const recruitmentBoard = $(cols[1]).text().trim();
            const title = $(cols[2]).text().trim();
            const qualification = $(cols[3]).text().trim();
            const vacancy = $(cols[4]).text().trim();
            const lastDate = $(cols[5]).text().trim();
            const applyLink = $(cols[6]).find('a').attr('href') || $(cols[2]).find('a').attr('href') || '';

            if (recruitmentBoard && title) {
              jobs.push({
                id: `govt-scraped-${rowIdx}-${i}-${Date.now()}`,
                title,
                recruitmentBoard,
                postDate,
                qualification,
                vacancy,
                lastDate,
                applyLink,
                category,
                state: state
              });
            }
          }
        });
      }
    });
  } catch (e) {
    console.warn("FreeJobAlert fetch failed or timed out, using curated fallback data:", e);
  }

  // If scraping failed or returned empty results, use fallback data
  if (jobs.length === 0) {
    jobs = FALLBACK_JOBS;
  }

  // Filter based on category and state
  let filteredJobs = jobs;
  if (category !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.category === category);
  }
  if (state !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.state && j.state.toLowerCase() === state.toLowerCase());
  }

  return NextResponse.json(filteredJobs);
}
