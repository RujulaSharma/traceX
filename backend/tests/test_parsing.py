"""Tests for log parsing (CSV, JSON, NDJSON).

Tests:
- Valid CSV parsing
- Malformed CSV handling
- Valid JSON parsing (array and single object)
- Malformed JSON
- Valid NDJSON parsing
- Mixed valid/invalid NDJSON
- Format detection
"""

import pytest

from app.services.log_parser import (
    detect_format,
    parse_csv,
    parse_json,
    parse_ndjson,
)


class TestFormatDetection:
    """Test automatic format detection."""

    def test_csv_by_extension(self):
        assert detect_format("logs.csv", "a,b\n1,2") == "csv"

    def test_json_by_extension(self):
        assert detect_format("logs.json", '[{"a": 1}]') == "json"

    def test_ndjson_by_extension(self):
        assert detect_format("logs.ndjson", '{"a": 1}\n{"b": 2}') == "ndjson"

    def test_jsonl_by_extension(self):
        assert detect_format("logs.jsonl", '{"a": 1}\n{"b": 2}') == "ndjson"

    def test_json_array_content(self):
        assert detect_format("data.txt", '[{"a": 1}]') == "json"

    def test_ndjson_content(self):
        assert detect_format("data.txt", '{"a": 1}\n{"b": 2}') == "ndjson"

    def test_csv_content(self):
        assert detect_format("data.txt", "col1,col2\nval1,val2") == "csv"

    def test_unknown_format_raises(self):
        with pytest.raises(ValueError):
            detect_format("data.bin", "binary garbage ÿÿÿ")


class TestCSVParsing:
    """Test CSV parsing."""

    def test_valid_csv(self):
        csv_content = (
            "timestamp,event_type,source,username,source_ip,severity,action\n"
            "2026-10-04T10:32:01Z,LOGIN_FAILED,authentication,admin,185.23.91.44,medium,login\n"
            "2026-10-04T10:33:00Z,LOGIN_SUCCESS,authentication,jsmith,192.168.1.10,info,login\n"
        )
        records = parse_csv(csv_content)
        assert len(records) == 2
        assert records[0]["event_type"] == "LOGIN_FAILED"
        assert records[0]["username"] == "admin"
        assert records[1]["event_type"] == "LOGIN_SUCCESS"

    def test_csv_empty_fields(self):
        """Empty fields should become None."""
        csv_content = (
            "timestamp,event_type,source,username,source_ip,severity,action\n"
            "2026-10-04T10:32:01Z,LOGIN_FAILED,authentication,,,medium,login\n"
        )
        records = parse_csv(csv_content)
        assert len(records) == 1
        assert records[0]["username"] is None
        assert records[0]["source_ip"] is None

    def test_csv_single_row(self):
        csv_content = (
            "timestamp,event_type,source,severity\n"
            "2026-10-04T10:32:01Z,LOGIN_SUCCESS,authentication,info\n"
        )
        records = parse_csv(csv_content)
        assert len(records) == 1

    def test_csv_headers_only(self):
        csv_content = "timestamp,event_type,source,severity\n"
        records = parse_csv(csv_content)
        assert len(records) == 0


class TestJSONParsing:
    """Test JSON parsing."""

    def test_valid_json_array(self):
        json_content = '''[
            {"timestamp": "2026-10-04T10:32:01Z", "event_type": "LOGIN_FAILED", "source": "auth"},
            {"timestamp": "2026-10-04T10:33:00Z", "event_type": "LOGIN_SUCCESS", "source": "auth"}
        ]'''
        records = parse_json(json_content)
        assert len(records) == 2
        assert records[0]["event_type"] == "LOGIN_FAILED"

    def test_valid_single_object(self):
        json_content = '{"timestamp": "2026-10-04T10:32:01Z", "event_type": "LOGIN_FAILED", "source": "auth"}'
        records = parse_json(json_content)
        assert len(records) == 1

    def test_malformed_json(self):
        with pytest.raises(ValueError, match="Invalid JSON"):
            parse_json("{broken json")

    def test_json_non_object_array(self):
        with pytest.raises(ValueError, match="not an object"):
            parse_json('[1, 2, 3]')

    def test_json_non_object_value(self):
        with pytest.raises(ValueError, match="array of objects"):
            parse_json('"just a string"')


class TestNDJSONParsing:
    """Test NDJSON (newline-delimited JSON) parsing."""

    def test_valid_ndjson(self):
        ndjson_content = (
            '{"timestamp": "2026-10-04T10:32:01Z", "event_type": "LOGIN_FAILED", "source": "auth"}\n'
            '{"timestamp": "2026-10-04T10:33:00Z", "event_type": "LOGIN_SUCCESS", "source": "auth"}\n'
        )
        results = parse_ndjson(ndjson_content)
        assert len(results) == 2
        assert all(isinstance(r, dict) for _, r in results)

    def test_ndjson_with_invalid_line(self):
        ndjson_content = (
            '{"timestamp": "2026-10-04T10:32:01Z", "event_type": "LOGIN_FAILED", "source": "auth"}\n'
            'this is not json\n'
            '{"timestamp": "2026-10-04T10:34:00Z", "event_type": "LOGOUT", "source": "auth"}\n'
        )
        results = parse_ndjson(ndjson_content)
        assert len(results) == 3

        # First and third should be valid dicts
        assert isinstance(results[0][1], dict)
        assert isinstance(results[2][1], dict)

        # Second should be error string
        assert isinstance(results[1][1], str)
        assert "Invalid JSON" in results[1][1]

    def test_ndjson_empty_lines_skipped(self):
        ndjson_content = (
            '{"event_type": "LOGIN_SUCCESS", "source": "auth", "timestamp": "2026-10-04T10:00:00Z"}\n'
            '\n'
            '{"event_type": "LOGOUT", "source": "auth", "timestamp": "2026-10-04T11:00:00Z"}\n'
        )
        results = parse_ndjson(ndjson_content)
        assert len(results) == 2

    def test_ndjson_all_invalid(self):
        ndjson_content = "bad line 1\nbad line 2\n"
        results = parse_ndjson(ndjson_content)
        assert len(results) == 2
        assert all(isinstance(r, str) for _, r in results)
