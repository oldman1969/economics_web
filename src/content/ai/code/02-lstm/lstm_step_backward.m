function [dx, dh_prev, dc_prev, dW, db] = lstm_step_backward(dh, dc, cache, W)
% LSTM_STEP_BACKWARD 单步 LSTM 反向传播
% 对应 deep-dives/02-LSTM深度解剖.md 第 6.2 节
%
% 输入:
%   dh, dc: 从下一时刻/上层传来的梯度 (各 H×1)
%   cache:  前向传播保存的中间值
%   W:      权重结构体
%
% 输出:
%   dx, dh_prev, dc_prev: 传给输入/上一隐藏/上一细胞状态的梯度
%   dW, db:              各门的权重和偏置梯度

H = length(cache.h_prev);

% 输出门梯度
do  = dh .* cache.tanh_c;
dz_o = do .* cache.o .* (1 - cache.o);

% 细胞状态梯度（来自 h 和来自 c 自身）
dc_total = dh .* cache.o .* (1 - cache.tanh_c.^2) + dc;

% 遗忘门梯度
df  = dc_total .* cache.c_prev;
dz_f = df .* cache.f .* (1 - cache.f);

% 输入门梯度
di  = dc_total .* cache.g_tilde;
dz_i = di .* cache.i .* (1 - cache.i);

% 候选值梯度
dg  = dc_total .* cache.i;
dz_g = dg .* (1 - cache.g_tilde.^2);

% --- 累加各门的权重和偏置梯度 ---
dW.W_f = dz_f * cache.concat';
dW.W_i = dz_i * cache.concat';
dW.W_g = dz_g * cache.concat';
dW.W_o = dz_o * cache.concat';

db.b_f = dz_f;
db.b_i = dz_i;
db.b_g = dz_g;
db.b_o = dz_o;

% 传给输入和上一状态
d_concat = W.W_f' * dz_f + W.W_i' * dz_i + W.W_g' * dz_g + W.W_o' * dz_o;
dh_prev  = d_concat(1:H);
dx       = d_concat(H+1:end);

% 传给上一细胞状态
dc_prev = dc_total .* cache.f;
end
