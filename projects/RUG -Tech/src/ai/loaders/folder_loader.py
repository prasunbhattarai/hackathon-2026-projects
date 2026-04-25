from torchvision import datasets

def get_folder_dataset(path, transform):
    return datasets.ImageFolder(path, transform=transform)