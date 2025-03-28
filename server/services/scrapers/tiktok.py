import re
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from config import Configuration
import time

class tiktok_scraper:
    def __init__(self, headless=True):
        # Set up headless Chrome browser
        self.chrome_options = Options()
        # Uncomment these for headless mode if needed
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--log-level=3")
        self.chrome_options.add_argument("--mute-audio")
        # self.chrome_options.add_experimental_option("detach", True)
        # Use the existing database connection
    
    def get_driver(self):
        """Initialize and return a new webdriver instance."""
        return webdriver.Chrome(options=self.chrome_options)
    
    def scrape_tiktok_search(self, search_terms=None, max_entries_pterm=6):
        
        if search_terms is None:     
            search_terms = ["Books", "Skincare", "Fashion"]
            
        """Scrape TikTok search results with enhanced metadata."""
        driver = self.get_driver()
        
        # Store extracted data
        scraped_data = []
        
        for search_term in search_terms:
            try:
                search_term = search_term.replace(" ", "%20")  # Replace spaces with URL encoding
                url = f"https://www.tiktok.com/search?q={search_term}"
                print(f"Searching URL: {url}")
                
                driver.get(url)
                
                # Wait for search results to load
                video_containers = WebDriverWait(driver, 20).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div[class*="DivItemContainerForSearch"]'))
                )
                
                for vid_container in video_containers[0:max_entries_pterm]:                

                    try:
                        # Extract video caption
                        main_text = vid_container.find_element(
                            By.CSS_SELECTOR, "[data-e2e='search-card-video-caption'] span"
                        ).text
                        
                        # Extract hashtags
                        hashtags_elements = vid_container.find_elements(
                            By.CSS_SELECTOR, "a[data-e2e='search-common-link']"
                        )
                        hashtags = []
                        
                        for tag in hashtags_elements:
                            aria_label = tag.get_attribute("aria-label")
                            if aria_label:
                                match = re.search(r'#(\w+)', aria_label)
                                if match:
                                    hashtags.append(f"#{match.group(1)}")
                        
                        # Find video link
                        video_link_containers = vid_container.find_elements(
                            By.CSS_SELECTOR, "a[class*=AVideoContainer]"
                        )
                        
                        if not video_link_containers:
                            print("No video link found for this container")
                            continue
                        
                        video_link = video_link_containers[0].get_attribute("href")
                        
                        # Extract video and user IDs
                        video_parts = video_link.split("/")
                        user_id = video_parts[-3] if len(video_parts) > 3 else "Unknown"
                        video_id = video_parts[-1] if len(video_parts) > 1 else "Unknown"
                        
                        # Extract upload date
                        date_element = vid_container.find_element(
                            By.CSS_SELECTOR, "div[class*='DivTimeTag']"
                        ).text
                        
                        # Process date
                        processed_date = self._process_date(date_element)
                        
                        # Open video to get detailed metadata
                        driver.execute_script(f"window.open('{video_link}', '_blank');")
                        driver.switch_to.window(driver.window_handles[-1])
                        
                        try:
                            # Extended metadata extraction
                            metadata = self._extract_video_metadata(driver)
                            
                            # Combine with existing data
                            video_data = {
                                "id": video_id,
                                "main_text": main_text,
                                "hashtags": hashtags,
                                "user_id": user_id, 
                                "upload_date": processed_date,
                                "video_link": video_link,
                                **metadata,  # Spread the additional metadata
                                "Search Term": search_term
                            }
                            
                            scraped_data.append(video_data)
                            
                            print(f"Scraped detailed video by {user_id}")
                        
                        except Exception as metadata_error:
                            print(f"Error extracting video metadata: {metadata_error}")
                        
                        # Close video tab and switch back
                        driver.close()
                        driver.switch_to.window(driver.window_handles[0])
                    
                    except Exception as inner_error:
                        print(f"Error processing video container: {inner_error}")
                
                
            
            except Exception as outer_error:
                print(f"Overall scraping error: {outer_error}")
                return []
            
        driver.quit()
        return scraped_data
    
    def _extract_video_metadata(self, driver):
        """Extract comprehensive video metadata."""
        metadata = {
            "likes_count": None,
            "comments_count": None,
            "views_count": None,
            "bookmark_count": None,
            "shares_count": None,
            "duration": None,
            "author_info": {}
        }
        
        self._capcha_detection(driver)
        
        try:
            # Likes count
            likes_elements = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'strong[data-e2e="like-count"]'))
            )
            metadata["likes_count"] = self.convert_to_int(likes_elements[0].text if likes_elements else None)
            
            # Comments count
            comments_elements = driver.find_elements(
                By.CSS_SELECTOR, 'strong[data-e2e="comment-count"]'
            )
            metadata["comments_count"] = self.convert_to_int(comments_elements[0].text if comments_elements else None)
            
            # Views count (can be tricky due to TikTok's dynamic rendering)
            views_elements = driver.find_elements(
                By.CSS_SELECTOR, 'strong[data-e2e="video-views"]'
            )
            metadata["views_count"] = self.convert_to_int(views_elements[0].text if views_elements else None)
            
            # Bookmarks count
            bookmarks_elements = driver.find_elements(
                By.CSS_SELECTOR, 'strong[data-e2e="undefined-count"]'
            )
            metadata["bookmark_count"] = self.convert_to_int(bookmarks_elements[0].text if bookmarks_elements else None)
            
            
            # Shares count
            shares_elements = driver.find_elements(
                By.CSS_SELECTOR, 'strong[data-e2e="share-count"]'
            )
            metadata["shares_count"] = self.convert_to_int(shares_elements[0].text if shares_elements else None)
            
            
            # Wait for the video element to load
            # video_element = WebDriverWait(driver, 10).until(
            #     EC.presence_of_element_located((By.TAG_NAME, "video"))
            # )
            
            # print("Video found!")

            # # Click the video to play it
            # video_element.click()
            # print("Video clicked.")

            # # Immediately pause the video using JavaScript
            # driver.execute_script("arguments[0].pause();", video_element)
            # print("Video paused.")
            # time.sleep(3)
            
            # Video duration
            # duration_element = driver.find_element(By.CSS_SELECTOR, 'div[class*="DivSeekBarTimeContainer"]')

            # metadata["duration"] = duration_element.text.split(" / ")[-1].strip() if duration_element else None
            
            # Author information
            try:
                
                # Avatar container
                avatar_container = driver.find_element(
                    By.CSS_SELECTOR, 'div[class*="DivAvatarActionItemContainer"]'
                )
                
                # Author profile link
                author_link = avatar_container.find_element(
                    By.CSS_SELECTOR, 'a[data-e2e="video-author-avatar"]'
                )
                author_profile = author_link.get_attribute('href')
                
                # Author avatar image
                avatar_img = avatar_container.find_element(
                    By.CSS_SELECTOR, 'img[class*="ImgAvatar"]'
                )
                avatar_url = avatar_img.get_attribute('src')
                
                # Author name (from alt text or href)
                author_name = avatar_img.get_attribute('alt')
                
                metadata["author_info"] = {
                    "profile_link": author_profile,
                    "avatar_url": avatar_url,
                    "username": author_name
                }
            
            except Exception as author_error:
                print(f"Could not extract full author info: {author_error}")
        
        except Exception as metadata_error:
            print(f"Error in metadata extraction: {metadata_error}")
        
        return metadata
    
    def _process_date(self, date_element):
        """Process and standardize date formats."""
        # If it's a date in MM-DD format, prepend current year
        if re.match(r'\d{1,2}-\d{1,2}', date_element):
            date_element = f"{datetime.now().year}-{date_element}"
        
        # Mapping time units to timedelta
        time_mapping = {
            "s ago": "seconds",
            "m ago": "minutes",
            "h ago": "hours",
            "d ago": "days",
            "w ago": "weeks"
        }

        for unit, attr in time_mapping.items():
            if unit in date_element:
                try:
                    value = int(date_element.split(unit[0])[0])
                    relative_date = datetime.now() - timedelta(**{attr: value})
                    return relative_date.strftime('%Y-%m-%d')  # Changed format here
                except ValueError:
                    break
        
        # If no conversion happened, return original or current date
        return date_element if date_element else datetime.now().strftime('%Y-%m-%d')
    
    def _capcha_detection(self, driver):
        """Detect and handle CAPTCHA if present."""
        try:
            # Wait for the CAPTCHA container to appear
            captcha_container = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "captcha-verify-container-main-page"))
            )

            print("CAPTCHA detected.")

            # Try clicking the close button if it exists
            close_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "captcha_close_button"))
            )
            time.sleep(5)
            close_button.click()
            print("CAPTCHA closed successfully.")

        except TimeoutException:
            print("No CAPTCHA detected.")
        except Exception as e:
            print(f"Error closing CAPTCHA: {e}")
            
    def convert_to_int(self, value):
        """Convert TikTok-style numbers like '42.8K' to integers."""
        if value in ["N/A", None, ""]:
            return 0
        value = value.upper().replace(",", "")  # Remove commas for thousands
        if "K" in value:
            return int(float(value.replace("K", "")) * 1000)
        elif "M" in value:
            return int(float(value.replace("M", "")) * 1_000_000)
        elif "B" in value:
            return int(float(value.replace("B", "")) * 1_000_000_000)
        return int(value)
    
from app import db, app
from uuid import uuid4
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

class TikTokScrape(db.Model, SerializerMixin):
    __tablename__ = "TikTokScrape"

    id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid4()))
    video_id = db.Column(db.String(100), nullable=False, unique=True)
    search_term = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    profile_link = db.Column(db.String(500), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    main_text = db.Column(db.Text, nullable=False)
    video_link = db.Column(db.String(500), nullable=False)
    upload_date = db.Column(db.DateTime, default=None)
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    hashtags = db.Column(db.Text, nullable=True)
    bookmark_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules = ('-created_at',)

def save_tiktok_data_to_db(data):
    """
    Save TikTok scrape data to the database
    
    Args:
        data (list): List of dictionaries containing TikTok video data
    """
    if not isinstance(data, list):
        print("ERROR: Data is not a list")
        return

    try:
        # Optional: Delete existing data before inserting new data
        db.session.query(TikTokScrape).delete()  
        db.session.commit()

        for item in data:
            # Convert hashtags to a string if they exist
            hashtags_str = ','.join(item.get('hashtags', [])) if item.get('hashtags') else ''

            # Parse upload_date, handle potential string format
            upload_date = item.get('upload_date')
            if isinstance(upload_date, str):
                try:
                    upload_date = datetime.strptime(upload_date, '%Y-%m-%d')
                except ValueError:
                    upload_date = datetime.min  # Default to minimum date if parsing fails

            tiktok_entry = TikTokScrape(
                video_id=str(item.get("id")),  # Convert to string explicitly
                search_term=item.get("Search Term", ""),
                username=item.get("user_id", ""),
                profile_link=item.get("video_link", ""),  # Using video link as profile link
                avatar_url="",  # Placeholder since no avatar_url in data
                upload_date=upload_date,
                video_link=item.get("video_link", ""),
                main_text=item.get("main_text", ""),
                likes_count=item.get("likes_count", 0),
                comments_count=item.get("comments_count", 0),
                views_count=item.get("views_count", 0),
                shares_count=item.get("shares_count", 0),
                hashtags=hashtags_str,
                bookmark_count=item.get("bookmark_count", 0)
            )
            db.session.add(tiktok_entry)

        db.session.commit()
        print(f"✅ {len(data)} records successfully saved to Azure SQL")

    except SQLAlchemyError as e:
        db.session.rollback()  # Rollback in case of failure
        print("❌ ERROR: Could not save data to Azure SQL:", str(e))
        # Optionally, log the full error for debugging
        import traceback
        traceback.print_exc()
        
# Example usage
if __name__ == "__main__":
    engine = create_engine(Configuration.SQLALCHEMY_DATABASE_URI)
    Session = sessionmaker(bind=engine)
    
    scraper = tiktok_scraper()
    results = scraper.scrape_tiktok_search(search_terms=None, max_entries_pterm=6) #, "Fashion", "Home and kitchen", "Books", "Pets"])
    print(f"Total videos scraped: {len(results)}")
    
    import json

    # Open the file in write mode ('w')
    with open('output.txt', 'w', encoding='utf-8') as file:
        for line in results:
            # Convert the dictionary to a string using json.dumps
            file.write(json.dumps(line) + "\n")

    print("Data has been written to output.txt line by line")
    import json

# # Open the file in read mode ('r')
#     with open('output.txt', 'r', encoding='utf-8') as file:
#         # Read all lines and parse each line from JSON to a dictionary
#         results = [json.loads(line.strip()) for line in file]

#     print("Data has been read from output.txt:", results)



    # Save to database
    with app.app_context():
        save_tiktok_data_to_db(results)
        