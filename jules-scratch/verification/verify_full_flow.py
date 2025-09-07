from playwright.sync_api import sync_playwright, expect
import pathlib

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        base_path = "http://localhost:8000"

        # --- 1. Login Flow ---
        print("Testing login flow...")
        page.goto(f"{base_path}/index.html")
        expect(page).to_have_url(f"{base_path}/login.html")
        page.locator("#username").fill("test")
        page.locator("#password").fill("123")
        page.locator('button[data-i18n-key="loginButton"]').click()
        expect(page).to_have_url(f"{base_path}/index.html")
        print("Login flow PASSED.")

        # --- 2. Default Language Check (Spanish) ---
        print("Testing default language...")
        expect(page.locator('[data-i18n-key="calculatorTitle"]')).to_have_text("Calculadora de Cambio")
        print("Default language PASSED.")

        # --- 3. Language Change to English ---
        print("Testing language change...")
        page.locator('[data-i18n-key="navSettings"]').click()
        expect(page).to_have_url(f"{base_path}/configuracion.html")
        # Click English button
        page.locator('[data-lang="en"]').click()
        # Check config page for translation
        expect(page.locator('[data-i18n-key="settingsTitle"]')).to_have_text("Settings")
        # Go back to calculator and check again
        page.locator('[data-i18n-key="navCalculator"]').click()
        expect(page).to_have_url(f"{base_path}/index.html")
        expect(page.locator('[data-i18n-key="calculatorTitle"]')).to_have_text("Change Calculator")
        print("Language change PASSED.")

        # --- 4. Dark Mode Exclusion Test ---
        print("Testing dark mode exclusion...")
        # Go back to config
        page.locator('[data-i18n-key="navSettings"]').click()
        expect(page).to_have_url(f"{base_path}/configuracion.html")

        # Turn on dark mode
        page.locator("label.theme-switch[for='theme-toggle']").click()

        # Assert config page body does NOT have dark-mode class
        expect(page.locator("body")).not_to_have_class("dark-mode")

        # Navigate to index page
        page.locator('[data-i18n-key="navCalculator"]').click()
        expect(page).to_have_url(f"{base_path}/index.html")

        # Assert index page body DOES have dark-mode class
        expect(page.locator("body")).to_have_class("dark-mode")
        print("Dark mode exclusion PASSED.")

        # --- 5. Final Screenshot ---
        screenshot_path = "jules-scratch/verification/verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Verification complete. Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run_verification()
