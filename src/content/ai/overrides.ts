// 精修覆盖层：按文件名（basename）覆盖自动派生的 title / summary。
// know_ai 新增文章若不在本文件，则自动用 H1 标题 + 正文首段摘要，无需改清单；
// 想精修某篇，就在这里加一行（或补 summary）。
export const ARTICLE_OVERRIDES: Record<string, { title?: string; summary?: string }> = {
  // ── 历史脉络（notes）──────────────────────────────────────────────────
  '01-智能的起点.md': { title: '第一课 · 智能的起点（1943–1986）', summary: '从神经元模型、感知机到反向传播，AI 经历两次寒冬后第一次「学会学习」。' },
  '02-漫长的进化.md': { title: '第二课 · 漫长的进化（1986–2012）', summary: 'CNN、LSTM 相继登场，但真正缺的是数据和算力，只能耐心等待。' },
  '03-深度学习狂飙.md': { title: '第三课 · 深度学习狂飙（2012–2017）', summary: 'AlexNet 引爆深度学习，word2vec、Seq2Seq、注意力机制相继突破。' },
  '04-Transformer.md': { title: '第四课 · Transformer——一次讲透（2017）', summary: '自注意力、QKV、位置编码：一篇看懂 Transformer 为什么改变一切。' },
  '05-大模型时代.md': { title: '第五课 · 大力出奇迹——大模型时代（2018–2020）', summary: 'BERT、GPT 系列与 Scaling Law：规模本身就是一种算法。' },
  '06-对齐与ChatGPT.md': { title: '第六课 · 对齐与 ChatGPT（2022–2023）', summary: 'RLHF 让模型「学会说人话」，ChatGPT 一炮而红。' },
  '07-长上下文.md': { title: '第七课 · 长上下文——为什么卡在 1M（2023–2026）', summary: 'RoPE、FlashAttention、KV Cache：突破上下文长度的三重门。' },
  '08-推理与Agent时代.md': { title: '第八课 · 推理模型与 Agent 时代（2024–至今）', summary: 'o1/R1 让模型「先想再答」，Agent 时代正式开启。' },

  // ── 技术解剖（deep-dives）────────────────────────────────────────────
  '01-CNN深度解剖.md': { title: 'CNN 卷积神经网络', summary: '从猫脑实验到 LeNet-5，手算一次卷积，理解局部感受野。' },
  '02-LSTM深度解剖.md': { title: 'LSTM 长短期记忆', summary: '门控机制如何让梯度穿越时间，手算 3 个时刻的完整前向。' },
  '03-反向传播的数学.md': { title: '反向传播的数学', summary: '链式法则→梯度流→计算图，两层网络全手算。' },
  '04-注意力机制.md': { title: '注意力机制', summary: '从 Bahdanau 到 QKV 多头，手算 5 个位置的注意力分数。' },
  '05-Transformer架构.md': { title: 'Transformer 架构', summary: 'QKV 自注意力逐行拆解、Multi-Head、位置编码，一个都不放过。' },
  '06-ScalingLaws.md': { title: 'Scaling Laws', summary: '幂律公式推导，Kaplan vs Chinchilla，算力到底该往哪投。' },
  '07-RLHF的数学.md': { title: 'RLHF 的数学', summary: 'Bradley-Terry 偏好模型、PPO clip、KL 约束，对齐的数学底牌。' },
  '08-FlashAttention.md': { title: 'FlashAttention', summary: 'IO-aware tiling 与 online softmax，把注意力复杂度砍掉一个数量级。' },
  '09-RoPE与位置编码.md': { title: 'RoPE 与位置编码', summary: '旋转矩阵→频率分解→外推崩溃→位置插值，长上下文的关键。' },
  '10-Agent ReAct循环.md': { title: 'Agent ReAct 循环', summary: 'Thought→Action→Observation，Agent 思考的底层循环。' },
  '11-损失函数.md': { title: '损失函数', summary: '用最大似然统一看 MSE、BCE、交叉熵：同一个构造食谱。' },
  '12-正则化.md': { title: '正则化', summary: 'L2 的贝叶斯视角、隐式正则化、Dropout 与数据增强。' },
  '13-图神经网络.md': { title: '图神经网络', summary: '消息传递与 GCN 公式，手算 + MATLAB 理解图上的卷积。' },
  '14-无监督学习.md': { title: '无监督学习', summary: '降维、聚类、生成模型的地图，PCA 与高斯隐变量。' },
  '15-扩散模型.md': { title: '扩散模型', summary: '加噪→去噪、DDPM 训练，1D 演示看懂生成式图像。' },
  '16-强化学习.md': { title: '强化学习', summary: 'MDP、贝尔曼方程、Q-learning、策略梯度，以及它和 RLHF 的连接。' },
  '17-优化器.md': { title: '优化器', summary: 'GD、SGD、动量、Adam：手算 + 对决演示看谁收敛更快。' },
  '18-GAN.md': { title: 'GAN', summary: '生成器 vs 判别器的 min-max 博弈，以及模式崩塌。' },
  '19-归一化流.md': { title: '归一化流', summary: '变量替换公式与可逆层，给出精确似然的生成模型。' },
  '20-VAE.md': { title: 'VAE', summary: 'ELBO 与重参数化技巧，隐变量如何驱动生成。' },
  '21-深度学习与伦理.md': { title: '深度学习与伦理', summary: '价值对齐、滥用、系统性影响，以及集体行动的困境。' },

  // ── Agent 工程（agent）────────────────────────────────────────────────
  '01-Agent入门与Harness工程.md': { title: '第一章 · AI Agent 入门与 Harness 工程', summary: '三大支柱、ReAct，以及当模型收敛后真正的护城河。' },
  '02-上下文工程.md': { title: '第二章 · 上下文工程', summary: 'KV Cache、提示工程、Skills、状态栏与上下文压缩。' },
  '03-用户记忆和知识库.md': { title: '第三章 · 用户记忆和知识库', summary: '记忆系统、RAG 与结构化索引，让 Agent 记住你。' },
  '04-工具.md': { title: '第四章 · 工具', summary: '工具设计、MCP、异步事件与工具发现。' },
  '05-CodingAgent与代码生成.md': { title: '第五章 · Coding Agent 与代码生成', summary: '代码即元能力，Agent 如何实现自举。' },
  '06-Agent的评估.md': { title: '第六章 · Agent 的评估', summary: 'LLM-as-a-Judge，评估驱动的迭代。' },
  '07-模型后训练.md': { title: '第七章 · 模型后训练', summary: 'SFT、RL、RLHF 与多轮奖励。' },
  '08-Agent的自我进化.md': { title: '第八章 · Agent 的自我进化', summary: '从经验中学习、创造工具，Agent 如何越用越强。' },
  '09-多模态与实时交互.md': { title: '第九章 · 多模态与实时交互', summary: '语音、Computer Use 与机器人。' },
  '10-多Agent协作.md': { title: '第十章 · 多 Agent 协作', summary: '协作拓扑、失败模式与 Agent 社会。' },

  // ── 参考资料导读（references）─────────────────────────────────────────
  '理解深度学习-Prince导读.md': { title: '理解深度学习（Prince 导读）', summary: '21 章深度学习数学教科书导读与交叉映射，数学底座。' },
  '深入理解AIAgent-李博杰导读.md': { title: '深入理解 AI Agent（李博杰导读）', summary: 'Agent 工程实践全书导读，逐章研读见「Agent 工程」。' },

  // ── 多模态（multimodal）──────────────────────────────────────────────
  '多模态发展史.md': { title: '多模态发展史', summary: '图像、语音、视频三条并行线，如何汇聚成多模态 AI。' },
  '01-CLIP深度解剖.md': { title: 'CLIP 深度解剖', summary: '对比学习与图文对齐，多模态的对齐鼻祖。' },
  '02-LLaVA与VLM骨架.md': { title: 'LLaVA 与 VLM 骨架', summary: '视觉编码器 + 投影 + LLM，看懂 90% 的视觉语言模型。' },
  '03-ViT视觉编码器.md': { title: 'ViT 视觉编码器', summary: '图像怎么切成 patch、变成 token。' },
  '04-Whisper语音识别.md': { title: 'Whisper 语音识别', summary: '音频怎么切成帧、变成 token。' },
  '05-视频.md': { title: '视频——理解与生成', summary: '时空 patch 与 Sora 的时空扩散。' },
};
