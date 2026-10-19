"""Install the CTM Assessment package for this course.

The course uses one tested package, CTM Assessment, which bundles ai-feedback,
math-exercise, py-exercise, pyodide-interaktiv and JSXGraph at commits tested
together. quarto-extensions.yml names the ctm-assessment repository and ref (a
branch or a commit). This script fetches ctm-assessment at that ref into
.private-extensions/ctm-assessment and runs its installer
(scripts/install-project.py). The installer builds the package, replaces only
the extensions the package owns in _extensions/ and checks every installed
file.

    python scripts/setup.py [--review-refs REFS]

--review-refs passes component commits (full SHAs) for a coordinated review
build, as JSON ('{"math-exercise": "<sha>"}') or as NAME=SHA[,NAME=SHA]; use the
second form in Windows PowerShell 5.1, which strips the JSON's inner quotes.
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

import yaml


CONFIG_FILE = "quarto-extensions.yml"


def run(*args: str, cwd: Path | None = None) -> None:
    print(f"> {' '.join(args)}")
    subprocess.run(args, cwd=cwd, check=True)


def require_command(name: str) -> None:
    if shutil.which(name) is None:
        sys.exit(
            f"\nERROR: '{name}' was not found on PATH.\n"
            f"Install {name} and run this setup script again.\n"
        )


def load_package(config_path: Path) -> dict[str, str]:
    if not config_path.exists():
        sys.exit(f"\nERROR: configuration file not found:\n  {config_path}\n")
    with config_path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    plugins = data.get("plugins")
    if (
        not isinstance(plugins, list)
        or len(plugins) != 1
        or not isinstance(plugins[0], dict)
        or plugins[0].get("name") != "ctm-assessment"
    ):
        sys.exit(
            f"\nERROR: '{CONFIG_FILE}' must list exactly one plugin, ctm-assessment.\n"
            "The components (math-exercise, py-exercise, pyodide-interaktiv, JSXGraph,\n"
            "ai-feedback) come from its tested package, not as single extensions.\n"
        )
    package = plugins[0]
    if not package.get("repo") or not package.get("ref"):
        sys.exit(f"\nERROR: the ctm-assessment entry in '{CONFIG_FILE}' needs 'repo' and 'ref'.\n")
    return {"repo": str(package["repo"]), "ref": str(package["ref"])}


def fetch(package: dict[str, str], target: Path) -> None:
    # Fetch accepts branch names and full commit IDs; the checkout stays detached.
    if not (target / ".git").exists():
        target.mkdir(parents=True, exist_ok=True)
        run("git", "init", "-q", str(target))
    run("git", "-C", str(target), "fetch", "--depth", "1", package["repo"], package["ref"])
    run("git", "-C", str(target), "checkout", "-q", "--detach", "--force", "FETCH_HEAD")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--review-refs", default="{}", help="component commits for a review build: JSON or NAME=SHA[,NAME=SHA]")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    config_path = project_root / CONFIG_FILE
    checkout = project_root / ".private-extensions" / "ctm-assessment"

    print("Checking required tools...")
    require_command("git")
    require_command("quarto")

    package = load_package(config_path)
    print(f"\nCTM Assessment: {package['repo']} at {package['ref']}")
    try:
        fetch(package, checkout)
    except subprocess.CalledProcessError:
        sys.exit(f"\nERROR: could not fetch ctm-assessment at {package['ref']} from {package['repo']}.\n")

    try:
        run(
            sys.executable,
            str(checkout / "scripts" / "install-project.py"),
            "--project", str(project_root),
            "--review-refs", args.review_refs,
        )
    except subprocess.CalledProcessError:
        sys.exit(1)  # the installer has printed the reason

    print("\nInstalled Quarto extensions:")
    run("quarto", "list", "extensions", cwd=project_root)
    print("\nSetup complete. You can now run:\n  quarto preview")


if __name__ == "__main__":
    main()
