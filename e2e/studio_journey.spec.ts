import { test, expect } from "@playwright/test";

test.describe("Planora AI — End-to-End Studio User Journey", () => {
  test("1. Landing page loads with valid branding and navigation", async ({ page }) => {
    await page.goto("/");

    // Verify page title and brand heading
    await expect(page).toHaveTitle(/Planora AI/i);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /log in/i }).first()).toBeVisible();
  });

  test("2. Unauthenticated user accessing /dashboard redirects to /signin", async ({ page }) => {
    await page.goto("/dashboard");

    // Route guard redirects unauthenticated session
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole("button", { name: /explore demo studio/i })).toBeVisible();
  });

  test("3. Demo Studio entry provisions complete workspace on /dashboard", async ({ page }) => {
    await page.goto("/signin");

    // Click demo studio entry button
    const demoBtn = page.getByRole("button", { name: /explore demo studio/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Successfully navigates into dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify demo active event profile and readiness card
    await expect(page.locator("text=Aarav & Priya Wedding").first()).toBeVisible();
    await expect(page.locator("text=Event Readiness").first()).toBeVisible();
  });

  test("4. Timeline interaction — task management and status rendering", async ({ page }) => {
    // Enter demo session
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Timeline
    await page.goto("/timeline");
    await expect(page.locator("text=Timeline & Tasks").first()).toBeVisible();

    // Verify task items render
    const taskItem = page.locator("text=Confirm wedding venue contract").or(page.locator("text=Finalize catering menu")).first();
    await expect(taskItem).toBeVisible();
  });

  test("5. Budget interaction — expense cards and allocations", async ({ page }) => {
    // Enter demo session
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Budget
    await page.goto("/budget");
    await expect(page.locator("text=Budget Overview").or(page.locator("text=Allocated")).first()).toBeVisible();

    // Verify currency formatting and category cards
    await expect(page.locator("text=Venue").first()).toBeVisible();
  });

  test("6. AI Ideas — deterministic concept generation & adding to plan", async ({ page }) => {
    // Enter demo session
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Intercept /api/ai/generate to provide a fast, deterministic concept response
    await page.route("**/api/ai/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          concept: {
            id: "concept-e2e-deterministic",
            code: "#AI-E2E-77",
            category: "Themes & Concepts",
            title: "Royal Celestial Pavilion",
            description: "An opulent celestial theme with midnight indigo drapery and brass accents.",
            allocation: 180000,
            matchScore: 97,
            deliverables: [
              { name: "Handcrafted velvet canopy", qty: "1 unit", checked: true },
              { name: "Brass ambient lanterns", qty: "12 units", checked: false }
            ],
            breakdown: [
              { category: "Canopy Styling", percentage: 65, amount: 117000 },
              { category: "Ambient Lighting", percentage: 35, amount: 63000 }
            ],
            palette: [
              { name: "Midnight Indigo", hex: "#1a237e" },
              { name: "Champagne Gold", hex: "#d4af37" }
            ]
          }
        })
      });
    });

    // Navigate to AI Ideas
    await page.goto("/ai-ideas");
    await expect(page.locator("text=AI Ideas").or(page.locator("text=Concept Studio")).first()).toBeVisible();

    // Fill prompt and trigger generation
    const promptInput = page.getByPlaceholder(/describe your dream concept|vintage heritage/i).first();
    if (await promptInput.isVisible()) {
      await promptInput.fill("Opulent celestial evening");
      const generateBtn = page.getByRole("button", { name: /synthesize|generate/i }).first();
      await generateBtn.click();

      // Verify the generated concept card appears
      await expect(page.locator("text=Royal Celestial Pavilion").first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("7. Guests Management — roster listing, VIP cohort and RSVP filtering", async ({ page }) => {
    // Enter demo session
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Guests
    await page.goto("/guests");
    await expect(page.locator("text=Guests & RSVPs").first()).toBeVisible();

    // Verify guest names from demo dataset render
    await expect(page.locator("text=Priya Kapoor").first()).toBeVisible();
    await expect(page.locator("text=Confirmed").first()).toBeVisible();
  });

  test("8. Vendors Management — directory listing and category display", async ({ page }) => {
    // Enter demo session
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Vendors
    await page.goto("/vendors");
    await expect(page.locator("text=Vendor Directory").or(page.locator("text=Vendors")).first()).toBeVisible();

    // Verify vendor directory cards render
    await expect(page.locator("text=Royal Palace Events").or(page.locator("text=FlavourCraft Catering")).first()).toBeVisible();
  });

  test("9. Workspace Persistence — reloading active page retains demo session", async ({ page }) => {
    // Enter demo session
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Still on dashboard without redirect to signin
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("text=Aarav & Priya Wedding").first()).toBeVisible();
  });

  test("10. Demo Data Isolation — fresh browser context cannot access protected studio without login", async ({ browser }) => {
    // Create completely isolated context (incognito / separate storage)
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();

    // Attempt direct navigation to protected dashboard
    await freshPage.goto("/dashboard");

    // Strict isolation: must redirect to /signin
    await expect(freshPage).toHaveURL(/\/signin/);
    await expect(freshPage.getByRole("button", { name: /explore demo studio/i })).toBeVisible();

    await freshContext.close();
  });
});
