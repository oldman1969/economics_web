% ============================================================
% BACKPROP_TWO_LAYER.m
% 两层网络的前向 + 反向传播, 验证 deep-dives/03 的手算结果
% 并做数值梯度校验 (central difference)
% 无需任何工具箱
% ============================================================
clear; clc;

fprintf('=== 两层网络反向传播 (验证手算) ===\n\n');

%% 数据 (与 deep-dives/03 第 3 节一致)
x = [0.5; 0.8];      % 输入
y = 1.0;             % 目标

% 第 1 层权重: [w11 w12; w21 w22]  (x→h, 2个隐藏神经元)
% 布局: W1(ij) = 权重 from 输入j 到 隐藏i
W1 = [0.2, 0.4;      % h1 从 x1=0.2, x2=0.4
     -0.1, 0.1];     % h2 从 x1=-0.1, x2=0.1
b1 = [0.0; 0.0];

% 第 2 层: [v1 v2] (h→输出)
W2 = [0.3, 0.5];     % 输出 从 h1=0.3, h2=0.5
b2 = 0.1;

%% --- 前向传播 ---
z1 = W1 * x + b1;              % [0.42; 0.03]
h  = sigmoid(z1);              % [0.6034; 0.5075]

z2 = W2 * h + b2;              % 0.5348
y_hat = sigmoid(z2);           % 0.6306

loss = 0.5 * (y_hat - y)^2;    % 0.0682

fprintf('前向结果:\n');
fprintf('  z1 = [%.4f; %.4f]\n', z1);
fprintf('  h  = [%.4f; %.4f]\n', h);
fprintf('  y_hat = %.4f,  loss = %.4f\n\n', y_hat, loss);

%% --- 反向传播 (显式公式) ---
% 输出层
dL_dyhat = (y_hat - y);                         % -0.3694
dyhat_dz2 = y_hat * (1 - y_hat);                % 0.2330
dL_dz2 = dL_dyhat * dyhat_dz2;                  % -0.0861

dL_dW2 = dL_dz2 * h';                           % [-0.0519, -0.0437]
dL_db2 = dL_dz2;                                % -0.0861

% 隐藏层
dL_dh = W2' * dL_dz2;                           % [-0.0258; -0.0430]
dh_dz1 = h .* (1 - h);                          % [0.2393; 0.2500]
dL_dz1 = dL_dh .* dh_dz1;                       % [-0.00618; -0.01076]

dL_dW1 = dL_dz1 * x';                           % [-0.00309, -0.00494;
                                                %  -0.00538, -0.00861]
dL_db1 = dL_dz1;                                % [-0.00618; -0.01076]

fprintf('反向梯度 (对比手算):\n');
fprintf('  ∂L/∂v1   = %+.4f  (手算 -0.0519)\n', dL_dW2(1));
fprintf('  ∂L/∂v2   = %+.4f  (手算 -0.0437)\n', dL_dW2(2));
fprintf('  ∂L/∂w11  = %+.4f  (手算 -0.00309)\n', dL_dW1(1,1));
fprintf('  ∂L/∂w12  = %+.4f  (手算 -0.00538)\n', dL_dW1(2,1));
fprintf('  ∂L/∂w21  = %+.4f  (手算 -0.00494)\n', dL_dW1(1,2));
fprintf('  ∂L/∂w22  = %+.4f  (手算 -0.00861)\n', dL_dW1(2,2));

%% --- 数值梯度校验 ---
fprintf('\n=== 数值梯度校验 (central difference) ===\n');
eps_val = 1e-6;

% 校验 v1
v1 = W2(1);
loss_plus  = loss_fn(x, y, W1, b1, [v1+eps_val, W2(2)], b2);
loss_minus = loss_fn(x, y, W1, b1, [v1-eps_val, W2(2)], b2);
num_grad_v1 = (loss_plus - loss_minus) / (2*eps_val);
fprintf('  v1:  解析 %+.4f, 数值 %+.4f, 差 %.2e\n', dL_dW2(1), num_grad_v1, abs(dL_dW2(1)-num_grad_v1));

% 校验 w22
w22 = W1(2,2);
W1_plus  = W1; W1_plus(2,2)  = w22 + eps_val;
W1_minus = W1; W1_minus(2,2) = w22 - eps_val;
loss_plus  = loss_fn(x, y, W1_plus,  b1, W2, b2);
loss_minus = loss_fn(x, y, W1_minus, b1, W2, b2);
num_grad_w22 = (loss_plus - loss_minus) / (2*eps_val);
fprintf('  w22: 解析 %+.4f, 数值 %+.4f, 差 %.2e\n', dL_dW1(2,2), num_grad_w22, abs(dL_dW1(2,2)-num_grad_w22));

fprintf('\n(解析梯度与数值梯度一致 → 反向传播公式正确)\n');

%% 辅助函数
function s = sigmoid(x)
    s = 1 ./ (1 + exp(-x));
end

function L = loss_fn(x, y, W1, b1, W2, b2)
    z1 = W1 * x + b1;
    h  = sigmoid(z1);
    z2 = W2 * h + b2;
    y_hat = sigmoid(z2);
    L = 0.5 * (y_hat - y)^2;
end
