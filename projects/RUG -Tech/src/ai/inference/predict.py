

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict


AI_ROOT = Path(__file__).resolve().parents[1]
if str(AI_ROOT) not in sys.path:
	sys.path.insert(0, str(AI_ROOT))

from pipeline.predict_pipeline import PredictionPipeline, TEST_IMAGE, predict_image


def run_prediction(image_path: Path | None = None) -> Dict[str, Dict[str, object]]:
	target = image_path or TEST_IMAGE
	if not target.exists():
		raise FileNotFoundError(f"Image not found: {target}")
	return predict_image(target)


if __name__ == "__main__":
	result = run_prediction(TEST_IMAGE)
	print(json.dumps(result, indent=2))
