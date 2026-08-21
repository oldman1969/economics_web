% ============================================================
% ROPE_DEMO.m
% RoPE 实现 + 外推崩溃演示
% 对应 deep-dives/09-RoPE与位置编码.md 第 6 节
% ============================================================
clear; clc;

fprintf('=== RoPE 旋转位置编码 ===\n\n');

%% 参数
d = 64;           % 维度
base = 10000;
max_train_len = 4096;
max_test_len = 32768;  % 外推 8 倍

%% 构造 RoPE 频率
freqs = 1 ./ (base .^ ((0:2:d-2) / d));  % 1×32 (每对一个频率)

%% 给定位置, 生成的 RoPE 旋转矩阵 (以 cos/sin 形式)
rope_cache_train = precompute_rope(max_train_len, freqs);
rope_cache_test  = precompute_rope(max_test_len,  freqs);

%% 测试: 同一个 token 向量, 在训练范围 vs 外推范围
rng(42);
q = randn(d, 1) * 0.1;

% 在训练最大位置 (pos=4096) 旋转
q_4096 = apply_rope(q, 4096, rope_cache_train);

% 在外推位置 (pos=32768) 旋转
q_32768 = apply_rope(q, 32768, rope_cache_test);

% 比较两个旋转后的向量
cos_sim = dot(q_4096, q_32768) / (norm(q_4096) * norm(q_32768));
fprintf('训练位置 4096 vs 外推位置 32768 旋转后余弦相似度: %.4f\n', cos_sim);
fprintf('→ 如果接近 0 或随机, 说明位置编码完全变了 (模型崩溃)\n');

%% 位置插值方案: scale=4096/32768=0.125
fprintf('\n--- 位置插值 (PI) ---\n');
scale = max_train_len / max_test_len;
pos_scaled = round(32768 * scale);
q_scaled = apply_rope(q, pos_scaled, rope_cache_train);

cos_sim_pi = dot(q_4096, q_scaled) / (norm(q_4096) * norm(q_scaled));
fprintf('外推+PI 缩放后与训练 4096 的相似度: %.4f\n', cos_sim_pi);
fprintf('→ PI 把旋转"拉回"训练范围内\n');

%% 辅助函数
function cache = precompute_rope(max_len, freqs)
    pos = (0:max_len-1)';
    angles = pos * freqs;  % (max_len × d/2)
    cache.cos = cos(angles);
    cache.sin = sin(angles);
end

function x_rot = apply_rope(x, pos, cache)
    % x: d×1, pos: 1-indexed 位置
    d = length(x);
    x_rot = x;
    for i = 1:2:d-1
        pair_idx = (i+1)/2;
        c = cache.cos(pos+1, pair_idx);
        s = cache.sin(pos+1, pair_idx);
        x1 = x(i); x2 = x(i+1);
        x_rot(i)   = x1 * c - x2 * s;
        x_rot(i+1) = x1 * s + x2 * c;
    end
end
