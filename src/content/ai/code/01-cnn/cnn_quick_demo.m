% ============================================================
% CNN_QUICK_DEMO.m
% 极简演示：一个卷积 + 池化的前向传播，数值手算可验证
% 对应 deep-dives/01-CNN深度解剖.md 第 9.7 节
% 无需任何工具箱
% ============================================================
clear; clc;

fprintf('=== CNN 前向传播快速演示 ===\n\n');

% --- 输入: 5×5 灰度图 ---
X = [1 2 3 1 0;
     4 5 6 1 0;
     7 8 9 1 0;
     1 1 1 1 0;
     0 0 0 0 0];
fprintf('输入图像 X (5×5):\n');
disp(X);

% --- 卷积核: 3×3 竖边检测器 ---
K = [1 0 -1;
     1 0 -1;
     1 0 -1];
fprintf('\n卷积核 K (竖边检测器):\n');
disp(K);

% --- 卷积 (stride=1, no padding) ---
H_out = size(X,1) - size(K,1) + 1;
W_out = size(X,2) - size(K,2) + 1;
conv_out = zeros(H_out, W_out);

for i = 1:H_out
    for j = 1:W_out
        patch = X(i:i+2, j:j+2);
        conv_out(i,j) = sum(patch .* K, 'all');
    end
end

fprintf('\n卷积输出 (3×3):\n');
disp(conv_out);

% --- ReLU ---
relu_out = max(0, conv_out);
fprintf('\nReLU 后:\n');
disp(relu_out);

% --- 最大池化 (2×2, stride=1) ---
pool_out = zeros(2,2);
for i = 1:2
    for j = 1:2
        pool_out(i,j) = max(relu_out(i:i+1, j:j+1), [], 'all');
    end
end

fprintf('\n最大池化后 (2×2):\n');
disp(pool_out);

fprintf('\n结论: 竖边检测器在输入中部的竖边缘处产生最大的激活值。\n');
fprintf('      经过池化后，最强的信号被保留下来。\n');
