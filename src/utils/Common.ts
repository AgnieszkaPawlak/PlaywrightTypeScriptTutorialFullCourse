import { expect, Page } from '@playwright/test';
import AzureDevOps from '../../src/utils/AzureDevOpsHelper';
import * as fs from 'fs';
import { TestReport } from '../../src/interface/TestResults.interface';

import dotenv from 'dotenv';
dotenv.config();


/**
 * Author Testers Talk
 */
export const stringFormat = (str: string, ...args: (string | number)[]): string =>
    str.replace(/{(\d+)}/g, (match, index) => args[index]?.toString() || "");

/**
 * Author Testers Talk
 */
export async function waitUntilAppIdle(page: Page): Promise<void> {
    try {
        // Wait for the function to evaluate in the browser context.
        await page.waitForFunction(() => (window as any).UCWorkBlockTracker?.isAppIdle());
    } catch (e) {
        // Log error with type check for error object
        console.log(`waitUntilIdle failed, ignoring.., error: ${(e as Error).message}`);
    }
}

/**
 * Author Testers Talk
 */
export async function navigateToApps(
    page: Page,
    appId: string | number,
    appName: string
): Promise<void> {
    console.log('Navigate to ' + appName + ' - Start');
    await page.goto(`/main.aspx?appid=${appId.toString()}`);
    await page.getByRole('button', { name: appName }).isVisible();
    console.log('Navigated to ' + appName + ' - Success');
}

/**
 * Author Testers Talk
 */
async function readJsonReport() {
    const azureDevOps = new AzureDevOps();
    const filePath = 'json-test-report.json';

    if (process.env.UPDATE_TEST_PLAN === 'Yes' && process.env.PIPELINE === 'Yes') {

        await waitForFile(filePath);

        try {
            const data: TestReport = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            for (const suite of data.suites) {
                for (const spec of suite.specs) {
                    const testCaseTitle = `${spec.title}`;
                    const matches = testCaseTitle.match(/\[(.*?)\]/);
                    const numbersPart = matches?.[1];
                    const numbersArray: number[] = numbersPart?.split(',').map(num => parseInt(num.trim(), 10)) ?? [];

                    for (const test of spec.tests) {
                        for (const result of test.results) {
                            const testCaseStatus = `${result.status}`;
                            for (const testCaseId of numbersArray) {
                                console.log(`Test Case & Status : ${testCaseId} : ${testCaseStatus}`);
                                await azureDevOps.updateTestCaseStatus(String(testCaseId), testCaseStatus);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error while readinf JSON report' + error)
        }
    } else {
        console.log('Update test plan or pipeline conditions not met.');
    }
}


/**
 * Author Testers Talk
 */
async function waitForFile(filePath: string, timeoutMs = 60_000): Promise<void> {
    const fsPromises = require('fs').promises;
    const start = Date.now();
  
    while (Date.now() - start < timeoutMs) {
      try {
        await fsPromises.access(filePath);
        console.log(`File ${filePath} is now available!`);
        return;
      } catch {
        console.log('Waiting for the file to be available...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  
    throw new Error(`File ${filePath} was not created within ${timeoutMs}ms`);
  }

/**
 * Author: Testers Talk
 */
export async function updateTestCaseStatusInTestPlan() {
    await readJsonReport();
}

/**
 * Author: Testers Talk
 */
export async function loginToApplication(page: Page) {
    await page.goto('https://bakkappan.github.io/Testers-Talk-Practice-Site');
    await expect(page.locator('#siteHeader')).toContainText('Testers Talk: A Practice Space for Passionate QA Minds');
    await page.getByPlaceholder('Username').click();
    await page.getByPlaceholder('Username').fill('TestersTalk');
    await page.getByPlaceholder('Password').click()
    await page.getByPlaceholder('Password').fill('TestersTalk');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Welcome to Testers Talk!')).toBeVisible();
    await expect(page.locator('#welcomeMsg')).toContainText('Welcome to Testers Talk!');
}

/**
 * Author: Testers Talk
 */
export async function downloadAndValidateFileName(page: Page, Btn: string, fileName: string) {
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: Btn }).click()
    ])

    console.log('Downloaded filename : ' + download.suggestedFilename())
    expect(download.suggestedFilename()).toBe(fileName)

    if (download.suggestedFilename().includes('.xlsx')) {
        await download.saveAs('./downloads/Downloaded_Excel_File.xlsx')
    } else if (download.suggestedFilename().includes('.docx')) {
        await download.saveAs('./downloads/Downloaded_Word_File.docx')
    } else if (download.suggestedFilename().includes('.xml')) {
        await download.saveAs('./downloads/Downloaded_XML_File.xml')
    } else if (download.suggestedFilename().includes('.pdf')) {
        await download.saveAs('./downloads/Downloaded_PDF_File.pdf')
    }
}