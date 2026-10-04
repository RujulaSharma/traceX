"""Log parsing service.

Handles parsing of different log formats (CSV, JSON, NDJSON)
into raw dictionaries that can then be validated and normalized.

Each parser yields individual records so that one malformed
record does not prevent the rest from being processed.
"""

import csv
import io
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def detect_format(filename: str, content: str) -> str:
    """Detect the log format from filename extension and content.

    Priority:
    1. File extension (.csv, .json, .ndjson)
    2. Content inspection (JSON array vs NDJSON vs CSV-like)

    Args:
        filename: Original filename of the uploaded file.
        content: Raw text content of the file.

    Returns:
        One of: 'csv', 'json', 'ndjson'

    Raises:
        ValueError: If format cannot be determined.
    """
    # Check file extension first
    lower_name = filename.lower()
    if lower_name.endswith(".csv"):
        return "csv"
    if lower_name.endswith(".ndjson") or lower_name.endswith(".jsonl"):
        return "ndjson"
    if lower_name.endswith(".json"):
        # Could be JSON array or NDJSON - inspect content
        stripped = content.strip()
        if stripped.startswith("["):
            return "json"
        # Multiple lines of JSON objects = NDJSON
        if stripped.startswith("{") and "\n" in stripped:
            return "ndjson"
        if stripped.startswith("{"):
            return "json"

    # Content-based detection as fallback
    stripped = content.strip()
    if stripped.startswith("["):
        return "json"
    if stripped.startswith("{"):
        return "ndjson"
    # Check for CSV-like content (comma-separated with header-like first line)
    first_line = stripped.split("\n")[0] if "\n" in stripped else stripped
    if "," in first_line and not first_line.startswith("{"):
        return "csv"

    raise ValueError(
        f"Unable to determine log format for '{filename}'. "
        "Supported formats: .csv, .json, .ndjson"
    )


def parse_csv(content: str) -> list[dict[str, Any]]:
    """Parse CSV content into a list of dictionaries.

    Uses the first row as headers. Handles quoted fields and
    standard CSV escaping.

    Args:
        content: Raw CSV text with header row.

    Returns:
        List of dicts, one per CSV row. Keys are header names.
    """
    reader = csv.DictReader(io.StringIO(content))
    records: list[dict[str, Any]] = []
    for row in reader:
        # Clean up empty strings to None
        cleaned: dict[str, Any] = {}
        for key, value in row.items():
            if key is None:
                continue
            clean_key = key.strip()
            if value is None or value.strip() == "":
                cleaned[clean_key] = None
            else:
                cleaned[clean_key] = value.strip()
        records.append(cleaned)

    logger.info("CSV parsed | records=%d", len(records))
    return records


def parse_json(content: str) -> list[dict[str, Any]]:
    """Parse JSON content into a list of dictionaries.

    Accepts either a JSON array of objects or a single JSON object.

    Args:
        content: Raw JSON text.

    Returns:
        List of dicts. Single objects are wrapped in a list.

    Raises:
        ValueError: If JSON is malformed.
    """
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")

    if isinstance(data, list):
        # Validate all items are dicts
        for i, item in enumerate(data):
            if not isinstance(item, dict):
                raise ValueError(f"JSON array item {i} is not an object")
        logger.info("JSON array parsed | records=%d", len(data))
        return data
    elif isinstance(data, dict):
        logger.info("Single JSON object parsed | records=1")
        return [data]
    else:
        raise ValueError("JSON must be an array of objects or a single object")


def parse_ndjson(content: str) -> list[tuple[int, dict[str, Any] | str]]:
    """Parse NDJSON (newline-delimited JSON) content.

    Each line is parsed independently. Invalid lines are captured
    with their error message rather than failing the entire parse.

    Args:
        content: Raw NDJSON text (one JSON object per line).

    Returns:
        List of (line_number, result) tuples where result is either
        a dict (success) or error string (failure).
    """
    results: list[tuple[int, dict[str, Any] | str]] = []
    lines = content.strip().split("\n")

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped:
            continue  # Skip empty lines
        try:
            obj = json.loads(stripped)
            if not isinstance(obj, dict):
                results.append((line_num, f"Line {line_num}: Expected JSON object, got {type(obj).__name__}"))
            else:
                results.append((line_num, obj))
        except json.JSONDecodeError as e:
            results.append((line_num, f"Line {line_num}: Invalid JSON - {e}"))

    valid = sum(1 for _, r in results if isinstance(r, dict))
    invalid = sum(1 for _, r in results if isinstance(r, str))
    logger.info("NDJSON parsed | total_lines=%d valid=%d invalid=%d", len(results), valid, invalid)

    return results
