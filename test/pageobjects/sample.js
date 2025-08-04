import ExcelJS from "exceljs";
import { authenticator } from 'otplib';
import dotenv from 'dotenv';
dotenv.config();

class Common {
    constructor() {
        this.$emailField = () => $(`//input[@type="email"]`);
        this.$passwordField = () => $(`//input[@type="password"]`);
        this.$button = () => $(`//input[@type="submit"]`);
        this.$label = () => $(`//div[@role="heading"]`);
        this.$signInAnotherWay = () => $(`//a[@id="signInAnotherWay"]`);
        this.$verificationCodeOption = () => $(`//div[contains(text(),"Use a verification code")]`);
        this.$yesButton = () => $(`//input[@value="Yes"]`);
        this.$otpField = () => $(`//input[@type="tel"]`); // MFA OTP input
        this.$signInRequest = () => $(`//div[contains(text(),"Approve sign in request")]`)
    }

    async launchUrl(url) {
        await browser.url(url);
        await browser.maximizeWindow();
    }

    async signIn(email, password) {
        await this.$emailField().setValue(email);
        await this.$button().click();
        await browser.waitUntil(
            async () => (await this.$label().getText()) === 'Enter password',
            {
                timeout: 5000,
                timeoutMsg: 'Expected text to be "Enter password" within 5s'
            }
        );
        await this.$passwordField().setValue(password);
        await this.$button().click();
        await this.$signInAnotherWay().click();
        await this.$verificationCodeOption().click();

        // if (await this.$signInAnotherWay().isDisplayed()) {
        //     await this.$signInAnotherWay().click();
        // }
        // if (await this.$verificationCodeOption().isDisplayed()) {
        //     await this.$verificationCodeOption().click();
        // }

        // ✅ Handle MFA OTP if required
        // if (await this.$otpField().isDisplayed()) {
            const otpCode = authenticator.generate(process.env.MFA_SECRET);
            console.log(`Generated OTP: ${otpCode}`);
            await this.$otpField().setValue(otpCode);
            await this.$button().click();
        // }

        // ✅ Handle "Stay signed in?" prompt
        // if (await this.$yesButton().isDisplayed()) {
            await this.$yesButton().click();
        // }
        await browser.pause(15000);
        if (await this.$signInRequest().isDisplayed()) {
            await browser.waitUntil(
                async () => !(await this.$signInRequest().isDisplayed()),
                {
                    timeout: 20000,
                    timeoutMsg: "Expected 'Approve sign in request' to disappear"
                }
            );
        }
        if (await this.$yesButton().isDisplayed({ timeout: 10000 }).catch(() => false)) {
            await this.$yesButton().click();
        }
    }

    async readExcelFile(filePath, sheetName = null) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const sheet = sheetName
            ? workbook.getWorksheet(sheetName)
            : workbook.worksheets[0]; // Default: first sheet

        const data = [];
        sheet.eachRow((row) => {
            data.push(row.values.slice(1)); // Remove first empty index
        });

        return data;
    }

}
export default new Common();