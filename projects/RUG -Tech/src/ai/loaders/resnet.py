import torch.nn as nn
from torchvision import models

def get_model(num_classes, freeze_backbone=True, fine_tune_layers=None, dropout=False):
    model = models.resnet18(pretrained=True)

    if freeze_backbone:
        for p in model.parameters():
            p.requires_grad = False

    if fine_tune_layers:
        for layer in fine_tune_layers:
            for p in getattr(model, layer).parameters():
                p.requires_grad = True

    if dropout:
        model.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(model.fc.in_features, num_classes)
        )
    else:
        model.fc = nn.Linear(model.fc.in_features, num_classes)

    return model