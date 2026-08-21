# ViT 视觉编码器——图像怎么变成 token

> ViT（Vision Transformer，Google 2020）做了件"离经叛道"的事：**完全抛弃卷积，把图像切成小块当 token，直接喂给 Transformer**。它打通了"图像和文本用同一个架构"的最后一堵墙，是多模态统一的地基。这一篇拆开讲——图像是怎么一步步变成 token 序列的。

> 📖 论文：Dosovitskiy et al., *An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale*, ICLR 2021。

---

## 目录

1. [核心思想：一张图 = 一串"词"](#1-核心思想一张图--一串词)
2. [Patch Embedding：图像 → token 的关键一步](#2-patch-embedding图像--token-的关键一步)
3. [[CLS] token 与位置编码](#3-cls-token-与位置编码)
4. [完整架构：标准的 Transformer 编码器](#4-完整架构标准的-transformer-编码器)
5. [手算：4×4 图像 → 4 个 token](#5-手算4×4-图像--4-个-token)
6. [代码：从零实现 + 验证手算](#6-代码从零实现--验证手算)
7. [ViT vs CNN：为什么 Transformer 能进视觉](#7-vit-vs-cnn为什么-transformer-能进视觉)
8. [与你已学知识的连接](#8-与你已学知识的连接)

---

## 1. 核心思想：一张图 = 一串"词"

回顾你学过的 [Transformer](../ai_theory/deep-dives/05-Transformer架构.md)：它处理的是**一维 token 序列**（一句话 = 一串词）。

图像是二维的（宽×高），怎么变成一维序列？ViT 的答案极其直接：

> **把图像切成固定大小的小方块（patch），每个 patch 当作一个"词"，图像就变成了一串"词"。**

论文标题就说明了这一点：*An Image is Worth 16×16 Words*（一张图值 16×16 个词）。

```
图像 224×224，patch 16×16
→ 切成 14×14 = 196 个 patch
→ 每个 patch = 一个"词"
→ 196 个词 + [CLS] = 197 个 token
→ 喂给标准 Transformer
```

> 💡 这是与 CNN 的根本分岔：CNN 用卷积核**局部滑动**，ViT 用注意力**全局看所有 patch**。之前图像是 CNN 的专属领域，ViT 证明了 Transformer 同样能行。

---

## 2. Patch Embedding：图像 → token 的关键一步

这是 ViT 唯一"为图像定制"的部分，其他都是标准 Transformer。分两步：

### 第一步：切块 + 展平

```
图像 H×W×C（高×宽×通道，如 224×224×3）
切成 N 个 patch，每个 P×P×C（如 16×16×3）

把每个 patch 展平成一条向量：
  16×16×3 = 768 维的向量
```

### 第二步：线性投影

用**一个线性层**（矩阵乘法）把 768 维投影到 Transformer 的隐藏维度 D（如 768）：

```
每个 patch 展平向量 (P²C 维) → 线性投影 → patch token (D 维)
```

这个"展平 + 线性投影"合起来就叫 **Patch Embedding**。实际实现里通常直接用一个大步长的卷积（stride=patch size）一步完成切块+投影，但概念上就是"切块 → 展平 → 线性层"。

> 💡 注意：这里**没有卷积核滑动**，patch 之间是**不重叠**的，每个 patch 独立投影。这和 CNN 的"重叠滑动 + 共享权重"是本质区别。

---

## 3. [CLS] token 与位置编码

### 3.1 [CLS] token：全局信息的"收集器"

在 196 个 patch token 前面，额外加一个**可学习的 [CLS] token**（和 BERT 的 [CLS] 一模一样）：

```
[[CLS], patch₁, patch₂, ..., patch₁₉₆]  →  共 197 个 token
```

[CLS] 经过 Transformer 后，它的输出向量**汇总了整张图的信息**——因为它通过注意力机制"看了"所有 patch。分类时只用 [CLS] 的输出过一个分类头即可。

> 💡 为什么需要 [CLS]？因为 Transformer 没有"整张图"这个概念，它输出的是每个 token 各自的表示。需要一个 token 专门"汇总全局"——[CLS] 就是这个角色。

### 3.2 位置编码：注意力"不认顺序"

你在 [Transformer](../ai_theory/deep-dives/05-Transformer架构.md) 学过：注意力机制对输入顺序不敏感，所以必须加**位置编码**。

ViT 用**可学习的位置嵌入**（不像原版 Transformer 用正弦编码）——每个位置一个可训练向量，直接加到 token 上：

```
patch₁ 加"位置 1"的嵌入
patch₂ 加"位置 2"的嵌入
...
```

> ⚠️ 这是 ViT 的一个已知局限：可学习位置编码的长度是固定的（训练时定了 196 个位置），**无法直接外推到更高分辨率**。后续工作（如 Swin、ViT-22B）用相对位置编码或插值解决了这个问题。

---

## 4. 完整架构：标准的 Transformer 编码器

Patch Embedding 之后，剩下的就是**标准的 Transformer 编码器**（和 BERT 一样）：

```
[CLS] + 196 个 patch token + 位置编码
        ↓
┌──────────────────────┐
│ 多头自注意力 + 残差 + LN │  ×12 层（ViT-Base）
│ FFN + 残差 + LN          │
└──────────────────────┘
        ↓
取 [CLS] 的输出 → MLP 分类头 → 类别
```

**关键点**：除了 Patch Embedding，**没有为图像改任何东西**——全是标准 Transformer 编码器。这就是 ViT 的优雅之处。

---

## 5. 手算：4×4 图像 → 4 个 token

### 5.1 设定：4×4 灰度图，patch 2×2

```
图像 X（4×4，灰度，1 通道）:
┌             ┐
│ 1  2  3  4 │
│ 5  6  7  8 │
│ 9 10 11 12 │
│13 14 15 16 │
└             ┘
```

patch 大小 2×2 → 切成 2×2 = 4 个 patch。

### 5.2 第一步：切块 + 展平

```
patch₁ (左上): [1 2; 5 6]    → 展平 [1, 2, 5, 6]
patch₂ (右上): [3 4; 7 8]    → 展平 [3, 4, 7, 8]
patch₃ (左下): [9 10; 13 14] → 展平 [9, 10, 13, 14]
patch₄ (右下): [11 12; 15 16]→ 展平 [11, 12, 15, 16]
```

每个 patch 现在是 4 维向量（2×2×1=4）。

### 5.3 第二步：线性投影（4 维 → 3 维，简化）

投影矩阵 W（4×3）：

```
W = ┌         ┐
    │ 1  0  0 │
    │ 0  1  0 │
    │ 0  0  1 │
    │ 1  1  1 │
    └         ┘
```

对 patch₁ [1, 2, 5, 6] 投影：

```
token₁ = [1,2,5,6] · W
       = [1×1+2×0+5×0+6×1,  1×0+2×1+5×0+6×1,  1×0+2×0+5×1+6×1]
       = [7,  8,  11]
```

同理可得 4 个 patch token（每个 3 维）。加上 [CLS] token 和位置编码后，就是 5 个 token 的序列，喂给 Transformer。

> 💡 整个过程的核心只有一步是"新"的——**把 2×2 的像素块展平成一条向量**。之后全是标准 Transformer 的操作。这就是 ViT 的全部秘密。

---

## 6. 代码：从零实现 + 验证手算

```python
import torch
import torch.nn as nn

class PatchEmbed(nn.Module):
    """Patch Embedding：图像 → token 序列（ViT 唯一为图像定制的部分）"""
    def __init__(self, img_size=224, patch_size=16, in_chans=3, embed_dim=768):
        super().__init__()
        # 用一个大步长卷积一步完成"切块 + 展平 + 投影"
        self.proj = nn.Conv2d(in_chans, embed_dim,
                              kernel_size=patch_size, stride=patch_size)
        self.num_patches = (img_size // patch_size) ** 2

    def forward(self, x):
        # x: (B, C, H, W)
        x = self.proj(x)                    # (B, D, H/P, W/P)
        x = x.flatten(2)                    # (B, D, N) 展平 patch 维度
        x = x.transpose(1, 2)               # (B, N, D) → token 序列
        return x

# ==== 验证第 5 节的手算 ====
# 4×4 灰度图，patch 2×2，投影到 3 维
img = torch.tensor([[[[1, 2, 3, 4],
                      [5, 6, 7, 8],
                      [9, 10, 11, 12],
                      [13, 14, 15, 16]]]], dtype=torch.float32)  # (1,1,4,4)

# 手算的投影：等效于卷积核 [[1,0],[0,1]] 和 [[0,0],[0,1]]... 
# 这里用 nn.Conv2d 直接验证切块逻辑（投影权重另说）
pe = PatchEmbed(img_size=4, patch_size=2, in_chans=1, embed_dim=4)
tokens = pe(img)
print("token 序列形状:", tokens.shape)  # (1, 4, 4) = 4 个 patch，每个 4 维
# 第一个 patch 展平后应为 [1,2,5,6]（取决于投影权重，默认随机初始化）
```

### 用 Hugging Face 加载真实 ViT

```python
from transformers import ViTModel, ViTImageProcessor
from PIL import Image

model = ViTModel.from_pretrained("google/vit-base-patch16-224")
processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")

image = Image.open("example.jpg")
inputs = processor(images=image, return_tensors="pt")

outputs = model(**inputs)
last_hidden = outputs.last_hidden_state      # (1, 197, 768)
cls_token = outputs.last_hidden_state[:, 0]  # [CLS] 的全局表示
print("token 数量:", last_hidden.shape[1])    # 197 = 196 patch + 1 CLS
```

---

## 7. ViT vs CNN：为什么 Transformer 能进视觉

| 维度 | CNN | ViT |
|------|-----|-----|
| 核心操作 | 卷积核局部滑动（权重共享） | 注意力全局看所有 patch |
| 感受野 | 逐层扩大（局部→全局） | 第一层就是全局 |
| 归纳偏置 | 强（局部性、平移不变性） | 弱（只有"patch 是词"这一条） |
| 数据需求 | 小数据也 work | **需要海量数据**（否则不如 CNN） |
| 训练成本 | 低 | 高 |

**关键洞察**：

1. **ViT 的归纳偏置极弱**——它几乎没假设"图像有局部性"，全靠数据自己学。所以小数据上 ViT 不如 CNN（CNN 的卷积归纳偏置是"免费的午餐"），但数据足够大时，ViT 反而超越 CNN。

2. **ViT 的意义远超图像分类**——它证明了"图像可以当 token 处理"，于是图像和文本终于能用**同一个 Transformer**。这正是 [LLaVA](02-LLaVA与VLM骨架.md) 能把 CLIP 的 ViT 直接接上 LLM 的前提。

> 💡 一句话：CNN 是"为图像而生"的架构，ViT 是"为统一而生"的架构。多模态大模型的今天，靠的是 ViT 这条路。

---

## 8. 与你已学知识的连接

| ViT 概念 | 你已学的 |
|----------|----------|
| Transformer 编码器 | [Transformer 架构](../ai_theory/deep-dives/05-Transformer架构.md) |
| 与 CNN 的对比 | [CNN 深度解剖](../ai_theory/deep-dives/01-CNN深度解剖.md) |
| ViT 在多模态史的位置 | [多模态发展史](../history/多模态发展史.md)（2020 关键转折） |
| ViT 作为 LLaVA 的视觉编码器 | [LLaVA 骨架](02-LLaVA与VLM骨架.md) |
| 注意力"不认顺序" | [注意力机制](../ai_theory/deep-dives/04-注意力机制.md) |

---

## 📌 本章要点

1. ViT 核心思想：**图像切成 patch 当"词"**，喂给标准 Transformer——完全抛弃卷积
2. Patch Embedding 是唯一"为图像定制"的部分：切块 → 展平 → 线性投影
3. [CLS] token 汇总全局信息（和 BERT 一样），位置编码补顺序
4. patch 之间**不重叠**，与 CNN 的"重叠滑动 + 共享权重"是本质区别
5. ViT 归纳偏置极弱，需海量数据；但意义在于**统一了图像和文本的架构**
6. 多模态大模型的今天，靠的是 ViT"图像当 token"这条路
