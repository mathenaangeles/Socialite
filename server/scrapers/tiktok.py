from playwright.sync_api import sync_playwright
import json

def scrape_tiktok_shop(category="all", region="us"):
    url = f"https://www.tiktok.com/shop/{region}/trending?category={category}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        page.wait_for_selector('div.product-card')

        products = []
        product_cards = page.query_selector_all('div.product-card')

        for card in product_cards:
            try:
                name = card.query_selector('h3.product-title').inner_text()
                price = card.query_selector('.price-value').inner_text()
                sales = card.query_selector('.sales-count').inner_text()
                likes = card.query_selector('.like-count').inner_text()
                seller = card.query_selector('.seller-name').inner_text()

                products.append({
                    "name": name,
                    "price": price,
                    "sales": sales,
                    "likes": likes,
                    "seller": seller,
                })
            except:
                continue

        browser.close()
        return products

if __name__ == "__main__":
    data = scrape_tiktok_shop()
    print(json.dumps(data, indent=2))
