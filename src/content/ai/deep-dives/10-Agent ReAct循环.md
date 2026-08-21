# Agent ReAct 循环——从"思考"到"行动"

> ReAct = **Re**asoning + **A**cting。大模型不是只会聊天——给它工具，它会先想、再做、再看，循环直到任务完成。本章拆解这个循环的每一拍，并给出 MATLAB 模拟。

---

## 目录

1. [ReAct 是什么](#1-react-是什么)
2. [循环结构：Thought → Action → Observation](#2-循环结构thought--action--observation)
3. [与纯 CoT 和纯 Act-only 的对比](#3-与纯-cot-和纯-act-only-的对比)
4. [手算一轮 ReAct 交互](#4-手算一轮-react-交互)
5. [工具调用：模型怎么"动手"](#5-工具调用模型怎么动手)
6. [MATLAB：模拟 ReAct Agent](#6-matlab模拟-react-agent)
7. [ReAct 的工程挑战](#7-react-的工程挑战)

---

## 1. ReAct 是什么

Yao et al. (2022) 提出的范式，核心论文标题就说明了一切：*ReAct: Synergizing Reasoning and Acting in Language Models*。

直觉：你在做一道复杂的数学题时——

- 纯思考（CoT）："首先设 x=...，然后代入...，最后得到..."
- 纯行动："我先拿出计算器算 1234 × 5678……结果是……然后查公式……"
- **ReAct**："先查一下圆的面积公式（行动），公式是 πr²（观察），现在 r=5（思考），所以面积 = π×25，拿计算器：3.14×25=78.5（行动+观察），答案 78.5 平方厘米"

> 💡 ReAct 的本质：**思考生成行动，行动带回信息，信息又更新思考。** 这个循环使模型能做的远超它单次推理的知识边界。

---

## 2. 循环结构：Thought → Action → Observation

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  上下文 (提示词 + 对话历史 + 工具定义)                   │
│      ↓                                                │
│  ┌─────────┐                                          │
│  │ Thought │ ← "我需要知道用户所在城市的天气"           │
│  └────┬────┘                                          │
│       ↓                                               │
│  ┌─────────┐                                          │
│  │ Action  │ ← weather_lookup(city="北京")            │
│  └────┬────┘                                          │
│       ↓                                               │
│  ┌──────────────┐                                     │
│  │ Observation  │ ← "北京, 晴, 28°C, 湿度 45%"        │
│  └────┬─────────┘                                     │
│       ↓                                               │
│  ┌─────────┐                                          │
│  │ Thought │ ← "天气不错，用户可能适合户外活动"         │
│  └────┬────┘                                          │
│       ↓                                               │
│  ┌─────────┐                                          │
│  │ Answer  │ ← "北京今天晴天，28°C，湿度适中，           │
│  └─────────┘    非常适合户外活动！"                     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

Loop 直到 `Action = Answer(...)` 或 `max_steps` 耗尽——后者是防止 Agent 在一个问题上无限打转。

---

## 3. 与纯 CoT 和纯 Act-only 的对比

| | 纯 CoT（思考） | 纯 Act-only（行动） | **ReAct（思考+行动）** |
|---|---|---|---|
| 信息来源 | 仅模型内部知识 | 仅工具返回 | 内部知识 + 外部信息交替 |
| 纠错能力 | 依赖自身推理 | 可能盲目行动 | 观察结果可纠正思考方向 |
| 幻觉风险 | 高（没外部核查） | 中 | **低**（每一步都要落地验证） |
| 典型任务 | 数学推理 | 信息检索 | 复杂多步任务（订票、编程、排故） |

**关键实验**（Yao et al.）：在 HotpotQA（多跳问答）上，ReAct 的正确率 35.1% vs CoT 的 33.4% vs Act-only 的 25.7%——思考+行动 > 纯思考 > 纯行动。

更重要的是**可靠性**：纯 CoT 容易在推理错误上越走越远，ReAct 通过"行动→观察→发现不对→调整思考"自我纠正。

---

## 4. 手算一轮 ReAct 交互

模拟：用户问"珠穆朗玛峰比乞力马扎罗山高多少？"

### Turn 1

```
Thought: 我需要两座山的海拔高度。先查珠穆朗玛峰。
Action: search("珠穆朗玛峰 海拔")
Observation: 珠穆朗玛峰海拔 8848.86 米
```

### Turn 2

```
Thought: 珠穆朗玛峰 8848.86 米，现在查乞力马扎罗山。
Action: search("乞力马扎罗山 海拔")
Observation: 乞力马扎罗山海拔 5895 米
```

### Turn 3

```
Thought: 现在两座山的高度都有了。8848.86 - 5895 = 2953.86 米。
         (可选验证: 用计算器工具)
Action: calculator("8848.86 - 5895")
Observation: 2953.86
```

### Turn 4

```
Thought: 结果确认无误。
Action: Answer("珠穆朗玛峰比乞力马扎罗山高约 2954 米")
```

> 💡 **关键点**：每一步 Thought 后用 Action 落地验证，而不是一口气推理完再碰运气。中间的 calculator 验证是本例的安全带——虽然心算大概率对，但 ReAct 倾向于"信任但要核实"。

---

## 5. 工具调用：模型怎么"动手"

工具以 **JSON Schema** 形式定义在系统提示词里：

```
系统提示词中包含:
---
可用工具:
1. search(query: string) → 搜索互联网，返回前 5 条结果的摘要
2. calculator(expression: string) → 计算数学表达式，返回数值结果
3. weather(city: string) → 查询城市当前天气，返回温度/湿度/风向
---
```

模型通过生成特殊的**结构化文本**来调用工具：

```
Action: search
Action Input: {"query": "珠穆朗玛峰 海拔"}
```

Harness（脚手架代码）在模型输出中解析这个格式 → 调用真实工具 → 把结果追加到对话历史的 Observer 角色消息中 → 模型继续生成下一个 Thought。这就是你现在用的 Claude Code 的内部机制——你目录里那本书的 1.2 节"Harness 工程"讲的正是这套循环。

---

## 6. MATLAB：模拟 ReAct Agent

```matlab
% ============================================================
% REACT_AGENT_SIM.m
% 模拟 ReAct Agent 的多轮工具调用循环
% Harness 解析模型输出, 执行工具, 追加观察结果
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
```

---

## 7. ReAct 的工程挑战

| 挑战 | 描述 | 解决方案 |
|------|------|----------|
| 循环不收敛 | Agent 在某步陷入重复搜索 | max_steps 硬限制 + 重复检测 |
| 工具调用格式错误 | 模型输出不是合法 JSON | 重试 + 格式修复 heuristics |
| Token 消耗爆炸 | 每轮追加 thought/action/obs → 上下文变长 | 压缩 + 子 Agent 隔离 |
| 幻觉工具调用 | 调用不存在的工具 | 工具发现 + fallback 到 API error |
| 安全 | 模型执行危险操作（删除文件等） | 沙箱 + 人类审批 + 权限分级 |

> 📌 你目录里那本书的第 1.2 节"Harness 工程"、第 4 章"工具"、第 5 章"Coding Agent"系统性地讲了上述问题的工程解法。ReAct 只是一个起点——真正的 Agent 系统复杂度在 Harness 层。

---

## 📌 本章要点

1. ReAct = Thought（思考）→ Action（行动）→ Observation（观察）循环
2. 思考+行动比纯思考（CoT）更可靠，因为每步有外部验证
3. 工具以 JSON Schema 形式在提示词中定义，Harness 解析并执行
4. 真正复杂的 Agent 工程的困难在 Harness 层——格式解析、错误恢复、安全
