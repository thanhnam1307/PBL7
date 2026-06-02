from pathlib import Path

from app.ai.model_loader import load_model
from app.ai.postprocess import save_mask_and_stats
from app.ai.preprocess import preprocess_array, read_image_array

MODEL_INPUT_SIZE = 512


def predict_file(
    image_path: Path,
    output_dir: Path,
    bbox: dict | None = None,
    pixel_area_m2: float = 100.0,
) -> tuple[Path, Path, Path, list[dict], float, dict]:
    model, device = load_model()

    try:
        import numpy as np
        import torch
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("Pillow, NumPy, and PyTorch are required for AI prediction") from exc

    input_size = int(getattr(model, "input_size", MODEL_INPUT_SIZE))
    in_channels = int(getattr(model, "in_channels", 3))
    image = read_image_array(image_path, max_channels=in_channels)
    _, height, width = image.shape
    pixel_size_m = pixel_area_m2 ** 0.5
    tile_size_px = min(input_size, max(width, height))
    full_mask = np.zeros((height, width), dtype=np.uint8)
    tile_count = 0

    with torch.no_grad():
        for top in range(0, height, tile_size_px):
            for left in range(0, width, tile_size_px):
                right = min(left + tile_size_px, width)
                bottom = min(top + tile_size_px, height)
                tile = image[:, top:bottom, left:right]
                tensor = preprocess_array(tile, target_size=input_size).to(device)
                logits = model(tensor)
                mask = torch.argmax(logits, dim=1).squeeze(0).detach().cpu().numpy().astype("uint8")
                mask_image = Image.fromarray(mask).resize((right - left, bottom - top), resample=Image.NEAREST)
                full_mask[top:bottom, left:right] = np.asarray(mask_image, dtype=np.uint8)
                tile_count += 1

    output = save_mask_and_stats(full_mask, output_dir, bbox=bbox, pixel_area_m2=pixel_area_m2)
    tiling_metadata = {
        "tile_size_m": round(tile_size_px * pixel_size_m, 2),
        "tile_size_px": tile_size_px,
        "tile_count": tile_count,
        "model_input_size": input_size,
        "model_in_channels": in_channels,
        "mosaic_width_px": width,
        "mosaic_height_px": height,
        "strategy": "native-pixel-tiles",
    }
    return (*output, tiling_metadata)
