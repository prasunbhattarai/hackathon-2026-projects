# Responsible AI

## Data sources

- Retinal fundus image datasets were used for DR, Glaucoma, and Hypertensive Retinopathy (HR) prediction.
- The repository includes DR image folders and an HR CSV label file for training and testing support.
- These datasets were used to build a prototype focused on only three retinal condition outputs.
- DR data includes severity-based image grouping, while HR data uses labeled image references from a CSV file.
- The available data is enough for a prototype demonstration, but it should not be treated as complete clinical-grade documentation.

## Model choices

- The project uses a ResNet18-based transfer learning approach.
- We chose this model because it is lightweight, practical, and suitable for a hackathon prototype.
- The system is limited to only three prediction areas: DR, Glaucoma, and HR.
- Transfer learning was used to make use of a proven image model while reducing training time and compute requirements.
- Input fundus images are preprocessed before prediction so the model receives a consistent image size and format.
- The goal was to build a working proof of concept quickly rather than a fully optimized clinical model.

## Bias considerations

- Model performance may vary depending on image quality, dataset balance, and patient population.
- The training data documentation does not fully cover demographics or capture conditions, so fairness across all groups cannot be guaranteed.
- Performance may also change across different cameras, lighting conditions, and clinical environments.
- If some classes or patient groups are underrepresented in training data, predictions for those groups may be less reliable.
- Differences in annotation quality or labeling consistency can also affect model behavior.
- Since this is a prototype, the model should be treated as a support tool, not a final medical decision-maker.

## Failure cases

- The model may give unreliable results on low-quality or unclear retinal images.
- It may miss subtle or early-stage disease.
- It may confuse visually similar disease stages, especially when retinal signs are weak or image quality is poor.
- It only covers three conditions, so other eye diseases are outside its scope.
- Predictions may become less reliable when tested on images very different from the training data.
- A low-risk prediction does not guarantee that the eye is healthy, because the model is not designed to detect every retinal disorder.
- The current system has not been clinically validated.