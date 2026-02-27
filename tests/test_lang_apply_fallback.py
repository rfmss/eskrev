import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_lang_apply_fallback_script_passes():
    result = subprocess.run(
        [sys.executable, "tests/check_lang_apply_fallback.py"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, (
        "deprecated tripwire check_lang_apply_fallback.py failed\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )
