from pathlib import Path
from uuid import uuid4

AI_LAND_CLASSES = [
    {"id": "water", "label": "Water", "color": "#419bdf"},
    {"id": "vegetation", "label": "Vegetation", "color": "#397d49"},
    {"id": "agriculture", "label": "Agriculture", "color": "#e49635"},
    {"id": "built_up", "label": "Built up", "color": "#c4281b"},
    {"id": "bare", "label": "Bare", "color": "#a59b8f"},
]


def save_mask_and_stats(
    mask,
    output_dir: Path,
    bbox: dict | None = None,
    pixel_area_m2: float = 100.0,
) -> tuple[Path, Path, Path, list[dict], float]:
    try:
        import numpy as np
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("Pillow and NumPy are required for AI postprocessing") from exc

    output_dir.mkdir(parents=True, exist_ok=True)
    mask_array = np.asarray(mask, dtype=np.uint8)
    rgb = np.zeros((*mask_array.shape, 4), dtype=np.uint8)

    total_pixels = int(mask_array.size)
    stats = []
    for index, land_class in enumerate(AI_LAND_CLASSES):
        color = _hex_to_rgb(land_class["color"])
        class_mask = mask_array == index
        pixels = int(class_mask.sum())
        rgb[class_mask] = [color[0], color[1], color[2], 170]
        area_m2 = pixels * pixel_area_m2
        stats.append({
            **land_class,
            "pixels": pixels,
            "area_m2": area_m2,
            "percent": round((pixels / total_pixels) * 100, 2) if total_pixels else 0,
        })

    stem = uuid4().hex
    mask_path = output_dir / f"{stem}-classification.png"
    geotiff_path = output_dir / f"{stem}-classification.tif"
    report_path = output_dir / f"{stem}-report.json"
    Image.fromarray(rgb, mode="RGBA").save(mask_path)
    _write_geotiff(geotiff_path, mask_array, bbox)
    return mask_path, geotiff_path, report_path, stats, float(total_pixels * pixel_area_m2)


def _write_geotiff(path: Path, mask_array, bbox: dict | None) -> None:
    try:
        import rasterio
        from rasterio.transform import from_bounds
    except ImportError:
        from PIL import Image

        Image.fromarray(mask_array).save(path)
        return

    height, width = mask_array.shape
    if bbox:
        transform = from_bounds(
            bbox["west"],
            bbox["south"],
            bbox["east"],
            bbox["north"],
            width,
            height,
        )
        crs = "EPSG:4326"
    else:
        transform = rasterio.transform.from_origin(0, 0, 1, 1)
        crs = None

    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=1,
        dtype=mask_array.dtype,
        crs=crs,
        transform=transform,
    ) as dataset:
        dataset.write(mask_array, 1)


def _hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.removeprefix("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)
