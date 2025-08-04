import ExcelJS from "exceljs";

class SignInPage {
    constructor() {
        this.$emailField = () => $(`//input[@name="loginfmt"]`);
        this.$passwordField = () => $(`//input[@name="passwd"]`);
        this.$button = () => $(`//input[@type="submit"]`);
        this.$label = () => $(`//div[@role="heading"]`);
        this.$signInAnotherWay = () => $(`//a[@id="signInAnotherWay"]`);
        this.$verificationCodeOption = () => $(`//div[contains(text(),"Use a verification code")]`);
        this.$yesButton = () => $(`//input[@value="Yes"]`);
        this.$otpField = () => $(`//input[@name="otc"]`); // MFA OTP input
        this.$signInRequest = () => $(`//div[contains(text(),"Approve sign in request")]`)
    }

    async signIn(email, password) {
        await this.$emailField().setValue(email);
        await this.$button().click();
        await browser.waitUntil(
            async () => (await this.$label().getText()) === 'Enter password',
            {
                timeout: 10000,
                timeoutMsg: 'Expected text to be "Enter password" within 5s'
            }
        );
        await this.$passwordField().setValue(password);
        await this.$button().click();
        await browser.pause(10000);
        if (await this.$signInRequest().isDisplayed()) {
            await browser.waitUntil(
                async () => !(await this.$signInRequest().isDisplayed()),
                {
                    timeout: 20000,
                    timeoutMsg: "Expected 'Approve sign in request' to disappear"
                }
            );
        }
        await this.$yesButton().click();
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
export default new SignInPage();