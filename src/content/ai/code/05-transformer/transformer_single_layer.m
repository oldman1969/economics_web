% ============================================================
% TRANSFORMER_SINGLE_LAYER.m
% 单层 Transformer（Self-Attention + FFN）前向传播
% 对应 deep-dives/05-Transformer架构.md 第 6 节
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
    Q_h = squeeze(Q_heads(:,h,:));
    K_h = squeeze(K_heads(:,h,:));
    V_h = squeeze(V_heads(:,h,:));

    scores = Q_h * K_h' / sqrt(d_k);  % 缩放

    % softmax 逐行
    scores_shift = scores - max(scores, [], 2);
    weights = exp(scores_shift) ./ sum(exp(scores_shift), 2);

    attn_outputs(:,h,:) = weights * V_h;
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
