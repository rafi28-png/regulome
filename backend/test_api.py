"""
ReguloMe — API Endpoint Test Script
Tests all Phase 2 Part 4 endpoints.
"""
import httpx
import json
import sys

BASE = "http://localhost:8000/api/v1"

tests = [
    ("GET", "/health", "Health Check"),
    ("GET", "/", "Root (no prefix)"),
    ("GET", "/personas", "List Personas"),
    ("GET", "/personas/inflammatory", "Get Persona: Inflammatory"),
    ("GET", "/personas/longevity", "Get Persona: Longevity"),
    ("GET", "/personas/nonexistent", "Get Persona: 404"),
    ("GET", "/dashboard/inflammatory", "Dashboard: Inflammatory"),
    ("GET", "/dashboard/longevity", "Dashboard: Longevity"),
    ("GET", "/variants/inflammatory", "Variants: Inflammatory"),
    ("GET", "/variants/inflammatory?element_type=enhancer", "Variants: Filtered by Enhancer"),
    ("GET", "/variants/inflammatory?confidence_min=0.85", "Variants: Filtered by Confidence"),
    ("GET", "/variants/inflammatory?search=NF", "Variants: Search NF"),
    ("GET", "/variants/inflammatory/var_001", "Variant Detail: var_001"),
    ("GET", "/variants/inflammatory/nonexistent", "Variant Detail: 404"),
    ("GET", "/expression/inflammatory", "Expression: Inflammatory"),
    ("GET", "/expression/longevity", "Expression: Longevity"),
    ("GET", "/network/inflammatory", "Network: Inflammatory"),
    ("GET", "/network/athletic", "Network: Athletic (default)"),
    ("GET", "/diseases/inflammatory", "Diseases: Inflammatory"),
    ("GET", "/diseases/aging", "Diseases: Aging"),
    ("GET", "/epigenetic/inflammatory", "Epigenetic: Inflammatory"),
    ("GET", "/epigenetic/athletic", "Epigenetic: Athletic"),
    ("GET", "/optimization/inflammatory", "Optimization: Inflammatory"),
    ("GET", "/optimization/athletic", "Optimization: Athletic"),
    ("GET", "/simulator/inflammatory", "Simulator: Inflammatory"),
    ("GET", "/simulator/longevity", "Simulator: Longevity"),
    ("GET", "/reports/inflammatory", "Reports: List Inflammatory"),
    ("GET", "/reports/inflammatory/summary", "Report: Summary"),
    ("GET", "/reports/inflammatory/research", "Report: Research"),
]

def run_tests():
    passed = 0
    failed = 0
    errors = []

    client = httpx.Client(timeout=10.0)

    for method, path, label in tests:
        url = BASE + path if not path.startswith("/") or path.startswith("/personas") or path.startswith("/dashboard") or path.startswith("/variants") or path.startswith("/expression") or path.startswith("/network") or path.startswith("/diseases") or path.startswith("/epigenetic") or path.startswith("/optimization") or path.startswith("/simulator") or path.startswith("/reports") or path.startswith("/health") or path.startswith("/auth") else f"http://localhost:8000{path}"

        try:
            if method == "GET":
                r = client.get(url)
            elif method == "POST":
                r = client.post(url, json={})

            # Expected 404 for "nonexistent" tests
            if "404" in label:
                if r.status_code == 404:
                    status = "✅ PASS (expected 404)"
                    passed += 1
                else:
                    status = f"❌ FAIL (expected 404, got {r.status_code})"
                    failed += 1
                    errors.append((label, r.status_code, r.text[:200]))
            elif r.status_code == 200:
                data = r.json()
                status = f"✅ PASS"
                # Add summary info
                if isinstance(data, list):
                    status += f" ({len(data)} items)"
                elif isinstance(data, dict):
                    keys = list(data.keys())[:5]
                    status += f" (keys: {keys})"
                passed += 1
            else:
                status = f"❌ FAIL ({r.status_code})"
                failed += 1
                errors.append((label, r.status_code, r.text[:200]))
        except Exception as e:
            status = f"❌ ERROR: {e}"
            failed += 1
            errors.append((label, "ERROR", str(e)))

        print(f"  {status:<60} {label}")

    print(f"\n{'='*70}")
    print(f"  Results: {passed} passed, {failed} failed, {passed+failed} total")
    print(f"{'='*70}")

    if errors:
        print(f"\n  Failures:")
        for label, code, detail in errors:
            print(f"    • {label}: {code} - {detail[:100]}")

    return failed == 0


if __name__ == "__main__":
    print(f"\n{'='*70}")
    print(f"  🧬 ReguloMe API — Phase 2 Part 4 Endpoint Tests")
    print(f"{'='*70}\n")
    success = run_tests()
    sys.exit(0 if success else 1)
