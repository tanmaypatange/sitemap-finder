async function findSitemap() {
    const url = document.getElementById('urlInput').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    if (!url) {
        resultDiv.textContent = 'Please enter a valid URL.';
        return;
    }

    try {
        const baseUrl = new URL(url).origin;
        const sitemapUrls = new Set();

        // Strategy 1: Check robots.txt
        try {
            const robotsTxt = await fetch(`${baseUrl}/robots.txt`).then(res => res.text());
            const sitemapLines = robotsTxt.split('\n').filter(line => line.startsWith('Sitemap:'));
            sitemapLines.forEach(line => sitemapUrls.add(line.split(' ')[1]));
        } catch (error) {
            console.log('Robots.txt not found or inaccessible');
        }

        // Strategy 2: Check common sitemap paths
        const commonSitemapPaths = [
            '/sitemap.xml',
            '/sitemap_index.xml',
            '/sitemap1.xml',
            '/sitemap2.xml',
            '/sitemap/index.xml',
            '/sitemap/sitemap.xml',
        ];
        for (const path of commonSitemapPaths) {
            try {
                const sitemapUrl = `${baseUrl}${path}`;
                const response = await fetch(sitemapUrl);
                if (response.ok) {
                    sitemapUrls.add(sitemapUrl);
                }
            } catch (error) {
                console.log(`Sitemap not found at ${path}`);
            }
        }

        // Strategy 3: Check HTML <link> tags
        try {
            const homepageHtml = await fetch(baseUrl).then(res => res.text());
            const parser = new DOMParser();
            const doc = parser.parseFromString(homepageHtml, 'text/html');
            const sitemapLinks = doc.querySelectorAll('link[rel="sitemap"]');
            sitemapLinks.forEach(link => sitemapUrls.add(link.href));
        } catch (error) {
            console.log('Error parsing homepage HTML');
        }

        // Display results
        if (sitemapUrls.size > 0) {
            resultDiv.innerHTML = '<h3>Sitemaps Found:</h3>';
            sitemapUrls.forEach(sitemapUrl => {
                resultDiv.innerHTML += `<a href="${sitemapUrl}" target="_blank">${sitemapUrl}</a><br>`;
            });
        } else {
            resultDiv.innerHTML = '<span class="error">No sitemaps found.</span>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<span class="error">Error fetching sitemap. Please check the URL and try again.</span>';
    }
}
