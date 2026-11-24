const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const vehicles = ['xe', 'xf'].map((id) => ({
    id,
    apiUrl: `/api/vehicle_${id}.json`,
    media: [
        { url: `/images/1x1/${id}_k17.jpg` },
        { url: `/images/16x9/${id}_k17.jpg` },
    ],
}));

async function loadVehicles(page) {
    await page.route('**/api/vehicles.json', (route) =>
        route.fulfill({ json: vehicles }),
    );
    await page.route('**/api/vehicle_*.json', (route) => {
        const id = route.request().url().includes('vehicle_xe') ? 'xe' : 'xf';
        return route.fulfill({
            json: {
                id,
                price: '£30,000',
                description: 'A refined sports saloon.',
                meta: {
                    passengers: 5,
                    bodystyles: ['saloon'],
                    drivetrain: ['AWD'],
                },
            },
        });
    });
    await page.goto('/');
    await expect(
        page.getByRole('button', { name: 'View details for XE' }),
    ).toBeVisible();
    await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
            Array.from(document.images, (image) => image.decode()),
        );
    });
}

async function expectNoViolations(page) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
    expect(results.violations).toEqual([]);
}

test.beforeEach(async ({ page }) => {
    await loadVehicles(page);
});

test('list and modal meet automated accessibility checks', async ({ page }) => {
    await expectNoViolations(page);
    await page.getByRole('button', { name: 'View details for XE' }).click();
    await expectNoViolations(page);
});

test('modal supports keyboard navigation and restores focus', async ({
    page,
}) => {
    const trigger = page.getByRole('button', { name: 'View details for XE' });
    const dialog = page.getByRole('dialog', { name: 'XE details' });
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(
        dialog.getByRole('heading', { name: 'XE details' }),
    ).toBeFocused();
    await expect(dialog).toHaveJSProperty('open', true);
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(
        page.getByRole('button', {
            name: 'View details for XF',
            includeHidden: true,
        }),
    ).not.toBeFocused();
    await page.evaluate(() =>
        document.querySelector('.vehicle-card__details-button').focus(),
    );
    await expect(trigger).not.toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
});

test('reduced motion and horizontal reflow', async ({ page }) => {
    await expect(page.locator('.vehicle-list__item').first()).toHaveCSS(
        'animation-name',
        'none',
    );
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
});

test('vehicle list visual baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('vehicle-list.png', {
        fullPage: true,
        animations: 'disabled',
    });
});

test('modal visual baseline', async ({ page }) => {
    await page.getByRole('button', { name: 'View details for XE' }).click();
    await expect(page).toHaveScreenshot('vehicle-modal.png', {
        fullPage: true,
        animations: 'disabled',
    });
});
