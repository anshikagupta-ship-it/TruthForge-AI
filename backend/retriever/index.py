import io
import os
import time
print(1,flush=True)
import requests
print(2,flush=True)
import config
print(3,flush=True)
import filter1
print(4,flush=True)
import time
import csv
import clean_csv
from concurrent.futures import ThreadPoolExecutor
print(5,flush=True)
from sentence_transformers import util

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    from ddgs import DDGS
except ImportError:
    DDGS = None

try:
    from dotenv import load_dotenv
    # Load environment variables from the .env file if it exists
    load_dotenv()
except ImportError:
    pass

# Pull the GitHub token from the environment.
# Make sure you create a .env file containing: GITHUB_TOKEN=ghp_your_actual_token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

model = filter1.model

ai_filter = filter1.SemanticFilter(model=model)

TIMEOUT = 15
HEADERS = {
    "User-Agent": "ResearchVerificationBot/1.0",
    "Accept": "application/vnd.github.v3+json",
}

# Add the auth header if the token is provided
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"

class KnowledgeScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

        self.tech_repos = {
            "rust": "rust-lang/rust",
            "python": "python/cpython",
            "react": "facebook/react",
            "kubernetes": "kubernetes/website",
            "go": "golang/go",
            "nodejs": "nodejs/node",
            "typescript": "microsoft/TypeScript"
        }

    def _get_with_retry(self, url, params=None, stream=False, max_retries=3):

        for attempt in range(max_retries):
            r = self.session.get(url, params=params, stream=stream, timeout=TIMEOUT)

            # Specific check for missing GitHub authentication
            if r.status_code == 401 and "github.com" in url:
                print("\n[!] ERROR: GitHub Code Search requires a Personal Access Token.")
                print("[!] Export it in your terminal: export GITHUB_TOKEN='ghp_...'")
                return None

            if r.status_code in [403, 429]:
                sleep_time = 2 ** attempt
                print(f"Rate Limited (Code: {r.status_code}) on {url}. Sleeping {sleep_time}s...")
                time.sleep(sleep_time)
                continue

            r.raise_for_status()
            return r
        return None

    def extract_text_from_pdf(self, pdf_bytes):
        if not PdfReader:
            return "Error: pypdf not installed."
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            return f"Error parsing PDF: {str(e)}"

    def search_arxiv(self, query, max_results=config.research_limit):
        import xml.etree.ElementTree as ET

        url = "https://export.arxiv.org/api/query"
        params = {
            "search_query": f"all:{query}",
            "max_results": max_results
        }

        results = []

        try:
            r = self._get_with_retry(url, params=params)
            if not r:
                return []

            ns = {"a": "http://www.w3.org/2005/Atom"}
            root = ET.fromstring(r.text)

        except Exception as e:
            print(f"ArXiv API failed: {e}")
            return []

        query_embedding = model.encode(query, convert_to_tensor=True)

        for e in root.findall("a:entry", ns):

            try:
                title = e.find("a:title", ns).text.strip()
                abstract = e.find("a:summary", ns).text.strip()

                score = util.cos_sim(
                    query_embedding,
                    model.encode(
                        title + "\n" + abstract,
                        convert_to_tensor=True
                    )
                ).item()

                score += filter1.phrase_bonus(query, title + " " + abstract)

                if score < 0.12:
                    continue

                abs_url = e.find("a:id", ns).text.strip()
                pdf_url = abs_url.replace("/abs/", "/pdf/")

                pdf_req = self._get_with_retry(pdf_url, stream=True)

                if not pdf_req:
                    continue

                data = self.extract_text_from_pdf(pdf_req.content)

                if not data or data.startswith("Error:"):
                    continue

                matches = ai_filter.extract_relevant_paragraphs(
                    query=query,
                    scraped_text=data,
                    url=pdf_url,
                    threshold=config.threshold
                )

                results.append({
                    "url": pdf_url,
                    "data": matches
                })

            except Exception as e:
                print(f"Skipping {pdf_url}: {e}")
                continue

        return results

    def search_github_docs(self, query, limit=config.github_limit):
        if not GITHUB_TOKEN:
            print("Skipping GitHub search — No GITHUB_TOKEN provided.")
            return []

        # Global documentation search
        github_query = query

        search_url = "https://api.github.com/search/code"

        results = []

        try:
            r = self._get_with_retry(
                search_url,
                params={
                    "q": github_query,
                    "per_page": limit,
                    "sort": "indexed",
                    "order": "desc"
                }
            )

            if not r:
                return []

            items = r.json().get("items", [])

            for item in items:

                raw_url = (
                    item["html_url"]
                    .replace("github.com", "raw.githubusercontent.com")
                    .replace("/blob/", "/")
                )

                #print(f"Fetching Raw Doc: {item['html_url']}")

                doc_req = self._get_with_retry(raw_url)

                if not doc_req or not doc_req.text:
                    continue

                results.append({
                    "url": item["html_url"],
                    "repo": item["repository"]["full_name"],
                    "data": ai_filter.extract_relevant_paragraphs(
                        query=query,
                        scraped_text=doc_req.text,
                        url=item["html_url"],
                        threshold=config.threshold
                    )
                })

        except Exception as e:
            print(f"GitHub Search failed: {e}")

        return results

    def search_news_and_gov(self, query, max_results=config.gov_limit):
        """Uses the DDG internal API to safely search highly trusted domains."""
        if not DDGS:
            print("Skipping News/Gov search (duckduckgo-search not installed).")
            return []

        #print(f"Searching News & Gov sources for: {query}")
        # We constrain the search to our highly trusted domains
        trusted_domains = [
                    config.NEWS_DOMAINS,
                    config.MEDICAL_DOMAINS,
                    config.SCIENCE_DOMAINS,
                    config.TECH_DOMAINS,
                    config.GOV_DOMAINS,
                    config.FACTCHECK_DOMAINS,
                    config.INTERNATIONAL_DOMAINS,
                ]
        ddg_querys = ["{} {}".format(query ," OR ".join(trusted_domain)) for trusted_domain in trusted_domains]

        results = []
        try:
            # Modern duckduckgo_search API
            ddgs = DDGS()
            for ddg_query in ddg_querys:
                search_results = list(ddgs.text(ddg_query, max_results=max_results))

                for r in search_results:
                    # The 'body' contains a clean, extracted snippet of the relevant text!
                    # No need to download the actual HTML page and fight paywalls.
                    results.append({
                        "url": r.get("href", ""),
                        "data": ai_filter.extract_relevant_paragraphs(query,r.get("body", ""),r.get("href", ""),config.threshold)
                    })
        except Exception as e:
            print(f"News & Gov search failed: {e}")

        return results

    def search_all(self, query):
        """
        Master orchestration function.
        Gathers evidence from Research, Documentation, and News/Gov.
        """
        with ThreadPoolExecutor(max_workers=3) as executor:

            arxiv_future = executor.submit(self.search_arxiv, query)
            github_future = executor.submit(self.search_github_docs, query)
            news_future = executor.submit(self.search_news_and_gov, query)

            arxiv_results = arxiv_future.result()
            github_results = github_future.result()
            news_results = news_future.result()

        all_results = []
        all_results.extend(arxiv_results)
        all_results.extend(github_results)
        all_results.extend(news_results)

        return all_results

def export(query,file_name):
    scraper = KnowledgeScraper()
    start = time.perf_counter()


    aggregated_evidence = scraper.search_all(query )

    data = []
    for i in aggregated_evidence:
        d = i["data"]
        data.extend(d)

    filter1.export_to_csv(data,file_name)

    clean_csv.deduplicator(file_name)



    print("total time = ",time.perf_counter()-start)

import argparse


parser = argparse.ArgumentParser()

parser.add_argument("--query", required=True)
parser.add_argument("--output", default="matches.csv")

args = parser.parse_args()

export(
    query=args.query,
    file_name=args.output
)

