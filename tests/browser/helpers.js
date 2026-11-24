const { expect } = require('@playwright/test');

async function waitForImages(page) {
    await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
            Array.from(document.images, (image) => image.decode()),
        );
    });
}

async function expectNoModalOverflow(page, dialog) {
    await expect(dialog).toBeVisible();
    const overflow = await dialog.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const body = element.querySelector('.vehicle-dialog__body');
        return {
            page: document.documentElement.scrollWidth > window.innerWidth,
            dialog: element.scrollWidth > element.clientWidth + 1,
            body: body.scrollWidth > body.clientWidth + 1,
            outsideViewport: bounds.left < -1 || bounds.right > window.innerWidth + 1,
            clippedContent: Array.from(
                element.querySelectorAll('header, section, img, dt, dd, button'),
            ).filter((child) => {
                const rect = child.getBoundingClientRect();
                return rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
            }).map((child) => child.tagName),
        };
    });
    expect(overflow).toEqual({
        page: false,
        dialog: false,
        body: false,
        outsideViewport: false,
        clippedContent: [],
    });
}

module.exports = { waitForImages, expectNoModalOverflow };
