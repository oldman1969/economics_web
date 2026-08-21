% ============================================================
% ATTENTION_BAHDANAU.m
% Bahdanau 加法注意力——手算验证 + 点积注意力对比
% 对应 deep-dives/04-注意力机制.md 第 5 节
% ============================================================
clear; clc;

fprintf('=== Bahdanau 注意力机制 ===\n\n');

%% 数据（同第 3 节）
H = [1 3 0 2 1;      % h₁ 到 h₅ (2×5)
     0 1 2 3 1];
s_t = [2; 1];         % decoder 当前状态 (2×1)

% 注意力参数
W_a = [0.5, -0.3, 0.8, 0.2];  % 1×4 (s_t:2 + h_j:2 = 4)

T = size(H, 2);  % encoder 位置数
e = zeros(1, T);

%% 计算每个位置的得分
fprintf('注意力得分 e_j:\n');
for j = 1:T
    concat = [s_t; H(:,j)]';         % 1×4
    score  = W_a * concat';          % 标量
    e(j)   = score;
    fprintf('  位置 %d: %.4f\n', j, score);
end
fprintf('\n');

%% Softmax → 注意力权重
e_exp = exp(e);
alpha = e_exp / sum(e_exp);

fprintf('注意力权重 α:\n');
for j = 1:T
    fprintf('  α_%d = %.4f\n', j, alpha(j));
end

%% 上下文向量
c_t = H * alpha';
fprintf('\n上下文向量 c_t = [%.4f, %.4f]\n', c_t(1), c_t(2));

%% 验证：改用简化版点积注意力
fprintf('\n--- 对比：点积注意力 ---\n');
e_dot = s_t' * H;   % 1×5: 直接用内积算得分
alpha_dot = softmax(e_dot);
c_dot = H * alpha_dot';
fprintf('点积注意力 c_t = [%.4f, %.4f]\n', c_dot(1), c_dot(2));

fprintf('\n加法注意力的 c_t 更"锐利"（对 decoder 状态敏感）\n');
fprintf('点积注意力的 c_t 更"平滑"，但可以全部并行计算\n');

%% 辅助: softmax
function y = softmax(x)
    x_s = x - max(x);
    y = exp(x_s) / sum(exp(x_s));
end
