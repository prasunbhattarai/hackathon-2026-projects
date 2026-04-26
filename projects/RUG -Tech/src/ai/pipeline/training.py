import torch.nn as nn
import torch.optim as optim
from torch.utils.data import random_split, DataLoader
from utils.device import get_device
from preprocessing.transforms import get_transforms
from loader.resnet import get_model
from loader.csv_loader import CSVDataset
from pipeline.trainer import train_epoch, save_model, get_optimizer
from postprocessing.metrics import evaluate

device = get_device()
transform = get_transforms(augment=True)

dataset = CSVDataset("pipeline/dataset/CSV/combined.csv", "pipeline/dataset/combined/", transform)

train_len = int(0.9 * len(dataset))
val_len = len(dataset) - train_len
train_ds, val_ds = random_split(dataset, [train_len, val_len])

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=32)



def get_num_classes(dataset):
    if hasattr(dataset, 'data'):
        return len(set(dataset.data.iloc[:, 1]))
    elif hasattr(dataset, 'classes'):
        return len(dataset.classes)
    return None


def get_class_names(dataset):
    if hasattr(dataset, 'data'):
        return sorted(set(dataset.data.iloc[:, 1]))
    elif hasattr(dataset, 'classes'):
        return dataset.classes
    return None
num_classes = get_num_classes(dataset)


model = get_model(num_classes, fine_tune_layers=["layer3", "layer4"]).to(device)



criterion = nn.BCEWithLogitsLoss()
optimizer = get_optimizer(
    model,
    fine_tune_layers=['layer3', 'layer4'],
    lr=1e-4,
    weight_decay=1e-4
)
best = float("inf")

for epoch in range(7):
    train_loss = train_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, acc = evaluate(model, val_loader, criterion, device, mode="multi")
    print(f"Current: {val_loss}, Best: {best}")
    if val_loss < best:
        best = val_loss
        save_model(model, "hypertensive_and_glaucoma_model.pth")
        print("Model saved: hypertensive_and_glaucoma_model.pth")

    print(f"\n--- Epoch {epoch+1} ---")
    print(f"Train Loss: {train_loss:.4f}")
    print(f"Val Loss: {val_loss:.4f}, Val Acc: {acc:.4f}")