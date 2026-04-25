import torch.nn as nn
import torch.optim as optim
from torch.utils.data import random_split, DataLoader

from utils.device import get_device
from preprocessing.transforms import get_transforms
from loader.csv_loader import CSVDataset
from pipeline.trainer import train_epoch, save_model
from postprocessing.metrics import evaluate

device = get_device()
transform = get_transforms(augment=True)

dataset = CSVDataset("../dataset/CSV/HRDC.csv", "../dataset/Hypertensive", transform)

train_len = int(0.9 * len(dataset))
val_len = len(dataset) - train_len
train_ds, val_ds = random_split(dataset, [train_len, val_len])

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=32)

num_classes = len(set([y for _, y in dataset]))

model = get_model(num_classes, fine_tune_layers=["layer3", "layer4"]).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-4)

best = float("inf")

for epoch in range(7):
    train_loss = train_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, acc = evaluate(model, val_loader, criterion, device)

    if val_loss < best:
        best = val_loss
        save_model(model, "hypertensive_model.pth")

    print(epoch, train_loss, val_loss, acc)