import torch
import torch.optim as optim


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

def get_optimizer(model, fine_tune_layers, lr=1e-3, weight_decay=0):
    param_groups = []

    if fine_tune_layers:
        for layer_name in fine_tune_layers:
            if hasattr(model, layer_name):
                param_groups.extend(list(getattr(model, layer_name).parameters()))

    param_groups.extend(list(model.fc.parameters()))

    return optim.Adam(param_groups, lr=lr, weight_decay=weight_decay)

def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0

    for x, y in loader:
        x, y = x.to(device), y.to(device)

        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)

        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    return total_loss / len(loader)


def save_model(model, path):
    torch.save(model.state_dict(), path)