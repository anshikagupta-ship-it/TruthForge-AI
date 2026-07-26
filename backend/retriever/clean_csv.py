import csv

import re


def garbage_remover(text: str) -> str:
    """
    Cleans extracted evidence.
    """

    # Normalize whitespace
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)

    # Remove common boilerplate
    garbage_patterns = [

        # Cookie / Consent
        r"cookie\s+policy",
        r"privacy\s+policy",
        r"cookie\s+settings",
        r"cookie\s+preferences",
        r"cookie\s+notice",
        r"accept\s+cookies",
        r"manage\s+cookies",
        r"consent\s+preferences",
        r"consent\s+manager",
        r"tracking\s+technologies",
        r"browser\s+type",
        r"analytics\s+cookies",
        r"marketing\s+cookies",
        r"necessary\s+cookies",
        r"functional\s+cookies",
        r"performance\s+cookies",

        # Legal
        r"terms\s+of\s+use",
        r"terms\s+and\s+conditions",
        r"all\s+rights\s+reserved",
        r"copyright",
        r"legal\s+notice",
        r"disclaimer",

        # Navigation
        r"home",
        r"menu",
        r"breadcrumb",
        r"next\s+page",
        r"previous\s+page",
        r"back\s+to\s+top",

        # Social
        r"share\s+this",
        r"share\s+on",
        r"follow\s+us",
        r"facebook",
        r"twitter",
        r"x\.com",
        r"linkedin",
        r"instagram",
        r"youtube",
        r"whatsapp",
        r"telegram",
        r"pinterest",
        r"linkedin",
        r"facebook.com",

        # CTA
        r"subscribe",
        r"sign\s+up",
        r"sign\s+in",
        r"log\s+in",
        r"register",
        r"join\s+now",
        r"create\s+account",
        r"read\s+more",
        r"learn\s+more",
        r"click\s+here",
        r"view\s+more",
        r"continue\s+reading",
        r"see\s+more",

        # Ads
        r"advertisement",
        r"advertisements",
        r"sponsored",
        r"sponsor",
        r"promoted",

        # Newsletter
        r"newsletter",
        r"email\s+updates",
        r"stay\s+updated",
        r"weekly\s+newsletter",

        # Footer
        r"contact\s+us",
        r"about\s+us",
        r"site\s+map",
        r"accessibility",
        r"careers",
        r"feedback",
        r"help\s+center",
        r"faq",

        # Misc
        r"loading",
        r"please\s+wait",
        r"javascript",
        r"enable\s+javascript",
        r"skip\s+to\s+content",
        r"skip\s+navigation",
    ]

    for pattern in garbage_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    # Collapse whitespace again
    text = re.sub(r"\s+", " ", text)

    return text.strip()

def deduplicator(csv_path: str):
    """
    Removes duplicate evidence from the CSV,
    cleans every evidence block,
    sorts by descending score,
    and overwrites the CSV.
    """

    with open(csv_path, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    seen = set()
    cleaned = []

    for row in rows:

        row["text"] = garbage_remover(row["text"])

        # Skip empty evidence
        if not row["text"]:
            continue

        # Skip tiny evidence
        if len(row["text"].split()) < 20:
            continue

        # Normalize for duplicate detection
        key = row["text"].lower()

        if key in seen:
            continue

        seen.add(key)
        cleaned.append(row)

    # Highest score first
    cleaned.sort(
        key=lambda x: float(x["score"]),
        reverse=True
    )

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=cleaned[0].keys()
        )

        writer.writeheader()
        writer.writerows(cleaned)



