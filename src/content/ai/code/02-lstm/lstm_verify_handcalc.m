% ============================================================
% LSTM_VERIFY_HANDCALC.m
% 用第 4 节手工指定的权重, 跑 LSTM 前向, 对比手算结果
% 对应 deep-dives/02-LSTM深度解剖.md 第 6.4 节
% 需 lstm_step_forward.m 在同目录
% ============================================================
clear; clc;

fprintf('=== LSTM 手算验证 ===\n\n');

% 隐藏维度=2, 输入维度=1
H = 2; D = 1;

% 构造与第 4 节一致的权重
W_val = 0.5 * ones(H, H + D);  % 全 0.5
W.W_f = W_val; W.W_i = W_val;
W.W_g = W_val; W.W_o = W_val;

b.b_f = zeros(H,1); b.b_i = zeros(H,1);
b.b_g = zeros(H,1); b.b_o = zeros(H,1);

h = zeros(H,1); c = zeros(H,1);

for t = 1:3
    x_val = [1, 0, 2];
    x = x_val(t);

    [h, c, cache] = lstm_step_forward(x, h, c, W, b);

    fprintf('t=%d (x=%.0f): h=[%.4f, %.4f], c=[%.4f, %.4f]\n', ...
        t, x, h(1), h(2), c(1), c(2));
end

fprintf('\n对比第 4 节手算结果:\n');
fprintf('t=1 (x=1): 预期 h≈0.174, c≈0.287\n');
fprintf('t=2 (x=0): 预期 h≈0.133, c≈0.249\n');
fprintf('t=3 (x=2): 预期 h≈0.503, c≈0.802\n');
