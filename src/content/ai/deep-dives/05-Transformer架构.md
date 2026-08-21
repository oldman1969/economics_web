# Transformer 架构——逐组件拆解

> notes 里第 4 课讲概念，本节讲**每一行的数学**。读完你应能手写出 Multi-Head Self-Attention 的完整前向和反向代码。

> 🔗 前置阅读：[注意力机制](04-注意力机制.md)（理解 QKV 的起源）

---

## 目录

1. [Self-Attention 和 Cross-Attention：到底有什么不同](#1-self-attention-和-cross-attention-到底有什么不同)
2. [QKV 的完整前向手算](#2-qkv-的完整前向手算)
3. [Multi-Head：一次不够，来 N 次](#3-multi-head一次不够来-n-次)
4. [位置编码：不认顺序的代价](#4-位置编码不认顺序的代价)
5. [残差 + LayerNorm + FFN：一个完整的 Transformer 层](#5-残差--layernorm--ffn一个完整的-transformer-层)
6. [MATLAB：单层 Transformer 前向](#6-matlab单层-transformer-前向)
7. [计算复杂度：O(n²) 到底是怎么来的](#7-计算复杂度on²-到底是怎么来的)

---

## 1. Self-Attention 和 Cross-Attention：到底有什么不同

| | 源 Q 来自 | 源 K/V 来自 | 用途 |
|---|---|---|---|
| **Self-Attention** | 当前序列自己 | 当前序列自己 | 词与词互相看（"它指什么"） |
| **Cross-Attention** | Decoder 的 Q | Encoder 的 K/V | Decoder 查阅源句（翻译） |

GPT 只用 Self-Attention（带因果掩码——只能看当前位置以左）。BERT 用双向 Self-Attention（全连通）。原版 Transformer 的编码器用双向 Self-Attention，解码器用因果 Self-Attention + Cross-Attention。

---

## 2. QKV 的完整前向手算

### 2.1 设定

```
序列长度 n=3, 嵌入维度 d_model=4
输入矩阵 X (3×4):
    ┌          ┐
    │ 1  0  1  0 │  ← token "我"
    │ 0  1  0  1 │  ← token "爱"
    │ 1  1  0  1 │  ← token "你"
    └          ┘

权重矩阵 (4×4, 为手算简化为 0/1):
W_Q = diag([1,1,1,1]) = 单位阵 I₄  (为简化)
W_K = I₄
W_V = I₄
(实际训练中随机初始化)
```

### 2.2 生成 Q、K、V

```
Q = X × W_Q = X  (因为 W_Q = I₄)

Q (3×4):
┌          ┐
│ 1 0 1 0 │  ← q₁ ("我"要查什么)
│ 0 1 0 1 │  ← q₂ ("爱"要查什么)
│ 1 1 0 1 │  ← q₃ ("你"要查什么)
└          ┘
K 和 V 同样 = X
```

### 2.3 计算注意力分数：Q × Kᵀ

```
Q × Kᵀ (3×3):

q₁·k₁ = 1+0+1+0 = 2      q₁·k₂ = 0+0+0+0 = 0      q₁·k₃ = 1+0+0+0 = 1
q₂·k₁ = 0+1+0+0 = 1      q₂·k₂ = 0+1+0+1 = 2      q₂·k₃ = 0+1+0+1 = 2
q₃·k₁ = 1+1+0+0 = 2      q₃·k₂ = 0+1+0+0 = 1      q₃·k₃ = 1+1+0+1 = 3

Scores = ┌       ┐
         │ 2 0 1 │  ← "我"的视角：最像自己(2),最不像"爱"(0)
         │ 1 2 2 │  ← "爱"的视角：分布较均匀
         │ 2 1 3 │  ← "你"的视角：最像自己(3,因为有额外1)
         └       ┘
```

### 2.4 缩放：÷ √d_k

d_k = 4, √4 = 2：

```
Scores / 2 = ┌          ┐
             │ 1.0 0 0.5 │
             │ 0.5 1 1.0 │
             │ 1.0 0.5 1.5│
             └          ┘
```

### 2.5 Softmax（逐行）

```
行1: exp(1.0)=2.718, exp(0)=1, exp(0.5)=1.649, sum=5.367
     α₁ = [0.506, 0.186, 0.307]

行2: exp(0.5)=1.649, exp(1)=2.718, exp(1)=2.718, sum=7.085
     α₂ = [0.233, 0.384, 0.384]

行3: exp(1)=2.718, exp(0.5)=1.649, exp(1.5)=4.482, sum=8.849
     α₃ = [0.307, 0.186, 0.507]

Attention Weight = ┌                ┐
                   │ 0.506 0.186 0.307 │
                   │ 0.233 0.384 0.384 │
                   │ 0.307 0.186 0.507 │
                   └                ┘
```

### 2.6 加权取 V

```
Output = Attention × V (V = X):

o₁ = 0.506×[1,0,1,0] + 0.186×[0,1,0,1] + 0.307×[1,1,0,1]
   = [0.506+0+0.307, 0+0.186+0.307, 0.506+0+0, 0+0.186+0.307]
   = [0.813, 0.493, 0.506, 0.493]

o₂ = 0.233×[1,0,1,0] + 0.384×[0,1,0,1] + 0.384×[1,1,0,1]
   = [0.233+0+0.384, 0+0.384+0.384, 0.233+0+0, 0+0.384+0.384]
   = [0.617, 0.768, 0.233, 0.768]

o₃ = 0.307×[1,0,1,0] + 0.186×[0,1,0,1] + 0.507×[1,1,0,1]
   = [0.307+0+0.507, 0+0.186+0.507, 0.307+0+0, 0+0.186+0.507]
   = [0.814, 0.693, 0.307, 0.693]

Output = ┌              ┐
         │ 0.813 0.493 0.506 0.493 │  ← "我"的新表示（融入了上下文）
         │ 0.617 0.768 0.233 0.768 │  ← "爱"的新表示
         │ 0.814 0.693 0.307 0.693 │  ← "你"的新表示
         └              ┘
```

> 💡 **"我"的变化**：原始向量 [1,0,1,0] 变成了 [0.813, 0.493, 0.506, 0.493]——"我"从相邻的"你"那里少量借了信息(dim2 从 0 涨到 0.493, dim4 同样)。"你"因为也看"爱"和"我"，自身的 dim1(原始 1)从 1 降到了 0.814。**这就是自注意力的本质：每个词的表示被上下文"调和"了。**

---

## 3. Multi-Head：一次不够，来 N 次

单头只能学一种"注意力模式"（比如语法）。多头 = 给模型开多个平行的视角：

```
MultiHead(X) = Concat(head₁, head₂, ..., head_h) × W_O

其中 head_i = Attention(X·W_Q^i, X·W_K^i, X·W_V^i)
```

W_Q^i、W_K^i、W_V^i 把 X 投影到 d_model/h 维（例如 512/8=64）——每个头在自己的低维子空间里做注意力，互不干扰。最终拼接后投影回 d_model。

**直觉**：
- 头 1 可能学了"动词离主语多远"（语法结构）
- 头 2 学了"代词→名词"（指代消解）
- 头 3 学了"下一个词可能是什么"（语言建模）
- ……

都在一次前向里并行完成。

> ⚠️ **常见误区**：多头不是因为 512 维太大算不动才分 8 个 64 维——而是**语义上有多种不同的"相关"需要辨别**。如果全混在一个空间里求点积，它们互相干扰。

---

## 4. 位置编码：不认顺序的代价

没有位置编码，"狗咬人"和"人咬狗"的 Attention 矩阵完全相同（只是 K/V 的词变了，但 Q 也会跟着变……停下来想一想：是的，如果不加位置信息，词序是完全丢失的）。

### 4.1 正弦位置编码（原版）

```
PE(pos, 2i)   = sin(pos / 10000^{2i/d_model})
PE(pos, 2i+1) = cos(pos / 10000^{2i/d_model})
```

低频（i 小）→ 波长长（可能超过总序列长度 → 全局位置标识）；高频（i 大）→ 波长短（捕捉局部相邻关系）。

> ⚠️ 正弦编码外推性差的原因（hook 到第七课 RoPE）：训练时见过的最远位置是 512，给位置 10000 的正弦值模型从未见过，注意力直接炸掉。RoPE 把绝对位置变成相对旋转，缓解了这个问题。

---

## 5. 残差 + LayerNorm + FFN：一个完整的 Transformer 层

```
子层1: X → MultiHead(LayerNorm(X)) + X          ← 残差连接
子层2: X → FFN(LayerNorm(X)) + X                 ← 残差连接

其中 FFN(X) = ReLU(X·W₁ + b₁)·W₂ + b₂
或现代版: SwiGLU(X·W_gate) ⊙ (X·W_up) 后投影
```

- **残差**：让梯度无损穿过注意力层，深层能训练
- **LayerNorm**：稳定训练（对每个样本的特征维度归一化，而非对 batch）
- **Pre-Norm vs Post-Norm**：原论文是 Post-Norm（残差后再归一化），后来的大模型全部改为 Pre-Norm（归一化后再做注意力/FFN）——训练更稳定

---

## 6. MATLAB：单层 Transformer 前向

```matlab
% ============================================================
% TRANSFORMER_SINGLE_LAYER.m
% 单层 Transformer（Self-Attention + FFN）前向传播
% 可对照第 2 节的手算结果
% ============================================================
clear; clc;

fprintf('=== 单层 Transformer 前向 ===\n\n');

%% 参数
d_model = 4;
n_heads = 2;       % 2 个头
d_k = d_model / n_heads;  % 每个头 2 维
seq_len = 3;

%% 输入（同第 2 节）
X = [1 0 1 0;
     0 1 0 1;
     1 1 0 1];  % 3×4

%% 初始化权重（为与手算对比，用单位阵）
W_Q = eye(d_model);
W_K = eye(d_model);
W_V = eye(d_model);
W_O = eye(d_model);

%% 1. 生成 Q, K, V
Q = X * W_Q;  % 3×4
K = X * W_K;
V = X * W_V;

%% 2. 拆成多头（2头×2维）
Q_heads = reshape(Q, seq_len, n_heads, d_k);
K_heads = reshape(K, seq_len, n_heads, d_k);
V_heads = reshape(V, seq_len, n_heads, d_k);

%% 3. 每个头做 Scaled Dot-Product Attention
attn_outputs = zeros(seq_len, n_heads, d_k);

for h = 1:n_heads
    % Q_h: 3×2, K_h: 3×2
    scores = Q_heads(:,h,:) * reshape(K_heads(:,h,:), d_k, seq_len);
    scores = scores / sqrt(d_k);  % 缩放

    % softmax 逐行
    weights = exp(scores - max(scores,[],2)) ./ sum(exp(scores - max(scores,[],2)), 2);

    attn_outputs(:,h,:) = weights * reshape(V_heads(:,h,:), seq_len, d_k);
end

%% 4. 拼接 + 投影
concat = reshape(attn_outputs, seq_len, d_model);  % 3×4
attn_out = concat * W_O;

fprintf('注意力输出:\n');
disp(attn_out);

%% 5. FFN (简化: 一层非线性)
W1 = eye(d_model) * 0.5;  b1 = zeros(1, d_model);
W2 = eye(d_model);        b2 = zeros(1, d_model);

ffn_out = max(0, attn_out * W1 + b1) * W2 + b2;

%% 6. 残差连接
output = X + attn_out + ffn_out;

fprintf('\n最终输出 (残差+注意力+FFN):\n');
disp(output);
```

---

## 7. 计算复杂度：O(n²) 到底是怎么来的

```
Q·Kᵀ: (n×d) × (d×n)  → 计算量 O(n²·d)  → 产生 n×n 矩阵
softmax: O(n²)
×V: (n×n) × (n×d)    → O(n²·d)
```

**总计算量**：O(n²·d)，其中 n 是序列长度，d 是维度。

| n | n² (打分表大小) | 注意 |
|---|---------------|------|
| 512 | 262k | 原版 Transformer |
| 4K | 16M | |
| 128K | 16.4B | FlashAttention 使可行 |
| 1M | 1T | 极限（≈第七课的标题） |

n² 就是后续所有长上下文工程的核心约束。FlashAttention、稀疏注意力、Mamba……本质上都在和这个 n² 博弈。

---

## 📌 本章要点

1. Self-Attention 让每个词"读"所有词，Cross-Attention 让 decoder 读 encoder
2. QKV = 投影 + 点积评分 + softmax 权重 + 加权取 V
3. 多头 = 多个并行语义视角，不是算力的妥协
4. 残差 + LayerNorm + FFN 构成每个 Transformer 层的骨架
5. O(n²) 是唯一的阿克琉斯之踵，也是第七课一切优化的靶心
