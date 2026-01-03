"""
Spatialpack CLI entry point.

Usage:
    spatialpack validate ./my-pack/
    spatialpack validate ./my-pack/ --strict --output report.json
"""

import click
from rich.console import Console

from spatialpack import __version__
from spatialpack.commands.validate import validate

console = Console()


@click.group()
@click.version_option(version=__version__, prog_name="spatialpack")
def cli():
    """Spatialpack CLI - Validate and manage Spatial Packs."""
    pass


# Register commands
cli.add_command(validate)


if __name__ == "__main__":
    cli()
