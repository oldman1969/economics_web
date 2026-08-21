# 《理解深度学习》Simon J.D. Prince —— 导读与交叉映射

> 这是整个项目的**数学底座**。你的 notes（历史脉络）和 deep-dives（技术吃透）偏"直觉 + 手算 + 代码"，而 Prince 这本书补的是**严谨的数学定义和推导**。三者配合：历史告诉你"为什么出现"，手算让你"会用"，Prince 给你"数学上站得住"。

---

## 一、这本书是什么

| 项 | 说明 |
|---|---|
| 作者 | Simon J.D. Prince（前伦敦大学学院，现巴思大学名誉教授） |
| 原版 | *Understanding Deep Learning*, MIT Press, 2023 年 12 月，544 页 |
| 中文版 | 《理解深度学习》，清华大学出版社，2025 年 |
| 官方免费版 | udlbook.github.io（作者公开全书 PDF 和幻灯片） |
| 定位 | 深度学习**数学基础**教科书，从监督学习一路讲到扩散模型、强化学习 |

> ✅ **全文已就位**：英文原版 PDF（2026-02-08 修订版，22.3 MB）已提取到references 目录 `udl_full.txt`（约 1.34 MB / 16209 行），21 章 + 3 附录完整。后续回答 Prince 书内容的问题，直接 grep/read `udl_full.txt` 即可，无需重复解析 PDF。

---

## 二、全书 21 章 + 3 附录

### 第一部分：基础（Ch.1–9）

| 章 | 标题 | 一句话内容 | 对应你的项目 |
|---|---|---|---|
| 1 | Introduction | 什么是深度学习，三大模型类别（监督/无监督/强化） | 主线导引 |
| 2 | Supervised learning | 监督学习、回归/分类、训练与推理 | notes-01 |
| 3 | Shallow neural networks | 浅层网络、万能近似定理 | notes-01 感知机 |
| 4 | Deep neural networks | 深层网络、层数堆叠 | notes-01/02 |
| 5 | Loss functions | 最大似然、交叉熵、MSE 的统一视角 | deep-dives-03 |
| 6 | Fitting models | 梯度下降、SGD、动量、学习率调度 | deep-dives-03 |
| 7 | Gradients and initialization | **反向传播的完整推导** + 初始化 | **deep-dives-03 反向传播** |
| 8 | Measuring performance | 训练/验证/测试集、超参数搜索 | notes-06 评估 |
| 9 | Regularization | L2、Dropout、早停、数据增强 | notes-02 Dropout |

### 第二部分：现代架构（Ch.10–13）

| 章 | 标题 | 一句话内容 | 对应你的项目 |
|---|---|---|---|
| 10 | Convolutional networks | 卷积层、池化、感受野 | **deep-dives-01 CNN** |
| 11 | Residual networks | ResNet、BatchNorm、残差连接 | notes-03 ResNet |
| 12 | Transformers | **自注意力、QKV、多头、位置编码** | **deep-dives-05 Transformer** |
| 13 | Graph neural networks | 图结构上的深度学习 | （项目未覆盖） |

### 第三部分：无监督与生成模型（Ch.14–18）

| 章 | 标题 | 一句话内容 | 对应你的项目 |
|---|---|---|---|
| 14 | Unsupervised learning | 聚类、主成分、自编码器 | （未覆盖） |
| 15 | GAN | 生成对抗网络 | notes-03 提过 GAN |
| 16 | Normalizing flows | 归一化流 | （未覆盖） |
| 17 | Variational autoencoders | 变分自编码器 | （未覆盖） |
| 18 | Diffusion models | 扩散模型（Sora/DALL·E 的底座） | （未覆盖） |

### 第四部分：进阶与反思（Ch.19–21）

| 章 | 标题 | 一句话内容 | 对应你的项目 |
|---|---|---|---|
| 19 | Reinforcement learning | 马尔可夫决策、策略梯度、**RLHF 的理论根基** | **deep-dives-07 RLHF** |
| 20 | Why does deep learning work? | 泛化、双下降、为什么过参数化仍有效 | notes-05 Scaling |
| 21 | Deep learning and ethics | 偏见、公平、可解释性 | （未覆盖） |

### 附录

| 附录 | 标题 | 用途 |
|---|---|---|
| A | Notation | 符号约定——读数学推导前先看这里 |
| B | Mathematics | 线性代数、微积分、最优化速查 |
| C | Probability | 概率论、贝叶斯、信息论速查 |

---

## 三、交叉映射：你的项目 ↔ Prince 章节

### 3.1 按你的 notes 路线图

| 你的课程 | 主线技术 | 去 Prince 第几章补数学 |
|---|---|---|
| 01 智能的起点 | 感知机、反向传播 | Ch.3（浅层网络）、Ch.7（反向传播推导） |
| 02 漫长的进化 | CNN、LSTM | Ch.10（CNN）；LSTM 见 Ch.12 前的 RNN 铺垫（Prince 对 LSTM 着墨较少） |
| 03 深度学习狂飙 | AlexNet、注意力 | Ch.10-11（CNN/ResNet）、Ch.12（注意力） |
| 04 Transformer | 自注意力 | **Ch.12 完整推导** |
| 05 大模型时代 | Scaling | Ch.20（为什么大模型有效） |
| 06 对齐与 ChatGPT | RLHF | Ch.19（RL 基础）+ 你的 deep-dives-07 |
| 07 长上下文 | RoPE、FlashAttention | Ch.12 位置编码（RoPE 属前沿，Prince 只讲原版） |
| 08 推理与 Agent | ReAct、RL | Ch.19 |

### 3.2 按你的 deep-dives

| deep-dive | Prince 对应章节 | 关系 |
|---|---|---|
| 01 CNN | Ch.10 | **互补**：你讲手算+代码，Prince 给严格定义 |
| 02 LSTM | （散见于 Ch.12 引言） | Prince 略，靠你的笔记 |
| 03 反向传播 | **Ch.7 + 附录 B** | **最佳互补**：你手算，Prince 给矩阵形式推导 |
| 04 注意力 | Ch.12.1–12.2 | 互补 |
| 05 Transformer | Ch.12.3–12.6 | 互补 |
| 06 Scaling Laws | Ch.20 | 你讲现象，Prince 讲泛化理论 |
| 07 RLHF | Ch.19 | 你讲流程，Prince 讲 RL 数学地基 |
| 08 FlashAttention | （Prince 未覆盖） | 你独有（前沿） |
| 09 RoPE | （Prince 未覆盖） | 你独有（前沿） |
| 10 Agent ReAct | （Prince 未覆盖） | 你独有（工程） |

> 💡 一个发现：你的项目在**前沿工程**（FlashAttention、RoPE、Agent）上比 Prince 更新，但 Prince 在**数学严谨性**（矩阵推导、概率视角、泛化理论）和**生成模型**（GAN/VAE/扩散模型，Ch.15-18）上覆盖了你目前空白的地带。

---

## 四、补充学习路径（已补深度解剖）

Prince 覆盖而项目原本空白的 6 块，已全部生成深度解剖（deep-dives/11–16）：

| Prince 章 | 深度解剖 | 核心内容 |
|-----------|----------|----------|
| Ch.5 Loss functions | [11-损失函数](../ai_theory/deep-dives/11-损失函数.md) | 最大似然统一视角，MSE/BCE/交叉熵的构造食谱 |
| Ch.9 Regularization | [12-正则化](../ai_theory/deep-dives/12-正则化.md) | L2 贝叶斯视角、隐式正则化、Dropout |
| Ch.13 Graph neural networks | [13-图神经网络](../ai_theory/deep-dives/13-图神经网络.md) | 消息传递、GCN 对称归一化 |
| Ch.14 Unsupervised learning | [14-无监督学习](../ai_theory/deep-dives/14-无监督学习.md) | 降维/聚类/生成模型地图、PCA 与高斯隐变量 |
| Ch.18 Diffusion models | [15-扩散模型](../ai_theory/deep-dives/15-扩散模型.md) | 加噪→去噪、DDPM 训练目标 |
| Ch.19 Reinforcement learning | [16-强化学习](../ai_theory/deep-dives/16-强化学习.md) | MDP、贝尔曼方程、Q-learning、策略梯度、RLHF 连接 |

### 全书覆盖完成（2026-07-23）

Prince 全书 21 章现已**全部覆盖**：

| Prince 章 | 深度解剖 |
|-----------|----------|
| Ch.6 Fitting models（优化器） | [17-优化器](../ai_theory/deep-dives/17-优化器.md) |
| Ch.15 GAN | [18-GAN](../ai_theory/deep-dives/18-GAN.md) |
| Ch.16 Normalizing flows | [19-归一化流](../ai_theory/deep-dives/19-归一化流.md) |
| Ch.17 VAE | [20-VAE](../ai_theory/deep-dives/20-VAE.md) |
| Ch.21 Ethics | [21-深度学习与伦理](../ai_theory/deep-dives/21-深度学习与伦理.md) |

（Ch.1-9 由 notes/deep-dives 1-3、11-12、17 覆盖；Ch.10-13 由 deep-dives 1、5、13 覆盖；Ch.14-19 由 deep-dives 14-20 覆盖；Ch.20 泛化理论见 deep-dives/06 Scaling Laws。）

---

## 五、如何三者配合使用

```
读历史 → 读 notes（建立时间线，知道每个技术为何出现）
        ↓
吃透技术 → 读 deep-dives（手算 + 代码，会用）
        ↓
数学严谨 → 读 Prince 对应章（矩阵推导，站得住脚）
        ↓
回填项目 → 把 Prince 的严谨推导摘录进对应 deep-dive 的"数学补充"小节
```

**下一步行动**（供选择）：
- 提供 Prince 的 PDF → 我提取全文，据此生成"数学补充"或新 deep-dive
- 直接按上面的空白清单，先补 Ch.5（损失函数）或 Ch.19（RL 数学）的深度解剖
- 继续你原定的 Agent 工程路线
