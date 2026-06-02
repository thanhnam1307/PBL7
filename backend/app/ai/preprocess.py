from pathlib import Path


def preprocess_image(image_path: Path):
    image = read_image_array(image_path)
    return preprocess_array(image)


def preprocess_pil_image(image, target_size: int = 512):
    image_array = pil_to_array(image)
    return preprocess_array(image_array, target_size=target_size)


def read_image_array(image_path: Path, max_channels: int = 8):
    try:
        import numpy as np
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("NumPy and Pillow are required for AI preprocessing") from exc

    image_path = Path(image_path)
    if image_path.suffix.lower() in {".tif", ".tiff"}:
        try:
            import rasterio
        except ImportError as exc:
            raise RuntimeError("rasterio is required for GeoTIFF AI preprocessing") from exc

        with rasterio.open(image_path) as dataset:
            array = dataset.read().astype(np.float32)
    else:
        array = pil_to_array(Image.open(image_path).convert("RGB"))

    array = normalize_image_array(array)
    if array.shape[0] >= max_channels:
        return array[:max_channels].astype(np.float32)

    pad = np.zeros((max_channels - array.shape[0], array.shape[1], array.shape[2]), dtype=np.float32)
    return np.concatenate([array, pad], axis=0).astype(np.float32)


def pil_to_array(image):
    import numpy as np

    return np.asarray(image.convert("RGB"), dtype=np.float32).transpose(2, 0, 1)


def normalize_image_array(array):
    import numpy as np

    array = np.asarray(array, dtype=np.float32)
    array = np.nan_to_num(array, nan=0.0, posinf=0.0, neginf=0.0)
    if array.size == 0:
        return array

    sentinel_array = _normalize_sentinel2_model_array(array)
    if sentinel_array is not None:
        return sentinel_array

    max_value = float(np.max(array))
    if max_value <= 1.5:
        return np.clip(array, 0.0, 1.0)
    if max_value <= 255.0:
        return np.clip(array / 255.0, 0.0, 1.0)
    if max_value <= 10000.0:
        return np.clip(array / 10000.0, 0.0, 1.0)
    if max_value <= 65535.0:
        return np.clip(array / 65535.0, 0.0, 1.0)

    p2, p98 = np.percentile(array, [2, 98])
    if p98 > p2:
        array = (array - p2) / (p98 - p2)
    return np.clip(array, 0.0, 1.0)


def _normalize_sentinel2_model_array(array):
    import numpy as np

    if array.ndim != 3 or array.shape[0] < 8:
        return None

    spectral = array[:5]
    indices = array[5:8]
    spectral_max = float(np.max(spectral)) if spectral.size else 0.0
    index_min = float(np.min(indices)) if indices.size else 0.0
    index_max = float(np.max(indices)) if indices.size else 0.0

    is_raw_sentinel_reflectance = spectral_max > 1.5
    has_normalized_indices = index_min >= -1.5 and index_max <= 1.5
    if not (is_raw_sentinel_reflectance and has_normalized_indices):
        return None

    normalized = array.copy()
    if spectral_max <= 10000.0:
        normalized[:5] = np.clip(spectral / 10000.0, 0.0, 1.0)
    elif spectral_max <= 65535.0:
        normalized[:5] = np.clip(spectral / 65535.0, 0.0, 1.0)
    else:
        p2, p98 = np.percentile(spectral, [2, 98])
        if p98 > p2:
            normalized[:5] = (spectral - p2) / (p98 - p2)
        normalized[:5] = np.clip(normalized[:5], 0.0, 1.0)

    # Notebook training clips normalized arrays into 0..1, so negative
    # index values are clipped instead of shifted from -1..1.
    normalized[5:8] = np.clip(indices, 0.0, 1.0)
    if array.shape[0] > 8:
        normalized[8:] = np.clip(normalized[8:], 0.0, 1.0)
    return normalized.astype(np.float32)


def preprocess_array(image_array, target_size: int = 512):
    try:
        import torch
        import torch.nn.functional as F
    except ImportError as exc:
        raise RuntimeError("PyTorch is required for AI preprocessing") from exc

    tensor = torch.from_numpy(image_array).float().unsqueeze(0)
    if tensor.shape[-2:] != (target_size, target_size):
        tensor = F.interpolate(tensor, size=(target_size, target_size), mode="bilinear", align_corners=False)
    return tensor
