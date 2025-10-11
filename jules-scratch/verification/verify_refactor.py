from playwright.sync_api import sync_playwright, expect

def run(playwright):
    """
    Navigates to each page and takes a screenshot to verify the UI.
    """
    browser = playwright.chromium.launch(headless=True)
    # Set the locale to English for consistency in tests
    context = browser.new_context(locale="en-US")
    page = context.new_page()

    # 1. Verify the main calculator page
    print("Verifying main page...")
    page.goto("http://127.0.0.1:5000/")
    expect(page.get_by_role("heading", name="Change Calculator")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/verification-index.png")
    print("Main page screenshot captured.")

    # 2. Verify the history page
    print("Verifying history page...")
    page.goto("http://127.0.0.1:5000/history")
    expect(page.get_by_role("heading", name="Transaction History")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/verification-history.png")
    print("History page screenshot captured.")

    # 3. Verify the configuration page
    print("Verifying configuration page...")
    page.goto("http://127.0.0.1:5000/configuracion")
    expect(page.get_by_role("heading", name="Settings")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/verification-configuracion.png")
    print("Configuration page screenshot captured.")

    # Clean up
    context.close()
    browser.close()
    print("Verification complete.")

with sync_playwright() as playwright:
    run(playwright)