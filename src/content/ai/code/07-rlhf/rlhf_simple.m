% ============================================================
% RLHF_SIMPLE.m
% 两步简化 RLHF: 训练奖励模型 + 带 KL 的 PPO 更新
% 对应 deep-dives/07-RLHF的数学.md 第 6 节
% ============================================================
clear; clc;

fprintf('=== 简化 RLHF 演示 ===\n\n');

%% 第 2 步模拟: 训练奖励模型 (简化: 直接优化 Bradley-Terry)
fprintf('--- 奖励模型训练 ---\n');
% 3 个人类排序对
pairs = [
    2.5, 1.0;   % pair1: 好回答得分 2.5, 坏回答得分 1.0
    3.0, 2.0;   % pair2
    1.8, 1.7;   % pair3 (difficult case)
    ];

% 损失: -log(sigmoid(r_w - r_l))
diffs = pairs(:,1) - pairs(:,2);
loss_rm = -mean(log(sigmoid(diffs)));

fprintf('pair 差异: [%.1f, %.1f, %.1f]\n', diffs);
fprintf('RM 损失: %.4f\n', loss_rm);
fprintf('(pair3 差异小 → 贡献大损失 → 模型被 push 拉开差距)\n');

%% 第 3 步模拟: PPO 更新 (极简)
fprintf('\n--- PPO 更新 ---\n');
beta = 0.1;  % KL 惩罚系数
epsilon = 0.2;  % PPO clip

% 假设对 2 个 token 的策略
pi_old = [0.5, 0.5];    % SFT 策略（旧策略）
pi_new = [0.3, 0.7];    % 当前策略
rewards = [1.0, -1.0];  % 奖励模型打分

ratio = pi_new ./ pi_old;
fprintf('ratio = [%.2f, %.2f]\n', ratio);

% 未裁剪目标
L_unclip = ratio .* rewards;
% 裁剪目标
L_clip = min(max(ratio, 1-epsilon), 1+epsilon) .* rewards;
% PPO 取 min
L_ppo = min(L_unclip, L_clip);

fprintf('L_unclip = [%.2f, %.2f]\n', L_unclip);
fprintf('L_clip   = [%.2f, %.2f]\n', L_clip);
fprintf('L_ppo    = [%.2f, %.2f]\n', L_ppo);

% KL 惩罚
kl = sum(pi_new .* log(pi_new ./ pi_old));
fprintf('\nKL(π_new || π_old) = %.4f\n', kl);

final_obj = sum(L_ppo) - beta * kl;
fprintf('最终目标 = %.4f + PPO - %.4f×KL = %.4f\n', sum(L_ppo), beta, final_obj);

%% 辅助函数
function y = sigmoid(x)
    y = 1 ./ (1 + exp(-x));
end
