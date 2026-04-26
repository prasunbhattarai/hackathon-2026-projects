import torch

def evaluate(model, val_loader, criterion, device,  mode="single"):
    model.eval()
    correct = 0
    total = 0
    val_loss = 0

    with torch.no_grad():
        for x, y in val_loader:
            x, y = x.to(device), y.to(device)

            out = model(x)
            loss = criterion(out, y)
            val_loss += loss.item()
            if mode == "single":
                _, preds = torch.max(out, 1)
                correct += (preds == y).sum().item()
                total += y.size(0)
            else:
                preds = torch.sigmoid(out) > 0.5
                correct += (preds == y.bool()).sum().item()
                total += y.numel()

    avg_val_loss = val_loss / len(val_loader)
    val_acc = correct / total

    return avg_val_loss, val_acc