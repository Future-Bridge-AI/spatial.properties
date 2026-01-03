"""
Manifest validator for Spatial Packs.

Validates spatialpack.json against the JSON Schema and performs
additional structural and content checks.

Validation Rules:
- MANIFEST-001: spatialpack.json exists and is valid JSON
- MANIFEST-002: Manifest validates against JSON Schema
- MANIFEST-003: pack_id follows naming convention
- MANIFEST-004: bbox is valid (minX < maxX, minY < maxY)
- MANIFEST-005: created_at is valid ISO 8601
- LAYER-001: Each layer in manifest has corresponding file
- LAYER-002: Layer files are accessible
- INTEGRITY-001: If integrity.json exists, hashes are present
- STRUCTURE-001: Required folders exist
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

import jsonschema


class ManifestValidator:
    """Validates a Spatial Pack manifest and structure."""

    # Validation rules reference
    RULES = {
        "MANIFEST-001": "spatialpack.json exists and is valid JSON",
        "MANIFEST-002": "Manifest validates against JSON Schema",
        "MANIFEST-003": "pack_id follows naming convention",
        "MANIFEST-004": "bbox is valid",
        "MANIFEST-005": "created_at is valid ISO 8601",
        "LAYER-001": "Each layer has corresponding file reference",
        "LAYER-002": "Layer files are accessible",
        "INTEGRITY-001": "Integrity hashes are present if integrity.json exists",
        "STRUCTURE-001": "Pack structure is valid",
    }

    # pack_id pattern: {authority}:{geography}:{theme}:v{version}
    PACK_ID_PATTERN = re.compile(r"^[a-z0-9.-]+:[a-z]{2,3}:[a-z0-9-]+:v[0-9]+$")

    def __init__(self, pack_path: Path):
        """Initialize validator with pack path.

        Args:
            pack_path: Path to the pack directory
        """
        self.pack_path = Path(pack_path)
        self.manifest_path = self.pack_path / "spatialpack.json"
        self.manifest: dict = {}
        self.errors: list[dict] = []
        self.warnings: list[dict] = []
        self.layers_validated = 0

        # Load schema from package or default location
        self._schema = self._load_schema()

    def _load_schema(self) -> dict:
        """Load the JSON Schema for validation."""
        # Try to load from schemas directory relative to repo root
        schema_locations = [
            self.pack_path.parent / "schemas" / "spatialpack.schema.json",
            self.pack_path.parent.parent / "schemas" / "spatialpack.schema.json",
            Path(__file__).parent.parent.parent.parent / "schemas" / "spatialpack.schema.json",
        ]

        for schema_path in schema_locations:
            if schema_path.exists():
                return json.loads(schema_path.read_text(encoding="utf-8"))

        # Return minimal inline schema if none found
        return {
            "type": "object",
            "required": ["pack_id", "version", "created_at", "geography", "theme", "bbox", "crs", "layers"],
        }

    def _add_error(self, rule: str, message: str, path: str = "") -> None:
        """Add an error to the results."""
        self.errors.append({"rule": rule, "message": message, "path": path})

    def _add_warning(self, rule: str, message: str, path: str = "") -> None:
        """Add a warning to the results."""
        self.warnings.append({"rule": rule, "message": message, "path": path})

    def validate(self) -> dict:
        """Run all validation checks.

        Returns:
            dict with errors, warnings, and layers_validated count
        """
        # Reset state
        self.errors = []
        self.warnings = []
        self.layers_validated = 0

        # Run validations in order
        if not self._validate_manifest_exists():
            return self._get_result()

        if not self._validate_manifest_json():
            return self._get_result()

        self._validate_manifest_schema()
        self._validate_pack_id()
        self._validate_bbox()
        self._validate_created_at()
        self._validate_layers()
        self._validate_structure()
        self._validate_integrity()

        return self._get_result()

    def _get_result(self) -> dict:
        """Get validation result dict."""
        return {
            "errors": self.errors,
            "warnings": self.warnings,
            "layers_validated": self.layers_validated,
        }

    def _validate_manifest_exists(self) -> bool:
        """Check that spatialpack.json exists."""
        if not self.manifest_path.exists():
            self._add_error(
                "MANIFEST-001",
                f"spatialpack.json not found at {self.manifest_path}",
                str(self.manifest_path),
            )
            return False
        return True

    def _validate_manifest_json(self) -> bool:
        """Check that spatialpack.json is valid JSON."""
        try:
            self.manifest = json.loads(
                self.manifest_path.read_text(encoding="utf-8")
            )
            return True
        except json.JSONDecodeError as e:
            self._add_error(
                "MANIFEST-001",
                f"Invalid JSON: {e.msg} at line {e.lineno}",
                str(self.manifest_path),
            )
            return False

    def _validate_manifest_schema(self) -> None:
        """Validate manifest against JSON Schema."""
        try:
            jsonschema.validate(self.manifest, self._schema)
        except jsonschema.ValidationError as e:
            path = ".".join(str(p) for p in e.absolute_path) if e.absolute_path else "(root)"
            self._add_error(
                "MANIFEST-002",
                f"Schema validation failed: {e.message}",
                path,
            )
        except jsonschema.SchemaError as e:
            self._add_warning(
                "MANIFEST-002",
                f"Schema error (validation skipped): {e.message}",
            )

    def _validate_pack_id(self) -> None:
        """Validate pack_id follows naming convention."""
        pack_id = self.manifest.get("pack_id", "")
        if not self.PACK_ID_PATTERN.match(pack_id):
            self._add_warning(
                "MANIFEST-003",
                f"pack_id '{pack_id}' does not follow convention: {{authority}}:{{geography}}:{{theme}}:v{{version}}",
                "pack_id",
            )

    def _validate_bbox(self) -> None:
        """Validate bbox is valid."""
        bbox = self.manifest.get("bbox", [])
        if len(bbox) != 4:
            self._add_error(
                "MANIFEST-004",
                f"bbox must have exactly 4 values, got {len(bbox)}",
                "bbox",
            )
            return

        min_x, min_y, max_x, max_y = bbox
        if min_x >= max_x:
            self._add_error(
                "MANIFEST-004",
                f"bbox minX ({min_x}) must be less than maxX ({max_x})",
                "bbox",
            )
        if min_y >= max_y:
            self._add_error(
                "MANIFEST-004",
                f"bbox minY ({min_y}) must be less than maxY ({max_y})",
                "bbox",
            )

    def _validate_created_at(self) -> None:
        """Validate created_at is valid ISO 8601."""
        created_at = self.manifest.get("created_at", "")
        try:
            # Try parsing ISO 8601 format
            if created_at.endswith("Z"):
                datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            else:
                datetime.fromisoformat(created_at)
        except ValueError:
            self._add_error(
                "MANIFEST-005",
                f"created_at '{created_at}' is not valid ISO 8601",
                "created_at",
            )

    def _validate_layers(self) -> None:
        """Validate layer definitions and file references."""
        layers = self.manifest.get("layers", [])
        if not layers:
            self._add_error("LAYER-001", "No layers defined in manifest", "layers")
            return

        for i, layer in enumerate(layers):
            layer_id = layer.get("id", f"layer[{i}]")
            self._validate_layer(layer, layer_id, i)
            self.layers_validated += 1

    def _validate_layer(self, layer: dict, layer_id: str, index: int) -> None:
        """Validate a single layer definition."""
        path_prefix = f"layers[{index}]"

        # Check required fields
        if not layer.get("id"):
            self._add_error("LAYER-001", "Layer missing 'id' field", path_prefix)
        if not layer.get("type"):
            self._add_error("LAYER-001", "Layer missing 'type' field", f"{path_prefix}.type")
        if not layer.get("title"):
            self._add_warning("LAYER-001", "Layer missing 'title' field", f"{path_prefix}.title")

        # Check file references exist (for local files)
        file_refs = ["parquet", "pmtiles", "cog", "copc"]
        for ref in file_refs:
            file_path = layer.get(ref)
            if file_path and file_path.startswith("./"):
                full_path = self.pack_path / file_path[2:]
                if not full_path.exists() and not any(full_path.parent.glob(full_path.name)):
                    self._add_warning(
                        "LAYER-002",
                        f"Layer file not found: {file_path}",
                        f"{path_prefix}.{ref}",
                    )

    def _validate_structure(self) -> None:
        """Validate pack folder structure."""
        # Check for common expected folders (warning only, not required)
        expected_folders = ["layers", "metadata"]
        for folder in expected_folders:
            folder_path = self.pack_path / folder
            if not folder_path.exists():
                # Only warn if there are file references that suggest the folder should exist
                layers = self.manifest.get("layers", [])
                has_local_refs = any(
                    layer.get("parquet", "").startswith("./layers/") or
                    layer.get("pmtiles", "").startswith("./layers/")
                    for layer in layers
                )
                if has_local_refs and folder == "layers":
                    self._add_warning(
                        "STRUCTURE-001",
                        f"Expected folder '{folder}' not found",
                        str(folder_path),
                    )

    def _validate_integrity(self) -> None:
        """Validate integrity hashes if present."""
        integrity = self.manifest.get("integrity", {})
        if not integrity:
            self._add_warning(
                "INTEGRITY-001",
                "No integrity block found in manifest",
                "integrity",
            )
            return

        asset_hashes = integrity.get("asset_hashes", {})
        if not asset_hashes:
            self._add_warning(
                "INTEGRITY-001",
                "No asset_hashes defined in integrity block",
                "integrity.asset_hashes",
            )

        # Check for placeholder hashes
        for asset, hash_value in asset_hashes.items():
            if "PLACEHOLDER" in hash_value.upper():
                self._add_warning(
                    "INTEGRITY-001",
                    f"Placeholder hash found for {asset}",
                    f"integrity.asset_hashes.{asset}",
                )
