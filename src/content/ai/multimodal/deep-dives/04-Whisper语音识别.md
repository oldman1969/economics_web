# Whisper 语音识别——音频怎么变成 token

> Whisper（OpenAI 2022）是语音识别（ASR，Automatic Speech Recognition）的工业标准。它回答了一个和 ViT 对称的问题：**图像能切成 patch 当 token，那音频（一维波形）怎么变成 token？** 答案是：先变成一张"声音的图"（频谱图），再当图像处理。这一篇拆开讲这条链路。

> 📖 论文：Radford et al., *Robust Speech Recognition via Large-Scale Weak Supervision*, ICML 2023。

---

## 目录

1. [核心思想：端到端语音识别](#1-核心思想端到端语音识别)
2. [关键第一步：语音 → "声音的图"（log-Mel 频谱图）](#2-关键第一步语音--声音的图log-mel-频谱图)
3. [Whisper 架构：编码器-解码器 Transformer](#3-whisper-架构编码器-解码器-transformer)
4. [从频谱图到 token：卷积 stem](#4-从频谱图到-token卷积-stem)
5. [多任务与特殊 token](#5-多任务与特殊-token)
6. [手算：波形 → 帧](#6-手算波形--帧)
7. [代码：从零理解 + 真实调用](#7-代码从零理解--真实调用)
8. [与你已学知识的连接](#8-与你已学知识的连接)

---

## 1. 核心思想：端到端语音识别

### 1.1 传统 ASR 的复杂流水线

你已在 [多模态发展史](../history/多模态发展史.md) 学过：传统 GMM-HMM 语音识别要手工拼装多个模块：

```
音频 → 声学模型(音素) → 发音词典 → 语言模型 → 文本
        ↑GMM-HMM       ↑人工维护  ↑N-gram
```

每个模块都要**单独训练、手工调试**，且需要音素标注、发音词典等大量人工。

### 1.2 Whisper 的端到端方案

Whisper 用一个 Transformer，直接从音频到文本：

```
音频 → 频谱图 → 一个 Transformer → 文本
```

**不需要**音素标注、发音词典、语言模型——全是模型自己学的。这和你熟悉的 ViT/LLaVA 思路一致：**用 Transformer 取代手工模块**。

---

## 2. 关键第一步：语音 → "声音的图"（log-Mel 频谱图）

这是理解 Whisper 最关键的认知：**音频本来是一维的（波形），但 ASR 先把它变成一张二维的"图"**。

### 2.1 原始波形（一维）

声音是空气振动的采样，每秒采样 16000 次（16kHz），每个采样是一个振幅值：

```
波形: [0.02, 0.05, -0.03, -0.01, 0.04, ...]  （一维数字序列）
```

一维序列**没有直接的"频率"概念**——你看到一串数字，不知道里面是低音还是高音。

### 2.2 短时傅里叶变换（STFT）：加入频率维度

用**滑动窗口**切波形，每个窗口做傅里叶变换，得到"这个窗口里各频率的能量"：

```
波形 ──滑动窗口──→ 每个窗口 → FFT → 频率能量
                              (横轴:频率, 纵轴:能量)

把每个窗口的频率能量竖着排 → 一张二维图：
    横轴 = 时间（窗口序号）
    纵轴 = 频率
    亮度 = 能量
```

### 2.3 Mel 滤波器组 + log：贴合人耳

- **Mel 尺度**：人耳对低频敏感、对高频迟钝，Mel 滤波器组按人耳感知方式对频率分组
- **log**：能量范围太大（差几个数量级），取对数压缩

**最终产物**：一张 **80×T 的 log-Mel 频谱图**（80 个频率通道 × T 个时间帧），本质就是一张"声音的图像"。

> 💡 **核心洞察**：为什么 ASR 能用 Transformer？因为**频谱图是一张二维图**，和图像是同一类东西。图像是"宽×高×RGB"，频谱图是"时间×频率×能量"。所以后面可以用处理图像的方法（卷积 + Transformer）处理它。

---

## 3. Whisper 架构：编码器-解码器 Transformer

Whisper 用的是**编码器-解码器**架构（原版 Transformer 的结构，而非 GPT 的解码器-only）：

```
频谱图 ──→ [编码器] ──→ 音频表示 ──→ [解码器] ──→ 文本 token
                                        ↑
                              （自回归，逐 token 生成）
```

| 部件 | 作用 | 对应你学过的 |
|------|------|-------------|
| 编码器 | 读入整张频谱图，提取音频特征 | BERT 的编码器（双向） |
| 解码器 | 自回归生成文本 token | GPT 的解码器（因果） |

> 💡 Whisper 是少数用**编码器-解码器**的大模型（大多数 LLM 是 decoder-only）。因为语音识别是"输入音频→输出文本"的序列到序列任务，编码器读音频、解码器写文本，分工清晰。

---

## 4. 从频谱图到 token：卷积 stem

对应 ViT 的 **Patch Embedding**，Whisper 用**两层卷积**（conv stem）把频谱图下采样成 token：

```
80×T 频谱图
  → 卷积层 1（stride=1，GELU）
  → 卷积层 2（stride=2）→ 下采样 2 倍
  → 输出的每个位置 = 一个 token，喂给 Transformer 编码器
```

**为什么用卷积而不是像 ViT 那样直接切块？** 因为频谱图有**局部结构**（相邻时间-频率区域相关），卷积能利用这个局部性。但思想上和 ViT 的 Patch Embedding 完全一致：**把二维输入变成 token 序列**。

> 💡 对称之美：ViT 用"切块 + 投影"把图像变 token，Whisper 用"卷积下采样"把频谱图变 token——**殊途同归，都是"二维输入 → 一维 token 序列"**。

---

## 5. 多任务与特殊 token

Whisper 的一个巧妙设计：用**特殊 token** 在解码器开头指定任务和语言：

```
解码器输入: <|transcribe|> <|en|> [音频表示]  → 输出英文转写
           <|translate|>  <|zh|> [音频表示]  → 输出中文翻译
           <|transcribe|> <|zh|> [音频表示]  → 输出中文转写
```

一个模型同时做**转写、翻译、语言识别**等多个任务——这是它"弱监督训练"能成功的关键：68 万小时互联网音频+文字对，统一成这种"任务 token + 音频 + 文字"的格式。

---

## 6. 手算：波形 → 帧

（完整的 FFT/Mel 数学较深，这里手算**最关键的"分帧"步骤**，它把一维波形变成二维的雏形。）

### 6.1 设定：16 个采样点的波形

```
波形 x = [1, 3, 5, 3, 1, -1, -3, -1, 1, 3, 5, 3, 1, -1, -3, -1]
```

### 6.2 分帧（窗口大小 4，步长 hop=4）

```
帧 1: [1, 3, 5, 3]      ← 时刻 0~3
帧 2: [1, -1, -3, -1]   ← 时刻 4~7
帧 3: [1, 3, 5, 3]      ← 时刻 8~11
帧 4: [1, -1, -3, -1]   ← 时刻 12~15
```

### 6.3 每帧算"能量"（傅里叶变换的极简版）

真实系统对每帧做 FFT 得到各频率能量，这里简化为"帧的平方和"（总能量）作为示意：

```
帧 1 能量 = 1² + 3² + 5² + 3² = 1 + 9 + 25 + 9 = 44
帧 2 能量 = 1² + 1² + 3² + 1² = 1 + 1 + 9 + 1 = 12
帧 3 能量 = 44（同帧 1）
帧 4 能量 = 12（同帧 2）
```

于是波形变成了一个"时间×能量"的二维表示：

```
时间轴:  帧1    帧2    帧3    帧4
能量:    44     12     44     12
```

> 💡 这就是频谱图的雏形——**一维波形 → 二维（时间×频率/能量）**。真实系统对每帧算的不只是一个总能量，而是 80 个 Mel 频段的能量，所以得到的是 80 维的"高"图，而不是这里 1 维的示意。

---

## 7. 代码：从零理解 + 真实调用

### 7.1 概念性实现：波形 → 分帧 → 能量

```python
import numpy as np

def frame_energy(waveform, frame_size=4, hop=4):
    """极简示意：把一维波形分成帧，每帧算能量（真实系统用 FFT+Mel）"""
    frames = []
    for i in range(0, len(waveform) - frame_size + 1, hop):
        frame = waveform[i:i+frame_size]
        energy = np.sum(frame ** 2)   # 简化：总能量代替频率能量
        frames.append(energy)
    return frames

# ==== 验证第 6 节的手算 ====
x = np.array([1, 3, 5, 3, 1, -1, -3, -1, 1, 3, 5, 3, 1, -1, -3, -1])
print("每帧能量:", frame_energy(x))   # 应输出 [44, 12, 44, 12]
```

### 7.2 真实频谱图（用 librosa）

```python
import librosa
import numpy as np

# 加载音频
y, sr = librosa.load("audio.wav", sr=16000)  # 16kHz

# 计算 log-Mel 频谱图（Whisper 用的就是 80 通道）
mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=80)
log_mel = np.log(mel + 1e-9)  # log 压缩

print("频谱图形状:", log_mel.shape)  # (80, T) = 80 频率 × T 时间帧
# 这张"图"就是 Whisper 的输入
```

### 7.3 用 Hugging Face 加载真实 Whisper

```python
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import librosa

model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small")
processor = WhisperProcessor.from_pretrained("openai/whisper-small")

y, sr = librosa.load("audio.wav", sr=16000)
inputs = processor(y, sampling_rate=16000, return_tensors="pt")

generated = model.generate(**inputs)
print(processor.decode(generated[0]))  # 输出转写文本
```

---

## 8. 与你已学知识的连接

| Whisper 概念 | 你已学的 |
|-------------|----------|
| 编码器-解码器架构 | [Transformer 架构](../ai_theory/deep-dives/05-Transformer架构.md)（原版结构） |
| 频谱图 → token（卷积 stem） | [ViT](03-ViT视觉编码器.md)（Patch Embedding 的对称） |
| 二维输入 → 一维 token | [ViT](03-ViT视觉编码器.md)、[LLaVA](02-LLaVA与VLM骨架.md) |
| 语音发展史 | [多模态发展史](../history/多模态发展史.md)（语音线） |
| 全双工（后续） | [learn_agent/09](../learn_agent/09-多模态与实时交互.md) |

---

## 📌 本章要点

1. Whisper 是端到端 ASR：一个 Transformer 直接从音频到文本，取代 GMM-HMM 的复杂流水线
2. **关键第一步**：一维波形 → 二维 log-Mel 频谱图（STFT + Mel + log）——"声音的图像"
3. 频谱图是二维的，所以能像图像一样用卷积 + Transformer 处理
4. 架构是编码器-解码器（编码器读频谱图，解码器写文本），少数用 encoder-decoder 的大模型
5. 卷积 stem 把频谱图下采样成 token，对应 ViT 的 Patch Embedding——**殊途同归**
6. 特殊 token（<|transcribe|> <|en|>）实现多任务多语言，是弱监督训练的关键
