import torch

def evaluate(model, loader, criterion, device):
    model.eval()
    total, correct, loss_sum = 0, 0, 0

    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)

            out = model(x)
            loss = criterion(out, y)

            loss_sum += loss.item()
            _, preds = torch.max(out, 1)

            correct += (preds == y).sum().item()
            total += y.size(0)

    return loss_sum / len(loader), correct / total