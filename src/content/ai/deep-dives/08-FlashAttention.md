# FlashAttention——IO 意识的计算革命

> 不是"近似注意力"也不是"跳过某层"——FlashAttention 在数学上精确等价于标准注意力，只改变**计算的物理位置**。答案是：快 2-4 倍，省 O(n²) 显存。本质是**不搬运完整的 n×n 注意力矩阵到 HBM**。

---

## 目录

1. [GPU 内存架构：为什么"搬数据"比"算"贵](#1-gpu-内存架构为什么搬数据比算贵)
2. [标准注意力的 IO 浪费](#2-标准注意力的-io-浪费)
3. [Tiling：分块算、边算边扔](#3-tiling分块算边算边扔)
4. [Online Softmax：不需要两遍扫描](#4-online-softmax不需要两遍扫描)
5. [手算：一个 4×4 的 Tiling 示例](#5-手算一个-4×4-的-tiling-示例)
6. [MATLAB：模拟 Tiling 注意力](#6-matlab模拟-tiling-注意力)
7. [FlashAttention-2/3 的改进](#7-flashattention-23-的改进)

---

## 1. GPU 内存架构：为什么"搬数据"比"算"贵

GPU 有两层内存：

| 层级 | 名称 | 容量 | 带宽 | 延迟 |
|------|------|------|------|------|
| SRAM | 片上缓存 / Shared Memory | 几十 MB (A100: 192KB/SM×108) | TB/s | ~20 cycles |
| HBM | 显存 (High Bandwidth Memory) | 80GB (A100) | ~2TB/s | ~300 cycles |

**关键**: 把数据从 HBM 搬到 SRAM 的能量消耗，**是执行一次浮点运算的 200-500 倍**。

注意力算的是：

```
S = Q × Kᵀ → P = softmax(S) → O = P × V
```

标准实现把整个 S(n×n) 写入 HBM，再读回来做 softmax，再写回去，再读回来乘 V。**三次完整遍历 HBM**，每次都在跑 200× 的搬砖税。

---

## 2. 标准注意力的 IO 浪费

```
标准流程:
1. Load Q, K from HBM → compute S → write S to HBM (n×n float32!)
2. Load S from HBM → softmax → write P to HBM
3. Load P, V from HBM → compute O → write O to HBM

总 HBM I/O ≈ O(n²·d) ← 受 S 矩阵支配
算术运算 ≈ O(n²·d)  ← 同样 O(n²·d)
```

但硬件上，**ALU 每秒能算 312 TFLOPS，HBM 每秒只搬 ~2 TB**。真正的 bottleneck 不是 ALU——是 HBM 带宽。FlashAttention 的核心思路：**在 SRAM 里边算边扔，绝不让完整的 S 矩阵落地 HBM**。

---

## 3. Tiling：分块算、边算边扔

```
Q = [Q₁]  (B×d)    ← Q 分成小块
    [Q₂]

K = [K₁, K₂]  (d×2B)  ← K 分成小块

不一次性算 Q×Kᵀ(完整 n×n)，而是:
  Block 1: 在 SRAM 内算 S₁₁=Q₁×K₁ᵀ → softmax → ×V₁ → 部分O₁
  Block 2: 在 SRAM 内算 S₁₂=Q₁×K₂ᵀ → softmax → ×V₂ → 累加到O₁
  ...
  O₁ 完成后写回 HBM（O 的大小是 n×d，是 n² 的 d/n 分之一）
```

**每个 block 只在 SRAM 里暂存其局部 S**，算完就扔——S 永远不写成完整的 n×n 矩阵。

---

## 4. Online Softmax：不需要两遍扫描

常规 softmax 需要三次扫描：找 max → 算 exp → 除以 sum。

Online softmax 用增量更新：

```
传统: max_all = max(x); sum_all = Σ exp(x_i - max); y = exp(x_j-max)/sum
Online: 边扫边更新 m(当前max) 和 l(当前sum)，结束时一次归一化

对于 tiling:
Block₁: m₁ = max(S₁), l₁ = Σ exp(S₁ - m₁)
Block₂: m_new = max(m₁, max(S₂))
        l_new = l₁×exp(m₁-m_new) + Σ exp(S₂ - m_new)
        (用新 max 修正之前的 sum，两遍扫描合并为一遍)
```

这是 FlashAttention 的**核心技术**——使得 O(n²) 的 softmax 可以和 Q×Kᵀ 的逐块计算完全融合，不需要先算完所有 S 再做 softmax。

---

## 5. 手算：一个 4×4 的 Tiling 示例

```
Q (4×2)         K (4×2)         V (4×2)
[1 0]           [1 1]           [2 1]
[0 1]           [0 2]           [1 0]
[2 0]           [2 0]           [0 2]
[0 2]           [1 3]           [1 1]

d=2, n=4, block size B=2 (每次处理 2 行 Q)
```

**Block 1**: Q_rows 1-2 vs K_rows 1-4

```
S₁ = Q[1:2] × Kᵀ = [1 0; 0 1] × [1 0 2 1; 1 2 0 3]ᵀ
   = [1×1+0×1, 1×0+0×2, 1×2+0×0, 1×1+0×3;
      0×1+1×1, 0×0+1×2, 0×2+1×0, 0×1+1×3]
   = [1, 0, 2, 1;
      1, 2, 0, 3]

Online softmax (第一行):
  m₁=2, l₁=exp(1-2)+exp(0-2)+exp(2-2)+exp(1-2) = 0.368+0.135+1+0.368 = 1.871
  P₁ = [0.197, 0.072, 0.534, 0.197]  (exp(S₁ⱼ-2)/1.871)

O₁_partial = P₁ × V = [0.197×2+0.072×1+0.534×0+0.197×1,
                        0.197×1+0.072×0+0.534×2+0.197×1]ᵀ
           = [0.663, 1.462]ᵀ
```

**Block 2**: Q_rows 3-4 vs K_rows 1-4，类似处理后与 Block1 结果合并（实际实现中各自独立输出，因为不同 Q 行互不影响——这是 Q 轴分块的内在原因）。

> 💡 整个过程中，S 从未作为完整 4×4 矩阵落地 HBM——这才是 FlashAttention 的精髓。

---

## 6. MATLAB：模拟 Tiling 注意力

```matlab
% ============================================================
% FLASH_ATTENTION_TILING.m
% 模拟 FlashAttention 的分块计算 (软件层面, 演示算法逻辑)
% ============================================================
clear; clc;

fprintf('=== FlashAttention Tiling 模拟 ===\n\n');

%% 数据
n = 8; d = 4; B = 2;  % 序列长 8, 维度 4, block 大小 2
Q = randn(n, d) * 0.1;
K = randn(n, d) * 0.1;
V = randn(n, d) * 0.1;

%% 标准注意力 (用于验证)
S_full = Q * K' / sqrt(d);
P_full = exp(S_full - max(S_full,[],2)) ./ sum(exp(S_full - max(S_full,[],2)), 2);
O_standard = P_full * V;

%% FlashAttention 风格: Q 按行分块
O_flash = zeros(n, d);

for i_start = 1:B:n
    i_end = min(i_start + B - 1, n);
    Q_block = Q(i_start:i_end, :);  % Q 块 (B×d)

    % 这个 Q 块要依次和所有 K 块交互
    m_i = -inf(i_end-i_start+1, 1);   % 当前 max
    l_i = zeros(i_end-i_start+1, 1);  % 当前 sum(exp)
    O_acc = zeros(i_end-i_start+1, d); % 累积分子

    for j_start = 1:B:n
        j_end = min(j_start + B - 1, n);
        K_block = K(j_start:j_end, :);
        V_block = V(j_start:j_end, :);

        % 局部 S
        S_local = Q_block * K_block' / sqrt(d);  % B×B

        % Online softmax 更新
        m_new = max(m_i, max(S_local, [], 2));
        % 修正旧的累积
        correction = exp(m_i - m_new);
        l_i = l_i .* correction;
        O_acc = O_acc .* correction;

        % 加入当前 block 的 exp(S - m_new)
        S_shifted = exp(S_local - m_new);
        l_i = l_i + sum(S_shifted, 2);
        O_acc = O_acc + S_shifted * V_block;

        m_i = m_new;
    end

    % 最终归一化
    O_flash(i_start:i_end, :) = O_acc ./ l_i;
end

%% 验证
error_max = max(abs(O_standard - O_flash), [], 'all');
fprintf('标准 vs Flash 最大误差: %.2e\n', error_max);
fprintf('(应为机器精度 ~1e-15 —— 数学上精确等价)\n');

fprintf('\nFlash 关键: S 矩阵从未作为 %d×%d 完整矩阵进入内存\n', n, n);
fprintf('           内存占用从 O(%d²) = O(%d) 降到 O(B×%d) = O(%d)\n', n, n^2, n, B*n);
```

---

## 7. FlashAttention-2/3 的改进

| 版本 | 年份 | 关键改进 |
|------|------|----------|
| FA1 | 2022 | 基础 tiling + online softmax；forward pass 加速 |
| FA2 | 2023 | 调优 warp 调度（减少非矩阵乘法时间）、序列维度并行、更好的 occupancy |
| FA3 | 2024 | FP8 支持、异步 softmax、支持 GQA/MQA、Hopper 架构专用 |

---

## 📌 本章要点

1. 注意力 bottleneck 不是 ALU 算力，是 HBM ↔ SRAM 之间的 IO
2. FlashAttention 用 **tiling + online softmax** 让 S 矩阵永不完整落地
3. 数学上精确等价（不是近似！），快 2-4 倍，省 O(n²) 显存
4. 它是长上下文成为可能的第一块基石——没有它，128K 上下文训练寸步难行
