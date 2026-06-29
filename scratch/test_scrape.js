import * as cheerio from 'cheerio';

async function testScrape() {
  try {
    const query = 'jobs in mumbai';
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      console.log(`Failed to fetch: ${res.status}`);
      return;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const results = [];
    $('.result').each((i, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').attr('href');
      results.push({ title, snippet, link });
    });
    
    console.log(`Found ${results.length} search results:`);
    console.log(JSON.stringify(results.slice(0, 10), null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

testScrape();
