import torch.nn as nn
import torch            


class ResNet(nn.Module):            
	def __init__(self):
		super().__init__()
		self.Conv2d_3 = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=1, stride=1, bias=False)
		self.BatchNorm2d_4 = nn.BatchNorm2d(num_features=64)
		self.ReLU_5 = nn.ReLU()
		self.Conv2d_6 = nn.Conv2d(in_channels=64, out_channels=64, kernel_size=7, stride=2, padding=3, bias=False)
		self.BatchNorm2d_7 = nn.BatchNorm2d(num_features=64)
		self.AdaptiveAvgPool2d_11 = nn.AdaptiveAvgPool2d(output_size=[1, 1])
		self.Linear_13 = nn.Linear(in_features=100, out_features=1000)
		self.Sigmoid_14 = nn.Sigmoid()            

	def forward(self, x):
		identity = x
		x = self.Conv2d_3(x)
		x = self.BatchNorm2d_4(x)
		x = self.ReLU_5(x)
		x = self.Conv2d_6(x)
		x = self.BatchNorm2d_7(x)
		x = torch.add(x, identity, )
		x = self.AdaptiveAvgPool2d_11(x)
		x = torch.flatten(x, start_dim=1)
		x = self.Linear_13(x)
		x = self.Sigmoid_14(x)
		return x