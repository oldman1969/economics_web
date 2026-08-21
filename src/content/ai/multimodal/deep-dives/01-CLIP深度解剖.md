# CLIP 深度解剖——对比学习与图文对齐

> CLIP（Contrastive Language-Image Pre-training，OpenAI 2021）是整个视觉语言模型（VLM）时代的奠基之作。它回答了一个看似简单、实则深刻的问题：**怎么让"狗"这个词和狗的照片在同一个向量空间里靠在一起？** 吃透 CLIP，就理解了后续所有 VLM 的"对齐"环节。

> 📖 论文：Radford et al., *Learning Transferable Visual Models From Natural Language Supervision*, ICML 2021。

---

## 目录

1. [核心思想：用"对比"代替"分类标签"](#1-核心思想用对比代替分类标签)
2. [双塔架构：两个编码器 + 一个共享空间](#2-双塔架构两个编码器--一个共享空间)
3. [对比损失（InfoNCE）：数学推导](#3-对比损失infonce数学推导)
4. [手算：一个 batch=2 的完整例子](#4-手算一个-batch2-的完整例子)
5. [代码：从零实现 + 验证手算](#5-代码从零实现--验证手算)
6. [为什么有效：零样本迁移](#6-为什么有效零样本迁移)
7. [局限与后继](#7-局限与后继)

---

## 1. 核心思想：用"对比"代替"分类标签"

### 1.1 传统图像分类的死胡同

CLIP 之前，图像模型靠**人工标注的分类标签**训练（ImageNet 的 1000 类）。问题：

- 标签是**封闭的**：模型只会分辨训练时见过的 1000 类，遇到"腊肠犬"和"柯基"这种细粒度就抓瞎
- 标签是**昂贵的**：每张图都要人工标
- 标签**丢失语义**：类别之间没有关系（"狗"和"猫"在标签里只是两个无关的 id）

### 1.2 CLIP 的解法：让图像和文字互相监督

CLIP 收集了 **4 亿对（图像，文字描述）** 从互联网上抓取的数据（图片 + 它的 alt-text/标题），训练一个模型：**判断哪段文字和哪张图是配对的**。

```
配对: [🐕 图片] + "a photo of a dog"      → 相似度应该高
不配对: [🐕 图片] + "a photo of a cat"     → 相似度应该低
```

> 💡 这就是**对比学习**（Contrastive Learning）：不告诉模型"这张图是类别 5"，而是让它学会"这张图和哪句话最像"。文字成了图像的**开放标签**——不再是封闭的 1000 类。

---

## 2. 双塔架构：两个编码器 + 一个共享空间

```
图像 ──→ 图像编码器（ViT/ResNet）──→ 图像嵌入 i  ┐
                                                 ├→ 同一向量空间，算余弦相似度
文字 ──→ 文本编码器（Transformer）──→ 文本嵌入 t  ┘
```

| 部件 | 作用 | 你已有的知识 |
|------|------|-------------|
| 图像编码器 | 图像 → 一个 d 维向量（如 512/768 维） | [deep-dives/01 CNN](../../ai_theory/deep-dives/01-CNN深度解剖.md)、ViT |
| 文本编码器 | 文字 → 同样 d 维向量 | [deep-dives/05 Transformer](../../ai_theory/deep-dives/05-Transformer架构.md) |
| 投影层 | 把两个编码器输出对齐到同一维度 + L2 归一化 | 对齐的关键 |

**关键设计**：两个编码器输出**必须映射到同一个向量空间**（同维度 + 都做 L2 归一化），这样"狗的图片"和"a photo of a dog"的向量才能用**点积（= 余弦相似度）**比较。

---

## 3. 对比损失（InfoNCE）：数学推导

### 3.1 相似度矩阵

一个 batch 有 N 对（图像，文字）。编码后：

```
图像嵌入: I = [i₁, i₂, ..., i_N]ᵀ   (N×d，每行已 L2 归一化)
文本嵌入: T = [t₁, t₂, ..., t_N]ᵀ   (N×d，每行已 L2 归一化)

相似度矩阵: S = I · Tᵀ   (N×N)
```

`S[i,j] = i_i · t_j = 余弦相似度(第 i 张图, 第 j 段文字)`。

**对角线 S[i,i] 是"正样本"**（真正配对的图文），其余全是"负样本"。

### 3.2 对称 InfoNCE 损失

把相似度矩阵除以温度 τ，然后对**行**和**列**各做一次交叉熵：

```
logits = S / τ          （τ 是温度，CLIP 用可学习的 τ ≈ 0.07）

损失（图像→文字方向）: 对每一行（每张图），让它选中"配对的文字"
损失（文字→图像方向）: 对每一列（每段文字），让它选中"配对的图像"

L = 0.5 × ( L_image_to_text + L_text_to_image )
```

### 3.3 温度 τ 的作用

τ 越小，logits 被放大得越狠，softmax 越"尖锐"——模型对相似度差异更敏感。CLIP 的 τ 初始化为 0.07，是**可学习的参数**。

---

## 4. 手算：一个 batch=2 的完整例子

### 4.1 设定（batch=2，嵌入维度简化为 3，均已 L2 归一化）

```
图像 1（狗）: i₁ = [0.900, 0.300, 0.200]
文字 1（狗）: t₁ = [0.850, 0.400, 0.100]   ← 与 i₁ 方向接近

图像 2（猫）: i₂ = [0.200, 0.100, 0.900]
文字 2（猫）: t₂ = [0.150, 0.200, 0.850]   ← 与 i₂ 方向接近
```

### 4.2 相似度矩阵 S = I · Tᵀ

```
S[0,0] = i₁·t₁ = 0.900×0.850 + 0.300×0.400 + 0.200×0.100
       = 0.765 + 0.120 + 0.020 = 0.905        ← 配对，高 ✓

S[0,1] = i₁·t₂ = 0.900×0.150 + 0.300×0.200 + 0.200×0.850
       = 0.135 + 0.060 + 0.170 = 0.365        ← 不配对，低 ✓

S[1,0] = i₂·t₁ = 0.200×0.850 + 0.100×0.400 + 0.900×0.100
       = 0.170 + 0.040 + 0.090 = 0.300        ← 不配对，低 ✓

S[1,1] = i₂·t₂ = 0.200×0.150 + 0.100×0.200 + 0.900×0.850
       = 0.030 + 0.020 + 0.765 = 0.815        ← 配对，高 ✓

S = ┌               ┐
    │ 0.905  0.365 │
    │ 0.300  0.815 │
    └               ┘
```

**观察**：对角线（0.905、0.815）明显高于反对角线（0.365、0.300）——模型已经"学对"了。

### 4.3 除以温度 τ=0.5（手算用大 τ 更清晰）

```
logits = S / 0.5 = ┌               ┐
                   │ 1.810  0.730 │
                   │ 0.600  1.630 │
                   └               ┘
```

### 4.4 逐行 softmax

**第 1 行（图像 1 要选文字）**：

```
exp(1.810) = 6.110,  exp(0.730) = 2.075
概率 = [6.110/8.185, 2.075/8.185] = [0.746, 0.254]

图像 1 正确选中文字 1 的概率 = 0.746 ✓
```

**第 2 行（图像 2 要选文字）**：

```
exp(0.600) = 1.822,  exp(1.630) = 5.104
概率 = [1.822/6.926, 5.104/6.926] = [0.263, 0.737]

图像 2 正确选中文字 2 的概率 = 0.737 ✓
```

### 4.5 计算损失

```
L_image_to_text = -0.5 × (log 0.746 + log 0.737)
                = -0.5 × (-0.293 - 0.305)
                = 0.299

（本例两方向对称，总损失 ≈ 0.299）
```

> 💡 训练目标就是**让对角线的概率尽量接近 1**（即损失尽量小）。损失大 = 模型分不清哪个文字配哪个图，梯度会推动编码器调整，让配对向量更靠近、不配对向量更远离。

---

## 5. 代码：从零实现 + 验证手算

```python
import numpy as np

def cross_entropy(logits, labels):
    """softmax 交叉熵，logits: N×N, labels: 正确类别的索引"""
    # 数值稳定：减去每行最大值
    logits = logits - logits.max(axis=1, keepdims=True)
    exp = np.exp(logits)
    probs = exp / exp.sum(axis=1, keepdims=True)
    N = len(labels)
    return -np.log(probs[np.arange(N), labels]).mean()

def clip_loss(image_emb, text_emb, temperature=0.07):
    """
    对称 InfoNCE 损失（CLIP 的核心）
    image_emb: N×d，已 L2 归一化
    text_emb:  N×d，已 L2 归一化
    """
    N = image_emb.shape[0]
    logits = image_emb @ text_emb.T / temperature   # N×N 相似度矩阵
    labels = np.arange(N)                            # 对角线是正样本

    loss_i2t = cross_entropy(logits, labels)         # 图像→文字
    loss_t2i = cross_entropy(logits.T, labels)       # 文字→图像
    return (loss_i2t + loss_t2i) / 2

# ==== 验证第 4 节的手算 ====
i = np.array([[0.900, 0.300, 0.200],
              [0.200, 0.100, 0.900]])
t = np.array([[0.850, 0.400, 0.100],
              [0.150, 0.200, 0.850]])

# 相似度矩阵（未除温度）
S = i @ t.T
print("相似度矩阵 S:\n", np.round(S, 3))
# [[0.905 0.365]
#  [0.3   0.815]]

# 用手算的温度 τ=0.5
loss = clip_loss(i, t, temperature=0.5)
print("损失 (τ=0.5):", round(loss, 3))   # 应 ≈ 0.299

# 用 CLIP 默认温度 τ=0.07（更尖锐）
loss_default = clip_loss(i, t, temperature=0.07)
print("损失 (τ=0.07):", round(loss_default, 3))   # 应更小，因为分布更尖锐
```

### 用 Hugging Face 加载真实 CLIP 做零样本分类

```python
from transformers import CLIPModel, CLIPProcessor
import torch
from PIL import Image

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 一张狗的照片
image = Image.open("dog.jpg")
labels = ["a photo of a dog", "a photo of a cat", "a photo of a car"]

inputs = processor(text=labels, images=image, return_tensors="pt", padding=True)
outputs = model(**inputs)

logits_per_image = outputs.logits_per_image      # 图像与每个文字标签的相似度
probs = logits_per_image.softmax(dim=1)          # 归一化

for label, p in zip(labels, probs[0]):
    print(f"{label}: {p.item():.3f}")
# "a photo of a dog" 的概率应该最高
```

---

## 6. 为什么有效：零样本迁移

CLIP 最惊艳的能力是**零样本分类**：不用任何微调，直接对任意类别做分类。

```
给一张图，让它和 N 个文字模板算相似度：
  "a photo of a {类别}"   （{类别} 可以是任意词）

选相似度最高的类别 → 就是预测结果
```

**为什么这是革命性的**：

| 传统模型 | CLIP |
|----------|------|
| 只能分训练时见过的 1000 类 | 任意文字都能当标签 |
| 换任务要重新微调 | 换个 prompt 就行 |
| 标签无语义 | "狗"和"犬"天然相关 |

> 💡 CLIP 证明了一个深层的观点：**自然语言是比 one-hot 标签丰富得多的监督信号**。4 亿个图文对的"弱监督"，效果超过了精心标注的 ImageNet。这也是后续 GPT-4V、Qwen-VL 等所有 VLM 的哲学起点。

---

## 7. 局限与后继

| 局限 | 说明 | 后继解决 |
|------|------|----------|
| 只做对齐，不做生成 | CLIP 只能判断"图文像不像"，不能看图说话 | LLaVA 在 CLIP 基础上加了 LLM |
| 细粒度弱 | 空间定位、计数等能力差 | 后续 VLM 加入更高分辨率 |
| 数据噪声 | 互联网图文对有很多不准确配对 | 数据清洗、更大的模型 |

**CLIP 的定位**：它是**对齐的鼻祖**。后续所有 VLM（LLaVA、Qwen-VL、GPT-4V）的"视觉编码器 + 投影 + LLM"骨架里，**那个"投影层"做的就是 CLIP 对齐这件事**——把视觉特征拉进 LLM 能理解的语义空间。

---

## 📌 本章要点

1. CLIP 用**对比学习**代替分类标签：判断"图文是否配对"，而非"图片是哪一类"
2. 双塔架构：图像编码器 + 文本编码器 → 同一向量空间 → 点积算相似度
3. **InfoNCE 损失** = 相似度矩阵（对角线是正样本）÷ 温度 → 行列双向交叉熵
4. 温度 τ 控制分布尖锐度，越小越敏感
5. 零样本迁移是革命：文字成了开放标签，"a photo of a {任意词}" 就能分类
6. CLIP 是"对齐"的鼻祖，后续 VLM 的投影层都在做同一件事
