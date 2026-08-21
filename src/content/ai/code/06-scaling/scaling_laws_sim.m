% ============================================================
% SCALING_LAWS_SIM.m
% 模拟不同规模的损失曲线, 验证幂律 + Chinchilla 最优分配
% 对应 deep-dives/06-ScalingLaws.md 第 5 节
% ============================================================
clear; clc;

fprintf('=== Scaling Laws 模拟 ===\n\n');

%% 参数设定
N_list = [1e6, 1e7, 1e8, 1e9, 1e10, 1e11];  % 1M → 100B
alpha_N = 0.076;  % Kaplan 的参数指数

%% 模拟损失（给定充足的无限数据）
% L(N) = (N_0 / N)^alpha, N_0 是归一化常数
N_0 = 1e3;  % 使得 L(1e6) ≈ 0.5
L = (N_0 ./ N_list).^alpha_N;

%% 输出
fprintf('参数         损失\n');
fprintf('--------------------------------\n');
for i = 1:length(N_list)
    if N_list(i) >= 1e9
        fprintf('%.1fB       %.4f\n', N_list(i)/1e9, L(i));
    else
        fprintf('%.1fM       %.4f\n', N_list(i)/1e6, L(i));
    end
end

%% Chinchilla 最优分配
fprintf('\n--- Chinchilla 最优分配 ---\n');
C_values = [1e21, 1e22, 1e23, 1e24];  % FLOPs
fprintf('\n计算量      最优参数    最优数据\n');
fprintf('--------------------------------\n');
for i = 1:length(C_values)
    N_opt = 0.6 * C_values(i)^0.46;
    D_opt = 6.0 * C_values(i)^0.54;
    ratio = D_opt / N_opt;
    fprintf('%.0e  %.1fB     %.0fB tokens  (%d:1)\n', ...
        C_values(i), N_opt/1e9, D_opt/1e9, round(ratio));
end

%% 可视化
figure('Position', [100 100 800 350]);
subplot(1,2,1);
loglog(N_list, L, 'b-o', 'LineWidth', 2, 'MarkerSize', 8);
xlabel('参数 N'); ylabel('损失 L'); title('幂律: L(N) ∝ N^{-\alpha}');
grid on;

subplot(1,2,2);
C = logspace(20, 25, 50);
N_opt_all = 0.6 * C.^0.46;
D_opt_all = 6.0 * C.^0.54;
loglog(C, N_opt_all, 'b-', C, D_opt_all, 'r--', 'LineWidth', 2);
xlabel('计算量 C (FLOPs)'); ylabel('最优规模');
legend('参数', '数据', 'Location', 'northwest');
title('Chinchilla: 参数与数据等比增长');
grid on;
