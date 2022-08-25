const puppeteer = require('puppeteer');
const fs = require('fs');

//Base URL of startup india website
const url = "https://www.startupindia.gov.in/content/sih/en/search.html?roles=Startup&page=0&industries="

async function fetchData(pageURL, fileName) {
    //Selecting "Load More" button using ID attribute
    const selectorForLoadMoreButton = '#loadmoreicon';
    
    //Basic Puppeteer code - launch browser, open new page yada yada
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(pageURL, {waitUntil: 'load', timeout: 0}); 
    //Setting timeout to 0 to avoid "Navigation Timeout" error since website for taking time to load

    //Check if "Load More" button element is visible and return the status
    const isElementVisible = async (page, cssSelector) => {
        let visible = true;
        await page
          .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
          .catch(() => {
            visible = false;
          });
        return visible;
      };

    //If "Load More" button is visible, keep on clicking it
    let loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);
    while (loadMoreVisible) {
    await page
        .click(selectorForLoadMoreButton)
        .catch(() => {});
    loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);
    }

    // After the full page is loaded, select h3 heading and save array in "result" variable
    const result = await page.evaluate(() => {
        let companyFromWeb = document.querySelectorAll('.events-details h3'); 
        const companyList = [...companyFromWeb];
        return companyList.map(company => company.innerText);
    });


    // Convert "result" array to JSON string
    const data = JSON.stringify(result);

    // Write JSON string to a file
    fs.writeFile(fileName, data, (err) => {
        if (err) {
            throw err;
        }
        console.log("Data is saved to file");
    });
    
    await browser.close();
}

// It's past midnight and I am too sleepy to rewrite below code
fetchData(url+'5f48ce5f2a9bb065cdfa1740', 'education.json');
fetchData(url+'5f48ce5f2a9bb065cdfa1732', 'agriculture.json');
fetchData(url+'5f48ce5f2a9bb065cdfa1742', 'renewable_energy.json');
fetchData(url+'5f48ce5f2a9bb065cdfa1743', 'green_technology.json');
fetchData(url+'5f48d0ca2a9bb065cdfc47b3', 'waste_management.json');
fetchData(url+'5f48d0ca2a9bb065cdfc47b1', 'logistics.json');