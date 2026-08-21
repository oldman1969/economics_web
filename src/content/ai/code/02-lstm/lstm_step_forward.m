function [h, c, cache] = lstm_step_forward(x, h_prev, c_prev, W, b)
% LSTM_STEP_FORWARD 单步 LSTM 前向传播
% 对应 deep-dives/02-LSTM深度解剖.md 第 6.1 节
%
% 输入:
%   x:     输入向量 (D×1)
%   h_prev: 上一隐藏状态 (H×1)
%   c_prev: 上一细胞状态 (H×1)
%   W: 权重结构体, 含 W_f, W_i, W_g, W_o (各 H×(H+D))
%   b: 偏置结构体, 含 b_f, b_i, b_g, b_o (各 H×1)
%
% 输出:
%   h:     新隐藏状态 (H×1)
%   c:     新细胞状态 (H×1)
%   cache: 中间值, 供反向传播用

% 拼接 [h_{t-1}; x_t]
concat = [h_prev; x];
H = length(h_prev);

% --- 四个门 ---
cache.z_f = W.W_f * concat + b.b_f;
cache.f   = 1 ./ (1 + exp(-cache.z_f));  % sigmoid (遗忘门)

cache.z_i = W.W_i * concat + b.b_i;
cache.i   = 1 ./ (1 + exp(-cache.z_i));  % sigmoid (输入门)

cache.z_g = W.W_g * concat + b.b_g;
cache.g_tilde = tanh(cache.z_g);         % tanh (候选值)

cache.z_o = W.W_o * concat + b.b_o;
cache.o   = 1 ./ (1 + exp(-cache.z_o));  % sigmoid (输出门)

% --- 细胞状态更新 ---
c = cache.f .* c_prev + cache.i .* cache.g_tilde;

% --- 隐藏状态 ---
cache.tanh_c = tanh(c);
h = cache.o .* cache.tanh_c;

% 保存反向传播所需中间值
cache.h_prev = h_prev;
cache.c_prev = c_prev;
cache.c      = c;
cache.concat = concat;
end
