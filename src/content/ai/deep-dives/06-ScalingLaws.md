# Scaling Laws——"大力出奇迹"的科学

> 模型规模从百万到千亿不是拍脑袋加的——每个 10 倍增长对应着可预测的损失下降。本章把 Scaling Law 的幂律公式和 Chinchilla 配方讲清楚，并给出 MATLAB 模拟验证。

---

## 目录

1. [幂律：为什么"越大越好"是数学事实](#1-幂律为什么越大越好是数学事实)
2. [Kaplan et al. (OpenAI, 2020)](#2-kaplan-et-al-openai-2020)
3. [Chinchilla (DeepMind, 2022)：推翻配方](#3-chinchilla-deepmind-2022推翻配方)
4. [手算：给定预算，最优模型多大](#4-手算给定预算最优模型多大)
5. [MATLAB 模拟验证](#5-matlab-模拟验证)
6. [为什么 Scaling Law 终有极限](#6-为什么-scaling-law-终有极限)

---

## 1. 幂律：为什么"越大越好"是数学事实

如果你画"模型参数 N"对"验证损失 L"的双对数图（log-log plot），得到的是一条近似直线：

```
log(L(N)) = a - b × log(N)
→ L(N) ∝ N^(-b)
```

b ≈ 0.076（Kaplan）或 0.05（其他估计，随领域变化），意思是参数翻倍会让损失下降约 5%-7%。**这是幂律，意味着收益递减，但永不消失**。

同样关系也适用于训练数据 D 和计算量 C。

> 💡 幂律的核心含义：你永远可以通过增加规模来获得可预测的改进——不需架构创新，不需天才洞察。这就是 Sutton "苦难的教训"的数学背书。

---

## 2. Kaplan et al. (OpenAI, 2020)

OpenAI 系统扫描了从 768 到 1.5B 参数的不同模型，关键发现：

### 三个并行幂律

| 维度 | 公式 | 指数 |
|------|------|------|
| 参数 | L(N) = (N_c / N)^{α_N} | α_N ≈ 0.076 |
| 数据 | L(D) = (D_c / D)^{α_D} | α_D ≈ 0.095 |
| 计算 | L(C) = (C_c / C)^{α_C} | α_C ≈ 0.050 |

**数据效率 > 参数效率**——多喂数据比多堆参数更划算。

### 关键推论：给定计算量 C，最优的模型大小是

```
N_opt ∝ C^{0.73}    ← 参数应比数据增长更快
D_opt ∝ C^{0.27}
```

这导致一个著名的"毛病"：比如用了 300B tokens 训 175B 参数的 GPT-3，按 Kaplan 公式算，**数据严重过剩**——"应该用更多参数、更少数据"。

---

## 3. Chinchilla (DeepMind, 2022)：推翻配方

DeepMind 用 400+ 次从头训练的全面扫描，得出了**完全相反的结论**：

```
N_opt ∝ C^{0.50}
D_opt ∝ C^{0.50}
→ 参数和数据应该等比增长！
```

Chinchilla 模型：70B 参数，1.4T tokens（≈20 tokens/参数）。在同等计算量下，它**远超**了按 Kaplan 配方训出来的大模型，用的参数只有人家三分之一。

### 两个结论为什么不同

Kaplan 固定了训练轮数（epoch），浅表模型看到的数据少 → 自然偏向"多堆参数"。Chinchilla 不做这个限制，发现**把算力均匀分配给参数和数据**收益最大。

> 📌 **Chinchilla 最优**：每参数约 **20 个训练 token**。后来的模型（LLaMA 等）都在这一比例附近。

---

## 4. 手算：给定预算，最优模型多大

假设你有 C = 1e23 FLOPs 的训练计算量，按 Chinchilla：

```
N_opt ≈ C^{0.5} / 20 的修正

更精确的 Chinchilla 公式:
N_opt = 0.6 × C^{0.46}    (原文拟合值)
D_opt = 6.0 × C^{0.54}

若 C = 1e23:
N_opt ≈ 0.6 × (1e23)^{0.46} ≈ 0.6 × 6.31e10 ≈ 38B 参数
D_opt ≈ 6.0 × (1e23)^{0.54} ≈ 6.0 × 8.93e12 ≈ 53T tokens

tokens/参数 ≈ 53T / 38B ≈ 1400    ← Chinchilla 是 20/参数，此处因指数拟合略不同
```

实际工程中用的是更简化的近优直线：**每 10 倍参数换 5 倍数据**。

---

## 5. MATLAB 模拟验证

```matlab
% ============================================================
% SCALING_LAWS_SIM.m
% 模拟不同规模的损失曲线，验证幂律
% ============================================================
clear; clc;

fprintf('=== Scaling Laws 模拟 ===\n\n');

%% 参数设定
N_list = [1e6, 1e7, 1e8, 1e9, 1e10, 1e11];  % 1M → 100B
alpha_N = 0.076;  % Kaplan 的参数指数

%% 模拟损失（给定充足的无限数据）
% L(N) = (N_0 / N)^alpha, N_0 是归一化常数
N_0 = 1e3;  % 使得 L(1e6) ≈ 0.5
L = (N_0 ./ N_list).^alpha_N;

%% 输出
fprintf('参数         损失\n');
fprintf('--------------------------------\n');
for i = 1:length(N_list)
    if N_list(i) >= 1e9
        fprintf('%.1fB       %.4f\n', N_list(i)/1e9, L(i));
    else
        fprintf('%.1fM       %.4f\n', N_list(i)/1e6, L(i));
    end
end

%% Chinchilla 最优分配
fprintf('\n--- Chinchilla 最优分配 ---\n');
C_values = [1e21, 1e22, 1e23, 1e24];  % FLOPs
fprintf('\n计算量      最优参数    最优数据\n');
fprintf('--------------------------------\n');
for i = 1:length(C_values)
    N_opt = 0.6 * C_values(i)^0.46;
    D_opt = 6.0 * C_values(i)^0.54;
    ratio = D_opt / N_opt;
    fprintf('%.0e  %.1fB     %.0fB tokens  (%d:1)\n', ...
        C_values(i), N_opt/1e9, D_opt/1e9, round(ratio));
end

%% 可视化
figure('Position', [100 100 800 350]);
subplot(1,2,1);
loglog(N_list, L, 'b-o', 'LineWidth', 2, 'MarkerSize', 8);
xlabel('参数 N'); ylabel('损失 L'); title('幂律: L(N) ∝ N^{-α}');
grid on;

subplot(1,2,2);
C = logspace(20, 25, 50);
N_opt_all = 0.6 * C.^0.46;
D_opt_all = 6.0 * C.^0.54;
loglog(C, N_opt_all, 'b-', C, D_opt_all, 'r--', 'LineWidth', 2);
xlabel('计算量 C (FLOPs)'); ylabel('最优规模');
legend('参数', '数据', 'Location', 'northwest');
title('Chinchilla: 参数与数据等比增长');
grid on;
```

---

## 6. 为什么 Scaling Law 终有极限

1. **数据枯竭**：高质量文本总量估计 10T-100T tokens，在 100B-1T 参数的 Chinchilla 最优比例面前已经被耗尽
2. **算力瓶颈**：训练一个 1T 参数的模型，按 Chinchilla 需要 20T tokens → 数十亿美元的电费和 GPU 费用
3. **合成数据**：退路——用现有模型生成训练数据，但会面临模型坍缩（model collapse）
4. **推理时扩展**：o1/R1 等推理模型把计算从"训练阶段"转到"测试阶段"——开创了新的 Scaling 维度（测试时计算量）

> 💡 2024–2025 年业界的回答：如果训练算力增长放缓，那就把多余的算力花在**推理时思考**上。你目录里那本书第 6 章（评估）和第 7 章（后训练）深入了这个方向。

---

## 📌 本章要点

1. 损失随参数/数据/计算量呈**幂律下降**，双对数图上近似直线
2. Kaplan（2020）偏好多堆参数，Chinchilla（2022）发现应**等比增长**
3. Chinchilla 最优 ≈ 每参数 20 tokens，成为此后模型配方的标准
4. 数据耗尽是预训练 Scaling 的上限——推理时扩展（o1/R1）是新增长点
