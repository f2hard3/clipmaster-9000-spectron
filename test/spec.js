const path = require('path');
const Application = require('spectron').Application;
const electronPath = require('electron');

const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')],
    webdriverOptions: {
        deprecationWarnings: false
    }
});

jest.setTimeout(10000);

describe('Clipmaster 9000', () => {
    beforeAll(async () => {
        await app.start();
        return app.client.waitUntilWindowLoaded();
    });

    afterAll(() => {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it('shows an initial window', async () => {
        const count = await app.client.getWindowCount();
        expect(count).toBe(1);
    });

    it('has the correct title', async () => {
        const title = await app.client.getTitle();
        expect(title).toBe('Clipmaster 9000');
    });

    it('does not have the developer tools open', async () => {
        const devToopsAreOpen = await app.client.browserWindow.isDevToolsOpened();
        expect(devToopsAreOpen).toBe(false);
    });

    it('has a button with the text "Copy from Clipboard"', async () => {
        const buttonText = await app.client.getText('#copy-from-clipboard');
        expect(buttonText).toBe('Copy from Clipboard');
    });

    it('should not have clippings when it starts up', async () => {
        const clippings = await app.client.$$('.clippings-list-item');
        expect(clippings).toHaveLength(0);
    });

    it('should have one clipping when the "Copy from Clipboard" button has been pressed', async () => {
        await app.client.click('#copy-from-clipboard');
        const clippings = await app.client.$$('.clippings-list-item');
        expect(clippings).toHaveLength(1);
    });

    it('should successfully remove a clipping', async () => {
        await app.client
            .moveToObject('.clippings-list-item')
            .click('.remove-clipping');
        const clippings = await app.client.$$('.clippings-list-item');
        expect(clippings).toHaveLength(0);
    });

    it('should have the correct text in a new clipping', async () => {
        await app.electron.clipboard.writeText('Vegan Ham');
        await app.client.click('#copy-from-clipboard');
        const clippingText = await app.client.getText('.clipping-text');
        expect(clippingText).toBe('Vegan Ham');
    });

    it('should write the clipping text to the clipboard', async () => {
        await app.electron.clipboard.writeText('Vegan Ham');
        await app.client.click('#copy-from-clipboard');
        await app.electron.clipboard.writeText('Sunggon Park');
        await app.client.click('.copy-clipping');
        const clipboardText = await app.electron.clipboard.readText();
        expect(clipboardText).toBe('Vegan Ham');
    });
});
