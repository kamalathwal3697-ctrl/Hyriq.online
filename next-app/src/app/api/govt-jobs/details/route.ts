import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load details page status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let contentHtml = '';
    const tblBorder = $('table.tblborder');
    if (tblBorder.length > 0) {
      contentHtml = $.html(tblBorder.first());
    } else {
      let foundTable = false;
      $('table').each((i, table) => {
        if (!foundTable && $(table).text().includes('Total Vacancy')) {
          contentHtml = $.html(table);
          foundTable = true;
        }
      });
    }

    // Parse resource links (Apply online, official site, etc.)
    const resourceLinks: { label: string, url: string }[] = [];
    let directApplyLink = '';

    $('a').each((i, linkEl) => {
      const href = $(linkEl).attr('href') || '';
      const text = $(linkEl).text().trim().toLowerCase();

      if (href && (href.startsWith('http') || href.startsWith('www'))) {
        if (text.includes('apply online') || text.includes('click here')) {
          resourceLinks.push({ label: 'Apply Online', url: href });
          if (!directApplyLink) directApplyLink = href;
        } else if (text.includes('official notification') || text.includes('pdf')) {
          resourceLinks.push({ label: 'Official Notification (PDF)', url: href });
        } else if (text.includes('official website')) {
          resourceLinks.push({ label: 'Official Website', url: href });
        }
      }
    });

    if (!contentHtml) {
      contentHtml = `<p>Detailed notifications are available at: <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`;
    }

    return NextResponse.json({
      html: contentHtml,
      directApplyLink: directApplyLink || url,
      resourceLinks: resourceLinks.length > 0 ? resourceLinks : [{ label: 'Apply Online / View Details', url }]
    });
  } catch (e) {
    console.warn("Details fetching failed or timed out, returning fallback details:", e);
    return NextResponse.json({
      html: `
        <div style="padding: 16px; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; background: rgba(255,255,255,0.02);">
          <h4 style="margin-top:0; color:#fff;">Government Recruitment Notification</h4>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.5;">
            Official details, qualification tables, age limit details, and apply forms are hosted on FreeJobAlert.
          </p>
          <p style="color: #06b6d4; font-weight:600;">
            👉 Click the "Apply Online" button to visit the portal directly.
          </p>
        </div>
      `,
      directApplyLink: url,
      resourceLinks: [
        { label: 'Apply Online (FreeJobAlert)', url },
        { label: 'Official Notification (PDF)', url }
      ]
    });
  }
}
