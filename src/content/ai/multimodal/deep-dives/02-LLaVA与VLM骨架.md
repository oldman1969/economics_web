# LLaVA 与 VLM 骨架——把 CLIP + CNN + Transformer 串成完整 VLM

> LLaVA（Large Language and Vision Assistant，威斯康星 2023）是第一个用"视觉编码器 + 投影层 + LLM"极简拼出视觉语言模型的工作。它的价值不在性能最强，而在**架构最清晰**——吃透它，你就看懂了 GPT-4V、Qwen-VL、InternVL 等所有 VLM 的共同骨架。

> 📖 论文：Liu et al., *Visual Instruction Tuning*, NeurIPS 2023。

---

## 目录

1. [核心思想：把图像变成 LLM 能读的"外语"](#1-核心思想把图像变成-llm-能读的外语)
2. [三件套架构：视觉编码器 + 投影层 + LLM](#2-三件套架构视觉编码器--投影层--llm)
3. [架构详解：图像怎么变成 token 序列](#3-架构详解图像怎么变成-token-序列)
4. [投影层：CLIP 对齐的落点](#4-投影层clip-对齐的落点)
5. [两阶段训练](#5-两阶段训练)
6. [手算：投影层维度变换 + token 拼接](#6-手算投影层维度变换--token-拼接)
7. [代码：从零理解 + 真实调用](#7-代码从零理解--真实调用)
8. [为什么这是"最小骨架"](#8-为什么这是最小骨架)
9. [局限与后继](#9-局限与后继)

---

## 1. 核心思想：把图像变成 LLM 能读的"外语"

LLaVA 的核心洞察一句话：

> **LLM 只会读 token，那就把图像也变成 token，拼进它的输入里。**

类比：LLM 是一个只会说中文的人，现在要它"看懂"英文文档。怎么办？**先把英文翻译成中文**，再交给它读。LLaVA 做的就是这样一件事：

```
图像（"英文"）→ 视觉编码器 + 投影层（"翻译"）→ 图像 token（"中文"）→ 拼进 LLM 输入
```

> 💡 这个"翻译"过程 = 把图像特征映射到 LLM 的词嵌入空间。翻译器（投影层）不需要很大，因为视觉编码器已经提取好了图像特征，LLM 已经学会了语言——**只需要一个"接口"把两者接起来**。

---

## 2. 三件套架构：视觉编码器 + 投影层 + LLM

```
图像 ──→ [视觉编码器] ──→ 图像特征 ──→ [投影层] ──→ 图像 token ─┐
                                                                  ├→ [LLM] ──→ 文本输出
文本 ──→ [词嵌入] ──→ 文本 token ─────────────────────────────────┘
```

| 部件 | LLaVA 用什么 | 作用 | 你已有的知识 |
|------|-------------|------|-------------|
| 视觉编码器 | CLIP 的 ViT-L/14（**冻结**） | 图像 → 网格特征 | [CLIP](../deep-dives/01-CLIP深度解剖.md)、ViT |
| 投影层 | 一个线性层（MLP） | 把视觉特征映射到 LLM 词嵌入维度 | **CLIP 对齐的落点** |
| LLM | Vicuna（LLaMA 微调版） | 理解和生成 | [Transformer](../ai_theory/deep-dives/05-Transformer架构.md) |

**三个部件都是现成的**：视觉编码器用 CLIP 训练好的，LLM 用现成的大模型，只有中间的**投影层是新增的**。这就是"最小骨架"的含义——用最少的改动把两套成熟系统拼起来。

---

## 3. 架构详解：图像怎么变成 token 序列

### 3.1 完整数据流

以 LLaVA 的默认配置（336×336 图像，ViT-L/14）为例：

```
① 图像切块
   336×336 的图像，patch 大小 14×14
   → 24×24 = 576 个 patch

② ViT 编码
   每个 patch 展平成向量，加 [CLS] token，过 ViT
   → 输出 576 个 patch 特征，每个 1024 维

③ 投影层
   1024 维 → 4096 维（LLM 词嵌入维度）
   → 576 个"图像 token"，每个 4096 维

④ 拼接
   [图像 token ×576] + [文本 token ×N] → 一个长序列

⑤ LLM 自回归生成
   LLM 处理整个序列，生成回答
```

### 3.2 关键点：图像 token 和文本 token 地位平等

在 LLM 眼里，**图像 token 和文本 token 没有任何区别**——都是 4096 维的向量。这就是为什么 LLM 能"看"图：它本来就会处理 token 序列，现在只是序列前面多了一串"来自图像的 token"。

> 💡 这是 ViT（2020）留下的遗产：ViT 证明了"图像 patch 可以当 token 处理"，LLaVA 只是把这个思想用在了"图像 + 文本"的混合序列上。

---

## 4. 投影层：CLIP 对齐的落点

回顾你刚学的 [CLIP](../deep-dives/01-CLIP深度解剖.md)：CLIP 用对比学习把图像和文字拉进**同一向量空间**。

LLaVA 的投影层做的其实是**同一件事的简化版**：

| | CLIP | LLaVA 投影层 |
|---|---|---|
| 目标 | 让图像和文字向量"靠在一起" | 让图像特征进入 LLM 的词嵌入空间 |
| 做法 | 对比学习（训练两个编码器） | 一个线性层（训练投影矩阵） |
| 为什么够用 | — | 因为视觉编码器和 LLM 都已训练好，只需对齐维度 |

> 💡 关键区别：CLIP 需要**从头训练**两个编码器来对齐；LLaVA 的视觉编码器和 LLM 都已经是"专家"了，所以投影层只需一个**线性变换**就能对齐——这就是"最小骨架"能成立的根本原因。

---

## 5. 两阶段训练

LLaVA 的训练分两步，先对齐特征，再学指令：

### 阶段一：特征对齐（只训投影层）

- **冻结**视觉编码器和 LLM，**只训练投影层**
- 数据：约 60 万对（图像，描述文字）
- 任务：看图说话（"描述这张图"）
- 目标：让投影层学会"把图像特征翻译成 LLM 能理解的 token"

### 阶段二：端到端指令微调

- **解冻**全部，训练投影层 + LLM
- 数据：约 15 万条多模态指令（视觉问答、图像描述、图文推理）
- 目标：让模型学会"看图回答问题"，而不只是描述

> 💡 阶段一 = "先教会翻译"，阶段二 = "再教会用翻译做任务"。这个两阶段的思路，和后训练里的"先 SFT 再 RL"（见 [learn_agent/07](../learn_agent/07-模型后训练.md)）是一脉相承的——先立"形"（对齐），再追"神"（能力）。

---

## 6. 手算：投影层维度变换 + token 拼接

### 6.1 设定（简化）

- 视觉特征维度 = 2（实际是 1024）
- LLM 词嵌入维度 = 3（实际是 4096）
- 一张图切成 2 个 patch（实际 576 个）

### 6.2 投影层：一个线性变换

投影层权重 W（2×3）：

```
W = ┌         ┐
    │ 1  0  1 │
    │ 0  1  1 │
    └         ┘
```

一个 patch 的视觉特征 v = [2, 1]：

```
图像 token = v · W = [2, 1] · ┌         ┐
                              │ 1  0  1 │
                              │ 0  1  1 │
                              └         ┘

= [2×1+1×0,  2×0+1×1,  2×1+1×1]
= [2,  1,  3]
```

所以这个 patch 从 2 维视觉特征变成了 3 维"图像 token"——**现在它和 LLM 的词嵌入同维度，可以拼进输入了**。

### 6.3 token 拼接

假设文本 "描述这张图" 有 4 个 token（每个也是 3 维，简化）：

```
文本 token: t₁ t₂ t₃ t₄

拼接后的输入序列（LLM 看到的）:
[图像token₁] [图像token₂] [t₁] [t₂] [t₃] [t₄] [生成开始...]

      ↑ 图像部分（2个token）      ↑ 文本部分（4个token）
```

LLM 对它们一视同仁，逐个自回归生成回答。**这就是 VLM 的全部机制**——图像 token 和文本 token 拼成一个序列，喂给同一个 Transformer。

---

## 7. 代码：从零理解 + 真实调用

### 7.1 概念性实现（理解骨架）

```python
import torch
import torch.nn as nn

class MiniLLaVA(nn.Module):
    """极简 VLM 骨架，对应 LLaVA 的三件套"""
    def __init__(self, vision_dim, llm_dim):
        super().__init__()
        # 投影层：把视觉特征映射到 LLM 词嵌入维度
        self.proj = nn.Linear(vision_dim, llm_dim)

    def forward(self, vision_features, text_tokens):
        """
        vision_features: 图像 patch 特征 (num_patches × vision_dim)
        text_tokens:     文本 token 嵌入 (num_text_tokens × llm_dim)
        """
        # ① 投影：视觉特征 → LLM 嵌入维度
        image_tokens = self.proj(vision_features)  # (num_patches × llm_dim)

        # ② 拼接：图像 token + 文本 token
        combined = torch.cat([image_tokens, text_tokens], dim=0)

        # ③ 喂给 LLM（此处省略，实际是自回归 Transformer）
        # output = self.llm(combined)
        return combined

# ==== 验证第 6 节的手算 ====
proj = nn.Linear(2, 3, bias=False)  # 无偏置，对应手算
proj.weight.data = torch.tensor([[1.0, 0.0, 1.0],
                                 [0.0, 1.0, 1.0]])

v = torch.tensor([[2.0, 1.0]])      # 1 个 patch，2 维特征
image_token = proj(v)
print("图像 token:", image_token)   # 应输出 [2, 1, 3]，与手算一致
```

### 7.2 用 Hugging Face 加载真实 LLaVA

```python
from transformers import LlavaForConditionalGeneration, LlavaProcessor
from PIL import Image
import torch

model = LlavaForConditionalGeneration.from_pretrained(
    "llava-hf/llava-1.5-7b-hf", torch_dtype=torch.float16)
processor = LlavaProcessor.from_pretrained("llava-hf/llava-1.5-7b-hf")

image = Image.open("example.jpg")
prompt = "<image>\nUSER: 这张图里有什么？\nASSISTANT:"

inputs = processor(text=prompt, images=image, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=100)
print(processor.decode(outputs[0], skip_special_tokens=True))
```

---

## 8. 为什么这是"最小骨架"

LLaVA 之所以成为"教科书级"的 VLM，是因为它揭示了一个反直觉的事实：

> **你不需要重新设计一个新架构，只需要把两个现成的组件（CLIP 视觉编码器 + LLM）用一个线性层粘起来。**

| 组件 | 是否新训练 |
|------|-----------|
| 视觉编码器（CLIP ViT） | ❌ 现成，冻结 |
| LLM（Vicuna） | ❌ 现成，阶段二才微调 |
| 投影层（一个 MLP） | ✅ 唯一新增，阶段一训练 |

**这个骨架的威力**：后续几乎所有的开源 VLM（Qwen-VL、InternVL、Pixtral、MiniGPT-4）都是在这个三件套上改进——换更强的视觉编码器、换更大的 LLM、把投影层从线性换成更复杂的 Q-Former……但**骨架不变**。

---

## 9. 局限与后继

| 局限 | 说明 | 后继改进 |
|------|------|----------|
| 分辨率受限 | 早期 LLaVA 只支持 336×336 | 后续支持更高分辨率、动态切块 |
| 投影层太简单 | 单个线性层对齐能力有限 | Q-Former（BLIP-2）、更多层投影 |
| 只做图文 | 不支持视频、语音 | Omni 模型（GPT-4o） |
| 幻觉 | 可能"看图编造" | 更高质量指令数据、更强 LLM |

**后继路线**：
- **BLIP-2**：把线性投影换成 Q-Former（可学习的查询聚合器）
- **Qwen-VL**：原生高分辨率 + 多语言 + 更强的 LLM
- **InternVL**：自研视觉编码器 + 大规模数据

---

## 10. 与你已学知识的连接

| LLaVA 概念 | 你已学的 |
|-----------|----------|
| 视觉编码器（ViT/CLIP） | [CLIP 深度解剖](../deep-dives/01-CLIP深度解剖.md) |
| 图像 patch 当 token | [多模态发展史](../history/多模态发展史.md)（ViT 一节） |
| LLM 自回归 | [Transformer](../ai_theory/deep-dives/05-Transformer架构.md) |
| 两阶段训练 | [learn_agent/07 模型后训练](../learn_agent/07-模型后训练.md)（先形后神） |
| 投影层 = 对齐 | [注意力机制](../ai_theory/deep-dives/04-注意力机制.md)（Q·Kᵀ 本质） |

---

## 📌 本章要点

1. LLaVA 核心思想：**把图像变成 token，拼进 LLM 输入**（"翻译成外语"）
2. 三件套：视觉编码器（冻结）+ 投影层（唯一新增）+ LLM——最小骨架
3. 图像 token 和文本 token 在 LLM 眼里**地位平等**，都是向量
4. 投影层 = CLIP 对齐的简化版：视觉编码器和 LLM 都训练好了，只需一个线性层对齐维度
5. 两阶段训练：先对齐特征（只训投影层），再学指令（端到端）
6. 几乎所有后续 VLM 都是在这个骨架上改进——**骨架不变**
