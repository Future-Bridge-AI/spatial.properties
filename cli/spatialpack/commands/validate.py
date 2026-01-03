"""
Validate command for spatialpack CLI.

Validates a Spatial Pack against the JSON Schema and checks for:
- Manifest structure and required fields
- Layer file existence
- Integrity hash verification (if present)
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

import click
from rich.console import Console
from rich.table import Table

from spatialpack.validators.manifest import ManifestValidator

console = Console()


@click.command()
@click.argument("pack_path", type=click.Path(exists=True, path_type=Path))
@click.option(
    "--strict",
    is_flag=True,
    default=False,
    help="Treat warnings as errors",
)
@click.option(
    "--output",
    "-o",
    type=click.Path(path_type=Path),
    help="Output conformance report to JSON file",
)
@click.option(
    "--quiet",
    "-q",
    is_flag=True,
    default=False,
    help="Suppress output except errors",
)
def validate(
    pack_path: Path,
    strict: bool,
    output: Optional[Path],
    quiet: bool,
) -> None:
    """Validate a Spatial Pack.

    PACK_PATH is the path to the pack directory containing spatialpack.json.
    """
    run_id = str(uuid4())[:8]
    start_time = datetime.utcnow()

    # Initialize validator
    validator = ManifestValidator(pack_path)

    if not quiet:
        console.print(f"[bold]Validating pack:[/bold] {pack_path}")
        console.print(f"[dim]Run ID: {run_id}[/dim]\n")

    # Run validation
    result = validator.validate()

    # Calculate totals
    error_count = len(result["errors"])
    warning_count = len(result["warnings"])
    layer_count = result.get("layers_validated", 0)

    # Determine status
    if error_count > 0:
        status = "fail"
    elif warning_count > 0 and strict:
        status = "fail"
    elif warning_count > 0:
        status = "warn"
    else:
        status = "pass"

    # Build conformance report
    report = {
        "run_id": run_id,
        "validator": f"spatialpack-cli@0.1.0",
        "pack_path": str(pack_path.absolute()),
        "status": status,
        "checked_at": datetime.utcnow().isoformat() + "Z",
        "duration_ms": int((datetime.utcnow() - start_time).total_seconds() * 1000),
        "summary": {
            "errors": error_count,
            "warnings": warning_count,
            "layers_validated": layer_count,
        },
        "errors": result["errors"],
        "warnings": result["warnings"],
    }

    # Output results
    if not quiet:
        _print_results(report, strict)

    # Write report if requested
    if output:
        output.write_text(json.dumps(report, indent=2))
        if not quiet:
            console.print(f"\n[dim]Report written to: {output}[/dim]")

    # Exit with appropriate code
    if status == "fail":
        sys.exit(1)
    elif status == "warn" and strict:
        sys.exit(1)
    else:
        sys.exit(0)


def _print_results(report: dict, strict: bool) -> None:
    """Print validation results to console."""
    status = report["status"]
    errors = report["errors"]
    warnings = report["warnings"]

    # Status banner
    if status == "pass":
        console.print("[bold green]PASS[/bold green] All checks passed\n")
    elif status == "warn":
        console.print("[bold yellow]WARN[/bold yellow] Validation passed with warnings\n")
    else:
        console.print("[bold red]FAIL[/bold red] Validation failed\n")

    # Errors table
    if errors:
        table = Table(title="Errors", show_header=True, header_style="bold red")
        table.add_column("Rule", style="red")
        table.add_column("Message")
        table.add_column("Path", style="dim")

        for error in errors:
            table.add_row(
                error.get("rule", "UNKNOWN"),
                error.get("message", ""),
                error.get("path", ""),
            )
        console.print(table)
        console.print()

    # Warnings table
    if warnings:
        table = Table(title="Warnings", show_header=True, header_style="bold yellow")
        table.add_column("Rule", style="yellow")
        table.add_column("Message")
        table.add_column("Path", style="dim")

        for warning in warnings:
            table.add_row(
                warning.get("rule", "UNKNOWN"),
                warning.get("message", ""),
                warning.get("path", ""),
            )
        console.print(table)
        console.print()

    # Summary
    summary = report["summary"]
    console.print(
        f"[bold]Summary:[/bold] "
        f"{summary['errors']} errors, "
        f"{summary['warnings']} warnings, "
        f"{summary['layers_validated']} layers validated"
    )
