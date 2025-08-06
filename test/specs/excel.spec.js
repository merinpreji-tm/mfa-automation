import path from 'path';
import testData from "../testData/sharepoint.json";
import common from "../pageobjects/common";
import signInPage from '../pageobjects/signInPage';

describe('Download excel file', () => {
    it(`Launch the url`, async () => {
        await common.launchUrl(testData.url);
        await expect(browser).toHaveTitle(testData.titles.signIn);
    });

    it(`Sign in to microsoft account`, async () => {
        await signInPage.signIn(testData.credentials.email, testData.credentials.password);
        await browser.waitUntil(
            async () => (await browser.getTitle()) === testData.titles.working,
            {
                timeout: 15000,
                timeoutMsg: `Expected title to be "${testData.titles.working}"`
            }
        );
        await expect(browser).toHaveTitle(testData.titles.working);
        await browser.pause(10000);
    });
});

describe('Read excel file', () => {
    it('Read data from downloaded Excel file', async () => {
        const filePath = path.join(testData.excelFile.downloadDir, testData.excelFile.fileName);
        const excelData = await signInPage.readExcelFile(filePath);
        console.log('Excel Data:', excelData);
        console.log(`Cell A1: ${excelData[0][0]}`); // First row, first column
    });
});