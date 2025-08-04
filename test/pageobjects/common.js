class Common {
    async launchUrl(url) {
        await browser.url(url);
        await browser.maximizeWindow();
    }
}
export default new Common();