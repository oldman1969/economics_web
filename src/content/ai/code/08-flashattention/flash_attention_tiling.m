% ============================================================
% FLASH_ATTENTION_TILING.m
% 模拟 FlashAttention 的分块计算 (软件层面, 演示算法逻辑)
% 对应 deep-dives/08-FlashAttention.md 第 6 节
% 验证: 分块结果与标准注意力在数学上精确等价
% ============================================================
clear; clc;

fprintf('=== FlashAttention Tiling 模拟 ===\n\n');

%% 数据
n = 8; d = 4; B = 2;  % 序列长 8, 维度 4, block 大小 2
rng(42);
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
