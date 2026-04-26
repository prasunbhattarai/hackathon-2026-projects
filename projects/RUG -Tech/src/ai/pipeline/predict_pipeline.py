from __future__ import annotations

import json
import math
import sys
from pathlib import Path
from typing import Dict, Iterable, List

import torch  # type: ignore[import-not-found]
from PIL import Image

# Ensure imports work when running this file directly.
AI_ROOT = Path(__file__).resolve().parents[1]
if str(AI_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_ROOT))

from loaders.resnet import get_model
from preprocessing.transforms import get_transforms
from utils.device import get_device


SRC_ROOT = Path(__file__).resolve().parents[2]
DR_CHECKPOINT = SRC_ROOT / "models" / "dr.pth"
HG_CHECKPOINT = SRC_ROOT / "models" / "hypertensive_and_glaucoma_model.pth"
TEST_IMAGE = SRC_ROOT / "test_images" / "images.jpg"


def _round4(value: float) -> float:
    return round(float(value), 4)


def _softmax(values: Iterable[float]) -> List[float]:
    vals = list(values)
    max_val = max(vals)
    exps = [math.exp(v - max_val) for v in vals]
    total = sum(exps)
    return [v / total for v in exps]


def _sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-float(value)))


def _risk_label(probability: float, high: float, medium: float) -> str:
    if probability >= high:
        return "High"
    if probability >= medium:
        return "Medium"
    return "Low"


def _dr_labels(class_count: int) -> List[str]:
    if class_count == 5:
        return ["No_DR", "Mild", "Moderate", "Severe", "PDR"]
    if class_count == 4:
        return ["No_DR", "Mild", "Moderate", "Severe"]
    return [f"Class_{idx}" for idx in range(class_count)]


def _infer_num_classes(state_dict: Dict[str, torch.Tensor]) -> int:
    for key in ("fc.weight", "module.fc.weight"):
        if key in state_dict:
            return int(state_dict[key].shape[0])
    raise ValueError("Could not infer output class count from checkpoint.")


class PredictionPipeline:
    def __init__(
        self,
        dr_checkpoint: Path = DR_CHECKPOINT,
        hg_checkpoint: Path = HG_CHECKPOINT,
        device: torch.device | None = None,
    ) -> None:
        self.dr_checkpoint = dr_checkpoint
        self.hg_checkpoint = hg_checkpoint
        self.device = device or get_device()
        self.transform = get_transforms(augment=False)

    def _load_model(self, checkpoint_path: Path) -> torch.nn.Module:
        state_dict = torch.load(checkpoint_path, map_location="cpu")
        num_classes = _infer_num_classes(state_dict)
        model = get_model(num_classes=num_classes).to(self.device)
        model.load_state_dict(state_dict)
        model.eval()
        return model

    def _preprocess_image(self, image_path: Path) -> torch.Tensor:
        with Image.open(image_path) as img:
            image = img.convert("RGB")
        return self.transform(image).unsqueeze(0).to(self.device)

    def predict_image(self, image_path: Path) -> Dict[str, Dict[str, object]]:
        batch = self._preprocess_image(image_path)

        dr_model = self._load_model(self.dr_checkpoint)
        glaucoma_model = self._load_model(self.hg_checkpoint)
        hr_model = self._load_model(self.hg_checkpoint)

        with torch.no_grad():
            dr_logits = dr_model(batch).detach().cpu().flatten().tolist()
            glaucoma_raw = glaucoma_model(batch).detach().cpu().flatten().tolist()
            hr_raw = hr_model(batch).detach().cpu().flatten().tolist()

        dr_probs = _softmax([float(v) for v in dr_logits])
        dr_labels = _dr_labels(len(dr_probs))
        dr_distribution = {label: _round4(prob) for label, prob in zip(dr_labels, dr_probs)}
        dr_pred_idx = max(range(len(dr_probs)), key=lambda idx: dr_probs[idx])
        dr_probability = 1.0 - dr_probs[0]

        if len(glaucoma_raw) == 1:
            glaucoma_probability = _sigmoid(float(glaucoma_raw[0]))
        else:
            glaucoma_probability = _softmax([float(v) for v in glaucoma_raw])[-1]

        if len(hr_raw) == 1:
            hr_probability = _sigmoid(float(hr_raw[0]))
        else:
            hr_probability = _softmax([float(v) for v in hr_raw])[-1]

        return {
            "DR": {
                "probability": _round4(dr_probability),
                "severity_distribution": dr_distribution,
                "predicted_severity": dr_labels[dr_pred_idx],
            },
            "Glaucoma": {
                "probability": _round4(glaucoma_probability),
                "predicted_risk": _risk_label(glaucoma_probability, high=0.6, medium=0.35),
            },
            "HR": {
                "probability": _round4(hr_probability),
                "predicted_risk": _risk_label(hr_probability, high=0.75, medium=0.6),
            },
        }


def predict_image(image_path: Path) -> Dict[str, Dict[str, object]]:
    pipeline = PredictionPipeline()
    return pipeline.predict_image(image_path)


def run_prediction_pipeline(image_path: Path | None = None) -> dict:
    target_image = image_path or TEST_IMAGE
    if not target_image.exists():
        raise FileNotFoundError(f"Image not found: {target_image}")
    return predict_image(target_image)


if __name__ == "__main__":
    result = run_prediction_pipeline()
    print(json.dumps(result, indent=2))
