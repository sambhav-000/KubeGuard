"""
Unit and integration tests for KubeGuard Prometheus metrics endpoints.
"""

import unittest
import requests
from main import format_cpu, format_bytes, query_prometheus, query_range_prometheus

BACKEND_BASE_URL = "http://127.0.0.1:9000"


class TestMetricsFormatting(unittest.TestCase):
    def test_format_cpu_zero(self):
        self.assertEqual(format_cpu(0.0), "0m")

    def test_format_cpu_sub_millicore(self):
        self.assertEqual(format_cpu(0.0004), "< 1m")

    def test_format_cpu_normal(self):
        self.assertEqual(format_cpu(0.025), "25.0m")
        self.assertEqual(format_cpu(1.5), "1500.0m")

    def test_format_bytes_zero(self):
        self.assertEqual(format_bytes(0), "0 MiB")

    def test_format_bytes_kib(self):
        self.assertEqual(format_bytes(512 * 1024), "512.0 KiB")

    def test_format_bytes_mib(self):
        self.assertEqual(format_bytes(25 * 1024 * 1024), "25.0 MiB")

    def test_format_bytes_gib(self):
        self.assertEqual(format_bytes(4 * 1024 * 1024 * 1024), "4.00 GiB")


class TestMetricsEndpoints(unittest.TestCase):
    def test_metrics_summary_endpoint(self):
        resp = requests.get(f"{BACKEND_BASE_URL}/api/metrics/summary", timeout=5)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("status", data)
        self.assertIn(data["status"], ("connected", "unavailable"))
        if data["status"] == "connected":
            self.assertIsNotNone(data["cpu_usage_percent"])
            self.assertIsNotNone(data["memory_usage_percent"])
            self.assertGreater(data["cpu_total_cores"], 0)
            self.assertGreater(data["memory_total_bytes"], 0)

    def test_metrics_range_endpoint(self):
        for r in ("1h", "6h", "24h", "7d"):
            resp = requests.get(f"{BACKEND_BASE_URL}/api/metrics/range?range={r}", timeout=6)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIn("status", data)
            self.assertEqual(data["range"], r)
            self.assertIsInstance(data["points"], list)

    def test_metrics_workloads_endpoint(self):
        resp = requests.get(f"{BACKEND_BASE_URL}/api/metrics/workloads", timeout=5)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("status", data)
        self.assertIn(data["status"], ("connected", "unavailable"))
        if data["status"] == "connected":
            self.assertIsInstance(data["deployments"], list)
            self.assertIsInstance(data["pods"], list)
            # Find demo deployment
            dep_names = [d["name"] for d in data["deployments"]]
            self.assertIn("kubeguard-demo", dep_names)

    def test_query_prometheus_graceful_failure(self):
        # Query invalid port to ensure graceful error handling
        import main
        orig_url = main.PROMETHEUS_URL
        try:
            main.PROMETHEUS_URL = "http://127.0.0.1:59999"  # Non-existent endpoint
            result = main.query_prometheus("up", timeout=0.5)
            self.assertIsNone(result)
            range_res = main.query_range_prometheus("up", 0, 100, 10, timeout=0.5)
            self.assertIsNone(range_res)
        finally:
            main.PROMETHEUS_URL = orig_url


if __name__ == "__main__":
    unittest.main()
