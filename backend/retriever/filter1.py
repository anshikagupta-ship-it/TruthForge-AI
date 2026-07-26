import re
import csv
import time
import concurrent.futures
from enum import Enum
import time

from sentence_transformers import SentenceTransformer, util

_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading model...", flush=True)
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model



class SourceCategory(Enum):
    CODE_DOCS = "code_docs"
    RESEARCH = "research"
    NEWS = "news"
    GENERAL = "general"

class QueryRouter:
    """Lightweight classifier to decide which sources to search based on the query."""
    @staticmethod
    def route(query: str) -> list[SourceCategory]:
        query_lower = query.lower()
        sources = []

        # Simple keyword heuristics for demonstration
        if any(w in query_lower for w in ['rust', 'python', 'code', 'error', 'trait', 'typecast', 'api']):
            sources.append(SourceCategory.CODE_DOCS)
        if any(w in query_lower for w in ['disease', 'study', 'research', 'paper', 'algorithm']):
            sources.append(SourceCategory.RESEARCH)
        if any(w in query_lower for w in ['market', 'stock', 'news', 'update']):
            sources.append(SourceCategory.NEWS)

        if not sources:
            sources = [SourceCategory.GENERAL] # Fallback

        return sources

def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def generate_variations(query: str):
    q = normalize(query)

    variations = set()

    def add(text):
        text = normalize(text)
        if text:
            variations.add(text)

    add(q)

    # -----------------------------
    # Whitespace variants
    # -----------------------------
    add(re.sub(r"\s+", " ", q))
    add(q.replace(" ", ""))
    add(q.replace(" ", "-"))
    add(q.replace(" ", "_"))

    # -----------------------------
    # Separator variants
    # -----------------------------
    add(q.replace("-", " "))
    add(q.replace("_", " "))
    add(q.replace("-", ""))
    add(q.replace("_", ""))

    # -----------------------------
    # Slash variants
    # -----------------------------
    add(q.replace("/", " "))
    add(q.replace("/", "-"))
    add(q.replace("/", ""))

    # -----------------------------
    # Remove punctuation
    # -----------------------------
    add(re.sub(r"[^\w\s]", "", q))

    # -----------------------------
    # Singular / plural (last word)
    # -----------------------------
    words = q.split()

    if words:
        last = words[-1]

        if last.endswith("ies"):
            words[-1] = last[:-3] + "y"
            add(" ".join(words))

        words[-1] = last

        if last.endswith("es"):
            words[-1] = last[:-2]
            add(" ".join(words))

        words[-1] = last

        if last.endswith("s"):
            words[-1] = last[:-1]
            add(" ".join(words))

        else:
            words[-1] = last + "s"
            add(" ".join(words))

    # -----------------------------
    # Possessives
    # -----------------------------
    add(q.replace("'s", ""))
    add(q.replace("'", ""))

    # -----------------------------
    # Collapse duplicate separators
    # -----------------------------
    add(re.sub(r"[-_ ]+", " ", q))
    add(re.sub(r"[-_ ]+", "-", q))
    add(re.sub(r"[-_ ]+", "_", q))

    # -----------------------------
    # camelCase / PascalCase
    # -----------------------------
    camel = re.sub(r"([a-z])([A-Z])", r"\1 \2", query)
    add(camel)
    add(camel.replace(" ", ""))

    # -----------------------------
    # Acronyms
    # -----------------------------
    add(q.replace(".", ""))
    add(q.replace(".", " "))

    return sorted(variations)

def phrase_bonus(query: str, text: str):
    text = normalize(text)

    for phrase in generate_variations(query):
        if phrase in text:
            return 0.25

    return 0.0



class SemanticFilter:
    def __init__(self, model=None):
        """
        Initializes the filter. Accepts a pre-loaded model to prevent
        reloading it into memory multiple times across executions.
        """
        start_time = time.perf_counter()
        if model:
            print("Using pre-loaded semantic model...")
            self.model = model
        else:

            self.model = get_model()

        print(f"Model initialization took {time.perf_counter() - start_time:.2f}s\n")

    def _extract_url(self, text: str) -> str:
        """
        Attempts to extract a URL from the beginning of the text or within it.
        """
        # Look for standard HTTP/HTTPS URLs
        url_match = re.search(r'https?://[^\s]+', text)
        if url_match:
            return url_match.group(0)
        return "Unknown Source"

    def chunk_text(self,text, chunk_size=1200, overlap=200):
            chunks = []

            start = 0
            step = chunk_size - overlap

            while start < len(text):
                chunk = text[start:start + chunk_size].strip()

                if len(chunk) > 100:
                    chunks.append(chunk)

                start += step

            return chunks

    def extract_relevant_paragraphs(self, query: str, scraped_text: str,url:str, threshold: float = 0.35) -> list:
        """
        Takes a query and raw scraped text, chunks the text into paragraphs,
        and returns the full paragraphs that semantically match the query.
        """
        start_time = time.perf_counter()
        # Extract source URL if present (assuming it might be prepended to the scraped text)


        # 1. Clean the text: Replace single newlines (line wraps) with spaces,
        # but preserve double newlines (actual paragraph breaks).
        cleaned_text = re.sub(r'(?<!\n)\n(?!\n)', ' ', scraped_text)

        # 2. Split by actual paragraph breaks
        raw_paragraphs = re.split(r'\n{2,}', cleaned_text)

        # 3. Filter out noise (bump up the length requirement to ensure meaty context)
        paragraphs = [p.strip() for p in raw_paragraphs if len(p.strip()) > 100]
        #print(len(paragraphs))

        if not paragraphs:
            return []
        if len(paragraphs) <= 1:

            paragraphs = self.chunk_text(cleaned_text)

        # 2. Convert query and paragraphs into vector embeddings
        # convert_to_tensor=True keeps data on the GPU if available, or optimized CPU formats
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        para_embeddings = self.model.encode(paragraphs, convert_to_tensor=True)

        # 3. Calculate Cosine Similarity between the query and ALL paragraphs at once
        cosine_scores = util.cos_sim(query_embedding, para_embeddings)[0]

        # 4. Extract the paragraphs that meet our confidence threshold
        relevant_data = []
        for i, score in enumerate(cosine_scores):

            semantic = float(score.item())

            bonus = phrase_bonus(query, paragraphs[i])

            final_score = semantic + bonus

            if final_score >= threshold:
                start = max(0, i - 1)
                end = min(len(paragraphs), i + 2)

                context = "\n\n".join(paragraphs[start:end])

                relevant_data.append({
                    "query": query,
                    "source_url": url,
                    "semantic_score": round(semantic, 3),
                    "bonus": round(bonus, 3),
                    "score": round(final_score, 3),
                    "text": paragraphs[i]
                })

        # Sort by most relevant first
        results = sorted(relevant_data, key=lambda x: x['score'], reverse=True)


        #print(f"  -> Filtered '{url}' in {elapsed:.3f}s (Found {len(results)} matches)")

        return results

    def process_documents_parallel(self, query: str, documents: list[str], threshold: float = 0.35) -> list:
        """
        Processes multiple documents in parallel to speed up extraction.
        Filters immediately per document rather than storing all text in memory.
        """

        all_matches = []

        # Using ThreadPoolExecutor for I/O bound or GIL-released tasks
        with concurrent.futures.ThreadPoolExecutor() as executor:
            # Submit all document processing tasks
            futures = [
                executor.submit(self.extract_relevant_paragraphs, query, doc, threshold)
                for doc in documents
            ]

            # Collect results as they complete (filtering on-the-fly)
            for future in concurrent.futures.as_completed(futures):
                try:
                    matches = future.result()
                    all_matches.extend(matches)
                except Exception as e:
                    print(f"Error processing document: {e}")

        # Final sort of all aggregated matches
        all_matches = sorted(all_matches, key=lambda x: x['score'], reverse=True)

        #print(f"Total parallel filtering took {time.perf_counter() - start_time:.2f}s")
        return all_matches

def export_to_csv(data: list, filename: str = "matches.csv"):
    """
    Exports the collected matching data to a CSV file.
    """
    if not data:
        print("No data to export.")
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=["query", "source_url", "semantic_score", "bonus", "score", "text"])
            writer.writeheader()
        return

    # Extract headers from the first dictionary's keys
    headers = data[0].keys()

    try:
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=headers)
            writer.writeheader()
            writer.writerows(data)
        print(f"\nSuccessfully exported {len(data)} matches to {filename}")
    except Exception as e:
        print(f"Error exporting to CSV: {e}")


