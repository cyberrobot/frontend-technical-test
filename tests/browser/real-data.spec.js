const { test, expect } = require('@playwright/test');
const { waitForImages, expectNoModalOverflow } = require('./helpers');

const names = ['XE', 'F-PACE', 'F-TYPE', 'I-PACE'];

async function expectVehicleLayout(page) {
    const cards = page.locator('.vehicle-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('.vehicle-card__name')).toHaveText(names);
    await waitForImages(page);

    const width = page.viewportSize().width;
    const columns = width >= 1200 ? 4 : width >= 768 ? 2 : 1;
    const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
        const { x, y, width: cardWidth, height } = element.getBoundingClientRect();
        return { x, y, width: cardWidth, height };
    }));
    const firstRow = boxes.slice(0, columns);
    for (const [index, box] of boxes.entries()) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        expect(Math.abs(box.x - firstRow[index % columns].x)).toBeLessThanOrEqual(1);
        if (index % columns) {
            const previous = boxes[index - 1];
            expect(Math.abs(box.y - previous.y)).toBeLessThanOrEqual(1);
            expect(box.x).toBeGreaterThanOrEqual(previous.x + previous.width - 1);
        }
        if (index >= columns) {
            const above = boxes[index - columns];
            expect(box.y).toBeGreaterThanOrEqual(above.y + above.height - 1);
        }
    }
    expect(await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
    )).toBe(false);
}

test.beforeEach(async ({ page }) => {
    // No API routes are mocked: exercise the bundled list and detail endpoints,
    // including the broken endpoint and vehicles without price information.
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'View details for XE' })).toBeVisible();
});

test('real API data renders four vehicles in the responsive layout', async ({ page }) => {
    await expectVehicleLayout(page);
    await expect(page).toHaveScreenshot('real-vehicle-list.png', {
        fullPage: true,
        animations: 'disabled',
    });
});

test('all real vehicle modals keep specifications within their bounds', async ({ page }) => {
    await expectVehicleLayout(page);
    for (const name of names) {
        await page.getByRole('button', { name: `View details for ${name}` }).click();
        const dialog = page.getByRole('dialog', { name: `${name} details` });
        await expect(dialog.locator('dt')).toHaveText([
            'Body styles', 'Drivetrain', 'Passengers', 'Emissions',
        ]);
        await expectNoModalOverflow(page, dialog);
        if (name === 'XE') {
            await expect(page).toHaveScreenshot('real-vehicle-modal.png', {
                fullPage: true,
                animations: 'disabled',
            });
        }
        await dialog.getByRole('button', { name: 'Close' }).click();
        await expect(dialog).not.toBeVisible();
    }
});

test('real data reflows at an intermediate mobile width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Additional mobile viewport coverage');
    await page.setViewportSize({ width: 375, height: 800 });
    await expectVehicleLayout(page);
    await expect(page).toHaveScreenshot('real-vehicle-list-375.png', {
        fullPage: true,
        animations: 'disabled',
    });
    for (const name of names) {
        await page.getByRole('button', { name: `View details for ${name}` }).click();
        const dialog = page.getByRole('dialog', { name: `${name} details` });
        await expectNoModalOverflow(page, dialog);
        await dialog.getByRole('button', { name: 'Close' }).click();
        await expect(dialog).not.toBeVisible();
    }
});
