const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Authenticated session cookie
const MY_COOKIE = 'snc-companies-searchfiltersexpanded=sectorclassification; _twpid=tw.1786616873415.252768363137953440; _hjSessionUser_2094027=eyJpZCI6ImI1YmNkODUyLWJhMjItNWE4Yi1hZWRmLWNiMmUxNGFjZDVjMCIsImNyZWF0ZWQiOjE3ODY2MTY4NzM0NDcsImV4aXN0aW5nIjpmYWxzZX0=; _ga=GA1.1.1078673785.1786616873; _mkto_trk=id:663-SRH-472&token:_mch-startupnationcentral.org-3dd1964b402f105c8b00d2356f50fd1f; _fbp=fb.1.1786616873718.692272062441791934; __hstc=10927595.5d7f74684b8ed719a5f893f34c442cbe.1786616874123.1786616874123.1786616874123.1; hubspotutk=5d7f74684b8ed719a5f893f34c442cbe; __hssrc=1; _clck=kvkrnr%5E2%5Eg8k%5E0%5E2416; intercom-id-bxv6429e=ed36443e-0b6f-46fc-b846-c98545bc6870; intercom-device-id-bxv6429e=748a770b-1517-405f-a406-30a0fa9f1046; CookieConsent={stamp:%27-1%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27implied%27%2Cver:1%2Cutc:1786616896228%2Cregion:%27IL%27}; g_state={"i_l":0,"i_ll":1786617168955,"i_b":"bhsiZHwGfhA4mlwTIGylYY+x+GPtsm3B6n8HeDYzLDo","i_e":{"enable_itp_optimization":24},"i_et":1786617168955}; snc-userid=wv1Il0s9jBFFEj0i7HeisfZcRwMBIcKNX5rMFflGsjMX1LUwm8G98N; snc-refreshtoken=8ef078f5-a959-4ecf-a4cd-63d83f8dbbfa; snc-chatID=7UXiJF9o0pMYE36Gu3Uc6PIoNtSx97eCznowX1gvtp99RjcRGJVbkB; snc-chattoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiN1VYaUpGOW8wcE1ZRTM2R3UzVWM2UElvTnRTeDk3ZUN6bm93WDFndnRwOTlSamNSR0pWYmtCIn0.DAgW4_6wpCDXFyr5hsSd81TCZjcQ1-ywsjuLFzOD51k; snc-role=USER; snc-followID=APkb0TDSRcmuoAFm5hWV35KvNPxfVtRmteIPQegaSogGS06LR6uAU1; snc-signsource=email; snc-email=galaviv15%40gmail.com; snc-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ3djFJbDBzOWpCRkZFajBpN0hlaXNmWmNSd01CSWNLTlg1ck1GZmxHc2pNWDFMVXdtOEc5OE4iLCJ1c2VyRW1haWwiOiJnYWxhdml2MTVAZ21haWwuY29tIiwidXNlckZ1bGxOYW1lIjoiZ2FsYXZpdjE1QGdtYWlsLmNvbSIsInVzZXJTaWdudXBEYXRlIjoiMjAyNi0wOC0xM1QwMDowMDowMC4wMDBaIiwiY2hhdElkIjoiN1VYaUpGOW8wcE1ZRTM2R3UzVWM2UElvTnRTeDk3ZUN6bm93WDFndnRwOTlSamNSR0pWYmtCIiwiZm9sbG93SWQiOiJBUGtiMFREU1JjbXVvQUZtNWhXVjM1S3ZOUHhmVnRSbXRlSVBRZWdhU29nR1MwNkxSNnVBVTEiLCJ1c2VySUQiOiJ3djFJbDBzOWpCRkZFajBpN0hlaXNmWmNSd01CSWNLTlg1ck1GZmxHc2pNWDFMVXdtOEc5OE4iLCJ1c2VyUm9sZXMiOlsiVVNFUiIsbnVsbF0sImlzQWRtaW4iOmZhbHNlLCJpc01vZGVyYXRvciI6ZmFsc2UsInVzZXJDYXRlZ29yeSI6bnVsbCwiY2hhdF9pZCI6IjdVWGlKRjlvMHBNWUUzNkd1M1VjNlBJb050U3g5N2VDem5vd1gxZ3Z0cDk5UmpjUkdKVmJrQiIsImlkIjoid3YxSWwwczlqQkZGRWowaTdIZWlzZlpjUndNQkljS05YNXJNRmZsR3NqTVgxTFV3bThHOThOIiwiY29uZmlybWVkX2F0IjoiMjAyNi0wOC0xM1QxMDozNDoxMi4wMDBaIiwiZW1haWwiOiJnYWxhdml2MTVAZ21haWwuY29tIiwiZmlyc3RfbmFtZSI6IkdhbCIsImxhc3RfbmFtZSI6IkF2aXYiLCJwcmltYXJ5X3VzYWdlIjoicmVnaXN0cmF0aW9uLXJlYXNvbi1qb2IiLCJsaW5rZWRpbl9wcm9maWxlX3VybCI6bnVsbCwiYnVzaW5lc3NfZW1haWwiOm51bGwsImJ1c2luZXNzX2VtYWlsX3ZhbGlkYXRlZCI6bnVsbCwic2VuZF90b19idXNpbmVzc19lbWFpbCI6bnVsbCwicHJpY2luZ19wbGFuX2tleSI6bnVsbCwicHJpY2luZ19wbGFuX3JlcXVlc3RlZF9hdCI6bnVsbCwidGVybXNfb2ZfdXNlX2FjY2VwdGVkX2F0IjoiMjAyNi0wOC0xM1QxMDozMzoxMS4wMDBaIiwidGVybXNfb2ZfdXNlX3ZlcnNpb24iOiJTTkMgLSBXZWJzaXRlIFRlcm1zIG9mIFVzZSAtIDI2QXByaWwyMDI2IiwicHJpdmFjeV9wb2xpY3lfYWNjZXB0ZWRfYXQiOiIyMDI2LTA4LTEzVDEwOjMzOjExLjAwMFoiLCJwcml2YWN5X3BvbGljeV92ZXJzaW9uIjoiU05DIC0gUHJpdmFjeSBQb2xpY3kgLSAyNi40LjIwMjYiLCJwcmljaW5nX3BsYW5fY2hlY2tvdXRfc3VjY2VlZGVkX2F0IjpudWxsLCJwcmljaW5nX3BsYW5fY2hlY2tvdXRfc3RhdHVzIjpudWxsLCJmdWxsbmFtZSI6IkdhbCBBdml2IiwicGljdHVyZXVybCI6Ii9hc3NldHMvZW1wdHktc3RhdGUuc3ZnIiwiaWF0IjoxNzg2NjE3MjUzLCJleHAiOjE3ODkyMDkyNTN9.hwjdSaiaPtCcbphCqGwvN5jKH_1lC2_6dgcmGBHFN74; snc-analytics-resolution=year; snc-analytics-panel-state=closed; _ga_XR55W56KTR=GS2.1.s1786616873$o1$g1$t1786618455$j60$l0$h0; dicbo_id=%7B%22dicbo_fetch%22%3A1786621686754%7D; _gcl_au=1.1.54601836.1786616873.-.-.1786617172.1628551584.1786616875.1786621695; _ga_9JPS62E7PE=GS2.1.s1786616895$o1$g1$t1786621695$j50$l0$h0; _clsk=xmj4rc%5E1786621695812%5E58%5E1%5Ei.clarity.ms%2Fcollect; intercom-session-bxv6429e=TWZqbFZGZHpqUDh5b0tXaThISjJZQ0tkUEdQa2FLS2VoT25tSEZhUW5xQVRpRERCWm1YcGN0UENBeWlLTEpVQnNEZW1BSjljR3ZBYU1jNkxZdnhYSGpLSWd5SHE4TUJOTS9nVTNzTy9NNElJWFdCQ3h4RkkvQ0w5NjVZdmdMTWNYalNYUTlUN3UzdWg3bzFUc0xmZGlxZ3dSMzh2eGZtWUYzNEVpM2YrRk1FQXljMzdhTE0yejh3cXAxSVZJU1RJVXRmWTBabXo2MCs4aFJYNEtWM2tybldaZGVHa0k0UTdyUVdtcEt1eC8xbz0tLU8yZE1SNXlqbzA3ZXRhVk45RmF2Nnc9PQ==--be32a911d46861901ea6b4cbac6529740c73af6b';

// Blocklist for all common social media / external third-party platforms
const SOCIAL_AND_SYSTEM_DOMAINS = [
  'startupnationcentral.org',
  'linkedin.com',
  'youtube.com',
  'youtu.be',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'github.com',
  'gitlab.com',
  'medium.com',
  'spotify.com',
  'tiktok.com',
  'discord.gg',
  'discord.com',
  'google.com',
  'intercom',
  'clarity.ms',
  'hubspot.com'
];

function isRealCompanyWebsite(href) {
  if (!href || !href.startsWith('http')) return false;
  const lower = href.toLowerCase();
  return !SOCIAL_AND_SYSTEM_DOMAINS.some(domain => lower.includes(domain));
}

// Helper to fetch the official company website and LinkedIn from its SNC page
async function fetchCompanyRealWebsite(slug) {
  const pageUrl = `https://finder.startupnationcentral.org/company_page/${slug}`;
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
        'cookie': MY_COOKIE
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) return { websiteUrl: '', linkedinUrl: '' };

    const html = await res.text();
    const $ = cheerio.load(html);

    let websiteUrl = '';
    let linkedinUrl = $('a[href*="linkedin.com/company/"]').attr('href') || '';

    // Strategy 1: Look specifically in the "Web & social links" section container
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr('href');
      if (isRealCompanyWebsite(href) && !websiteUrl) {
        websiteUrl = href;
      }
    });

    return { websiteUrl, linkedinUrl };
  } catch {
    return { websiteUrl: '', linkedinUrl: '' };
  }
}

async function fetchAndSaveCleanCompanies(pages = 3) {
  console.log('🚀 Starting SNC Scraper (Clean & Structured Pipeline)...');
  const allCompanies = [];

  for (let page = 1; page <= pages; page++) {
    console.log(`\n📄 Fetching and parsing page ${page}...`);
    try {
      const url = `https://finder.startupnationcentral.org/startups/search?page=${page}&semantic=`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
          'cookie': MY_COOKIE
        }
      });

      if (!res.ok) {
        console.error(`⚠️ Page ${page} request failed: ${res.status}`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const pageCompanies = [];

      // Collect initial card data
      $('a[href*="/company_page/"]').each((_, el) => {
        const href = $(el).attr('href');
        const slug = href ? href.split('/').pop() : null;

        if (!slug) return;

        const rawCardText = $(el).text();
        const lines = rawCardText
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .filter(line => line !== 'Close' && !line.startsWith('+'));

        const rawTitle = $(el).find('h3, h4, [class*="title"], [class*="name"]').first().text().trim();
        const name = rawTitle || lines[0] || 'Unknown';

        if (pageCompanies.some(c => c.slug === slug)) return;

        const isStealth = rawCardText.includes('STEALTH MODE');
        const foundedYear = lines.find(l => /^\d{4}$/.test(l)) || 'N/A';
        const employeeCount = lines.find(l => /^\d+[-–]\d+$/.test(l)) || 'N/A';
        const fundingAmount = lines.find(l => /^\$\d+[KMB]?$/i.test(l)) || 'N/A';
        const fundingStage = lines.find(l => ['Seed', 'Pre-Seed', 'Series A', 'Series B', 'Series C', 'Bootstrapped', 'Growth'].includes(l)) || 'N/A';
        const businessModel = lines.find(l => ['B2B', 'B2C', 'B2G', 'Marketplace'].includes(l)) || 'B2B';
        const overview = lines.find(l => l.length > 25 && l !== name && !l.includes('http')) || 'N/A';

        pageCompanies.push({
          name,
          slug,
          stealthMode: isStealth,
          overview,
          foundedYear,
          businessModel,
          employeeCount,
          fundingStage,
          fundingAmount,
          sncUrl: `https://finder.startupnationcentral.org/company_page/${slug}`
        });
      });

      // Enrich each company on the page with its REAL website URL
      for (const comp of pageCompanies) {
        process.stdout.write(`🔎 Fetching official website for: ${comp.name}... `);
        const { websiteUrl, linkedinUrl } = await fetchCompanyRealWebsite(comp.slug);
        comp.websiteUrl = websiteUrl || '';
        comp.linkedinUrl = linkedinUrl || '';
        console.log(`✅ ${comp.websiteUrl || 'No website found'}`);

        await new Promise(r => setTimeout(r, 300)); // Polite delay
      }

      // Deduplicate against globally collected companies
      pageCompanies.forEach(comp => {
        if (!allCompanies.some(existing => existing.slug === comp.slug)) {
          allCompanies.push(comp);
        }
      });

      console.log(`✨ Page ${page} finished! Cleaned & enriched ${pageCompanies.length} companies.`);
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.error(`❌ Error processing page ${page}:`, err.message);
      break;
    }
  }

  // Save directly to companies.json
  const outputPath = path.join(__dirname, '../../data/companies.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCompanies, null, 2), 'utf-8');

  console.log(`\n🎉 DONE! Saved ${allCompanies.length} companies with REAL websites to companies.json`);
}

fetchAndSaveCleanCompanies(3);