async function testImport() {
  try {
    const location = 'Mumbai';
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!res.ok) {
      console.log(`Arbeitnow API returned status: ${res.status}`);
      return;
    }
    const data = await res.json();
    const rawJobs = data.data || [];
    
    console.log(`Fetched ${rawJobs.length} raw jobs.`);
    
    const importedJobs = rawJobs.slice(0, 3).map((job, index) => {
      const skills = job.tags || ['Tech'];
      
      // Clean HTML tags from description if needed, or keep a brief excerpt
      let cleanDesc = job.description ? job.description.replace(/<[^>]*>/g, '') : '';
      if (cleanDesc.length > 300) {
        cleanDesc = cleanDesc.substring(0, 300) + '...';
      }

      return {
        id: `job-imported-${Date.now()}-${index}`,
        title: job.title,
        companyName: job.company_name,
        location: `${location}, Maharashtra`,
        type: 'Full-time',
        mode: job.remote ? 'Remote' : 'On-site',
        salary: '₹8,00,000 - ₹12,00,000 / year',
        experience: 'Mid-level',
        skills: skills.slice(0, 5),
        description: cleanDesc,
        postedDate: new Date().toISOString()
      };
    });
    
    console.log("Sample imported jobs:");
    console.log(JSON.stringify(importedJobs, null, 2));
  } catch (e) {
    console.error("Error importing:", e);
  }
}

testImport();
