import pandas as pd
import os
import torch
from PIL import Image
from torch.utils.data import Dataset

class CSVDataset(torch.utils.data.Dataset):
    def __init__(self, csv_file, root_dir, transform=None, img_col=0, label_col=1):
        self.data = pd.read_csv(csv_file)
        self.root_dir = root_dir
        self.transform = transform
        self.img_col = img_col
        self.label_col = label_col

    def __len__(self):
        return len(self.data)
    def __getitem__(self, idx):
        img_name = str(self.data.iloc[idx, self.img_col])

        # get both labels
        label = self.data.iloc[idx, 1:3].values.astype('float32')

        img_path = os.path.join(self.root_dir, img_name)

        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label