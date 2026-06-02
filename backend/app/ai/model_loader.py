from functools import lru_cache

from app.core.config import get_settings


class ModelLoadError(RuntimeError):
    pass


def _checkpoint_value(checkpoint: dict, key: str, default=None):
    config = checkpoint.get("config") if isinstance(checkpoint, dict) else None
    if isinstance(config, dict) and key in config:
        return config[key]
    return checkpoint.get(key, default) if isinstance(checkpoint, dict) else default


def _infer_model_name(checkpoint: dict, state_dict: dict) -> str:
    model_name = (
        checkpoint.get("model_name")
        or checkpoint.get("model_type")
        or checkpoint.get("architecture")
    )
    if model_name:
        return str(model_name).lower()
    if any(key.startswith("conv0_0.") for key in state_dict):
        return "dynamicworld_unetpp"
    return "deeplabv3plus_resnet34"


def _build_model(model_name: str, classes: int):
    if model_name in {"dynamicworld_unetpp", "unetpp", "unet++", "unetplusplus"}:
        return _build_dynamicworld_unetpp(
            in_channels=getattr(_build_model, "in_channels", 8),
            num_classes=classes,
            base=getattr(_build_model, "base_channels", 32),
        )

    import segmentation_models_pytorch as smp

    if model_name == "unetpp_resnet34":
        return smp.UnetPlusPlus(
            encoder_name="resnet34",
            encoder_weights=None,
            in_channels=3,
            classes=classes,
            activation=None,
        )

    if model_name == "deeplabv3plus_resnet34":
        return smp.DeepLabV3Plus(
            encoder_name="resnet34",
            encoder_weights=None,
            in_channels=3,
            classes=classes,
            activation=None,
        )

    raise ModelLoadError(
        f"Unsupported model architecture '{model_name}'. "
        "Supported architectures: dynamicworld_unetpp, unetpp_resnet34, deeplabv3plus_resnet34."
    )


def _extract_checkpoint_state(checkpoint):
    if not isinstance(checkpoint, dict):
        return checkpoint, "deeplabv3plus_resnet34", 7, 3, 512, 32

    state_dict = checkpoint.get("model_state_dict") or checkpoint.get("state_dict")
    if state_dict is None:
        state_dict = checkpoint

    model_name = _infer_model_name(checkpoint, state_dict)
    classes = checkpoint.get("classes") or checkpoint.get("class_names")
    class_count = len(classes) if isinstance(classes, list) else int(_checkpoint_value(checkpoint, "num_classes", 7))
    in_channels = int(_checkpoint_value(checkpoint, "in_channels", 8 if model_name == "dynamicworld_unetpp" else 3))
    input_size = int(_checkpoint_value(checkpoint, "img_size", _checkpoint_value(checkpoint, "image_size", 512)))
    base_channels = int(_checkpoint_value(checkpoint, "base_channels", 32))

    return state_dict, model_name, class_count, in_channels, input_size, base_channels


def _build_dynamicworld_unetpp(in_channels: int, num_classes: int, base: int):
    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    class ConvBlock(nn.Module):
        def __init__(self, in_ch: int, out_ch: int):
            super().__init__()
            self.block = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
            )

        def forward(self, x):
            return self.block(x)

    class UNetPlusPlusSmall(nn.Module):
        def __init__(self):
            super().__init__()
            nb = [base, base * 2, base * 4, base * 8, base * 16]
            self.pool = nn.MaxPool2d(2)

            self.conv0_0 = ConvBlock(in_channels, nb[0])
            self.conv1_0 = ConvBlock(nb[0], nb[1])
            self.conv2_0 = ConvBlock(nb[1], nb[2])
            self.conv3_0 = ConvBlock(nb[2], nb[3])
            self.conv4_0 = ConvBlock(nb[3], nb[4])

            self.conv0_1 = ConvBlock(nb[0] + nb[1], nb[0])
            self.conv1_1 = ConvBlock(nb[1] + nb[2], nb[1])
            self.conv2_1 = ConvBlock(nb[2] + nb[3], nb[2])
            self.conv3_1 = ConvBlock(nb[3] + nb[4], nb[3])

            self.conv0_2 = ConvBlock(nb[0] * 2 + nb[1], nb[0])
            self.conv1_2 = ConvBlock(nb[1] * 2 + nb[2], nb[1])
            self.conv2_2 = ConvBlock(nb[2] * 2 + nb[3], nb[2])

            self.conv0_3 = ConvBlock(nb[0] * 3 + nb[1], nb[0])
            self.conv1_3 = ConvBlock(nb[1] * 3 + nb[2], nb[1])

            self.conv0_4 = ConvBlock(nb[0] * 4 + nb[1], nb[0])
            self.final = nn.Conv2d(nb[0], num_classes, kernel_size=1)

        def up(self, x, size):
            return F.interpolate(x, size=size, mode="bilinear", align_corners=False)

        def forward(self, x):
            x0_0 = self.conv0_0(x)
            x1_0 = self.conv1_0(self.pool(x0_0))
            x2_0 = self.conv2_0(self.pool(x1_0))
            x3_0 = self.conv3_0(self.pool(x2_0))
            x4_0 = self.conv4_0(self.pool(x3_0))

            x0_1 = self.conv0_1(torch.cat([x0_0, self.up(x1_0, x0_0.shape[2:])], dim=1))
            x1_1 = self.conv1_1(torch.cat([x1_0, self.up(x2_0, x1_0.shape[2:])], dim=1))
            x2_1 = self.conv2_1(torch.cat([x2_0, self.up(x3_0, x2_0.shape[2:])], dim=1))
            x3_1 = self.conv3_1(torch.cat([x3_0, self.up(x4_0, x3_0.shape[2:])], dim=1))

            x0_2 = self.conv0_2(torch.cat([x0_0, x0_1, self.up(x1_1, x0_0.shape[2:])], dim=1))
            x1_2 = self.conv1_2(torch.cat([x1_0, x1_1, self.up(x2_1, x1_0.shape[2:])], dim=1))
            x2_2 = self.conv2_2(torch.cat([x2_0, x2_1, self.up(x3_1, x2_0.shape[2:])], dim=1))

            x0_3 = self.conv0_3(torch.cat([x0_0, x0_1, x0_2, self.up(x1_2, x0_0.shape[2:])], dim=1))
            x1_3 = self.conv1_3(torch.cat([x1_0, x1_1, x1_2, self.up(x2_2, x1_0.shape[2:])], dim=1))

            x0_4 = self.conv0_4(torch.cat([x0_0, x0_1, x0_2, x0_3, self.up(x1_3, x0_0.shape[2:])], dim=1))
            return self.final(x0_4)

    return UNetPlusPlusSmall()


@lru_cache
def load_model():
    settings = get_settings()
    if not settings.model_path.exists():
        raise ModelLoadError(f"Model checkpoint not found: {settings.model_path}")

    try:
        import torch
    except ImportError as exc:
        raise ModelLoadError(
            "PyTorch is required for AI inference. Install backend requirements."
        ) from exc

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(settings.model_path, map_location=device)
    state_dict, model_name, class_count, in_channels, input_size, base_channels = _extract_checkpoint_state(checkpoint)
    if any(key.startswith("module.") for key in state_dict.keys()):
        state_dict = {key.replace("module.", "", 1): value for key, value in state_dict.items()}

    _build_model.in_channels = in_channels
    _build_model.base_channels = base_channels
    model = _build_model(model_name=model_name, classes=class_count)

    try:
        model.load_state_dict(state_dict)
    except RuntimeError as exc:
        raise ModelLoadError(
            f"Checkpoint does not match the configured {model_name} wrapper. "
            "Update app.ai.model_loader.py with the exact training architecture."
        ) from exc

    model.to(device)
    model.in_channels = in_channels
    model.input_size = input_size
    model.class_names = (
        checkpoint.get("class_names") or checkpoint.get("classes") if isinstance(checkpoint, dict) else None
    )
    model.eval()
    return model, device
