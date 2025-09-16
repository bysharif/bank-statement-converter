#!/usr/bin/env node

import FirecrawlApp from 'firecrawl';
import fs from 'fs';
import path from 'path';

const app = new FirecrawlApp({ apiKey: "fc-6c1168230e6044a097c18d8fa75e9415" });

// Test with limited competitors first
const testMode = false;

// List of competitor websites to research
const competitors = [
    {
        name: "CSV2QIF Converter",
        url: "https://csv2qif.com",
        category: "Format Converter"
    },
    {
        name: "Statement Converter",
        url: "https://www.statementconverter.com",
        category: "Bank Statement Tool"
    },
    {
        name: "MoneyThumb PDF Converter",
        url: "https://moneythumb.com",
        category: "Financial PDF Tools"
    },
    {
        name: "ProperSoft Bank Statement Converter",
        url: "https://www.propersoft.net",
        category: "Desktop Software"
    },
    {
        name: "Able2Extract Professional",
        url: "https://www.investintech.com/prod_a2e.htm",
        category: "PDF to Excel"
    },
    {
        name: "PDFTables",
        url: "https://pdftables.com",
        category: "PDF Table Extraction"
    },
    {
        name: "Tabula",
        url: "https://tabula.technology",
        category: "Open Source PDF Tool"
    },
    {
        name: "SmallPDF",
        url: "https://smallpdf.com/pdf-to-excel",
        category: "Online PDF Tools"
    }
];

// Research areas to focus on
const researchPrompts = {
    features: "Extract all features, capabilities, and supported file formats mentioned on this page. Focus on bank statement conversion, PDF processing, and output formats.",
    pricing: "Find pricing information, subscription plans, free tier details, and any cost-related information.",
    technology: "Identify the technology stack, whether it's web-based, desktop software, API-based, or mobile app.",
    targetMarket: "Determine the target audience - individual users, small businesses, enterprises, accountants, etc.",
    uniqueValue: "Extract the unique value proposition, key differentiators, and main selling points."
};

async function researchCompetitor(competitor) {
    console.log(`\n🔍 Researching: ${competitor.name}`);
    console.log(`📍 URL: ${competitor.url}`);

    try {
        // Scrape the main page
        const scrapeResult = await app.v1.scrapeUrl(competitor.url, {
            formats: ['markdown']
        });

        if (!scrapeResult.success) {
            console.log(`❌ Failed to scrape ${competitor.name}: ${scrapeResult.error}`);
            return null;
        }

        const analysis = {
            competitor: competitor.name,
            url: competitor.url,
            category: competitor.category,
            scrapedAt: new Date().toISOString(),
            content: scrapeResult.markdown,
            analysis: {}
        };

        // Analyze different aspects
        for (const [aspect, prompt] of Object.entries(researchPrompts)) {
            console.log(`  📊 Analyzing ${aspect}...`);

            try {
                // Use Firecrawl's extract feature for structured analysis
                const extractResult = await app.v1.scrapeUrl(competitor.url, {
                    formats: ['extract'],
                    extract: {
                        schema: {
                            type: "object",
                            properties: {
                                [aspect]: {
                                    type: "string",
                                    description: prompt
                                }
                            }
                        }
                    }
                });

                if (extractResult.success && extractResult.extract) {
                    analysis.analysis[aspect] = extractResult.extract[aspect];
                }
            } catch (error) {
                console.log(`    ⚠️ Could not extract ${aspect}: ${error.message}`);
            }
        }

        return analysis;

    } catch (error) {
        console.log(`❌ Error researching ${competitor.name}: ${error.message}`);
        return null;
    }
}

async function runCompetitorResearch() {
    console.log("🚀 Starting Competitor Research for Bank Statement Converter");
    console.log(`📋 Researching ${competitors.length} competitors...\n`);

    const results = [];

    // Research each competitor with delay to avoid rate limits
    const competitorsToResearch = testMode ? competitors.slice(0, 2) : competitors;

    for (let i = 0; i < competitorsToResearch.length; i++) {
        const competitor = competitorsToResearch[i];
        const result = await researchCompetitor(competitor);

        if (result) {
            results.push(result);
            console.log(`✅ Completed research for ${competitor.name}`);
        }

        // Add delay between requests
        if (i < competitorsToResearch.length - 1) {
            console.log("⏳ Waiting 3 seconds before next request...");
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Save results
    const outputDir = path.join(process.cwd(), 'research');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `competitor-research-${timestamp}.json`);

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

    console.log(`\n📊 Research complete! Results saved to: ${outputFile}`);
    console.log(`📈 Successfully researched ${results.length} out of ${competitorsToResearch.length} competitors`);

    // Generate summary report
    generateSummaryReport(results, outputDir, timestamp);
}

function generateSummaryReport(results, outputDir, timestamp) {
    const reportFile = path.join(outputDir, `competitor-summary-${timestamp}.md`);

    let report = `# Competitor Research Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Competitors Analyzed:** ${results.length}\n\n`;

    report += `## Executive Summary\n\n`;
    report += `This report analyzes ${results.length} competitors in the bank statement conversion and PDF processing space.\n\n`;

    report += `## Competitor Overview\n\n`;

    for (const result of results) {
        report += `### ${result.competitor}\n\n`;
        report += `- **URL:** ${result.url}\n`;
        report += `- **Category:** ${result.category}\n\n`;

        if (result.analysis.features) {
            report += `**Features:**\n${result.analysis.features}\n\n`;
        }

        if (result.analysis.pricing) {
            report += `**Pricing:**\n${result.analysis.pricing}\n\n`;
        }

        if (result.analysis.uniqueValue) {
            report += `**Value Proposition:**\n${result.analysis.uniqueValue}\n\n`;
        }

        report += `---\n\n`;
    }

    report += `## Key Insights\n\n`;
    report += `### Market Gaps Identified\n`;
    report += `- [Add insights based on research]\n\n`;

    report += `### Pricing Strategies\n`;
    report += `- [Add pricing analysis]\n\n`;

    report += `### Feature Comparison\n`;
    report += `- [Add feature comparison]\n\n`;

    fs.writeFileSync(reportFile, report);
    console.log(`📄 Summary report saved to: ${reportFile}`);
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the research
runCompetitorResearch().catch(console.error);