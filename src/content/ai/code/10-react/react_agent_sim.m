% ============================================================
% REACT_AGENT_SIM.m
% 模拟 ReAct Agent 的多轮工具调用循环
% Harness 解析模型输出, 执行工具, 追加观察结果
% 对应 deep-dives/10-Agent ReAct循环.md 第 6 节
% ============================================================
clear; clc;

fprintf('=== ReAct Agent 模拟 ===\n\n');

%% 工具定义
tools.search = @(q) sprintf('搜索结果: "%s" → 珠穆朗玛峰 8848.86m', q);
tools.calculator = @(expr) sprintf('计算结果: %s = %.2f', expr, eval(expr));
tools.weather = @(city) sprintf('%s: 28°C, 晴', city);

%% 模拟的"模型"——简化: 硬编码的 ReAct 推理步骤
steps = {
    struct('thought', '需要查珠穆朗玛峰的高度', ...
           'action', 'search', 'input', '珠穆朗玛峰 海拔'),
    struct('thought', '还要查乞力马扎罗山的高度', ...
           'action', 'search', 'input', '乞力马扎罗山 海拔'),
    struct('thought', '已知: 8848.86m, 5895m, 计算差值', ...
           'action', 'calculator', 'input', '8848.86 - 5895'),
    struct('thought', '结果无误, 准备回答', ...
           'action', 'answer', 'input', '珠穆朗玛峰比乞力马扎罗山高约 2954 米')
};

%% 执行 ReAct 循环
max_steps = 10;
step = 0;

for i = 1:min(length(steps), max_steps)
    s = steps{i};
    step = step + 1;

    fprintf('--- Step %d ---\n', step);
    fprintf('Thought: %s\n', s.thought);
    fprintf('Action: %s("%s")\n', s.action, s.input);

    % 模拟 Harness 执行工具
    if strcmp(s.action, 'answer')
        fprintf('Observation: [任务完成]\n');
        fprintf('\n=== 最终回答 ===\n%s\n', s.input);
        break;
    else
        result = tools.(s.action)(s.input);
        fprintf('Observation: %s\n\n', result);
    end
end

fprintf('\n总步数: %d\n', step);
fprintf('Harness 的作用: 每步解析 Action → 调工具 → 追加 Observation → 回到模型\n');
fprintf('(= Claude Code 内部机制)\n');
