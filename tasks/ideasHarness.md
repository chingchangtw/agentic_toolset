# Thesis and Practice

**Harness Engineering** focuses on arming a single AI run by providing the necessary tools, allowed actions, recovery protocols, and definitions of what constitutes a "done" state. It provides the operational boundary and computing substrate for an agent to complete one task.

**Loop Engineering** sits one floor above the harness, replacing the human prompter with a system that schedules and feeds the agent autonomously. A mature loop makes code generation nearly free and executes five core moves: **Discovery** (finding work via skills), **Handoff** (isolating parallel tasks in separate git worktrees), **Verification** (an independent quality check), **Persistence** (saving state outside the chat), and **Scheduling** (running via automations or cron jobs).

To deliver trackable and self-proven mechanisms, these loops must be bridged to traditional software engineering through specific patterns:

### 1. Trackable Mechanisms (Persistence & Measurement)
To prevent the "Amnesiac Loop"—where an agent completes work but forgets it once the context window clears—loops must write their state to disk. 
*   **Persistent Memory:** Every finding, priority, and task status is written to a physical markdown file (e.g., `./state/triage.md`) or a tracking board. The agent forgets, but the repository does not.
*   **Demo Velocity over PRs:** As generation costs plummet, modern engineering teams (like those at Shopify) stop tracking lines of code or PR counts, which are easily gameable. Instead, progress is tracked via **demo velocity**: tangible features and prototypes successfully shipped to staging. 

### 2. AI-Self-Proven Mechanisms (Verification & Action)
The hardest part of an autonomous loop is engineering a mechanism that can safely say "no". If the agent that writes the code also grades it, it will inevitably praise its own output.
*   **The Generator-Evaluator Split:** You must use distinct sub-agents. The *Generator* writes the code, while a separate *Evaluator* model is explicitly instructed to act as a skeptic that assumes the code is broken until proven otherwise. 
*   **Verification by Action, Not Reading:** The Evaluator cannot just read the code to see if it "looks right." It must use tools like the Model Context Protocol (MCP) to execute tests, open Playwright browsers, click UI elements, and inspect the DOM. 
*   **Hard-Stop Conditions:** Frameworks use primitives like `/goal` to force the loop to run continuously until an independent, small model verifies that all tests pass and the linter is clean.
*   **Sequential Critique Loops:** Teams can employ extended thinking sessions where multiple AI models interrogate each other's reasoning for 45+ minutes before a human makes a final decision.

### 3. The Bridge to Software Engineering (Deterministic Gates)
Enterprise implementations succeed by interleaving **probabilistic LLM steps with strict, deterministic software engineering gates**.
*   **Hard-coded Pipelines:** Stripe’s "Minions" pipeline successfully merges over 1,300 machine-written PRs a week by keeping anything rule-bound out of the LLM's hands. A deterministic orchestrator uses scripts to gather context, the LLM writes the code, and hard-coded pipelines enforce linters and commits. Reliability comes from the constraints of the software pipeline, not the size of the AI model.
*   **Standardized Infrastructure:** Companies like Shopify utilize an **LLM proxy** to centralize AI requests, control token costs, and seamlessly swap models without disrupting the developers' agentic harnesses. 

### The Ultimate Software Engineering Guardrail: Avoiding Comprehension Debt
As loops make code generation abundant, **human judgment becomes the scarce resource**. A highly efficient loop can quietly accrue **comprehension debt** (or comprehension rot)—a state where the AI ships code so fast that the human engineers no longer understand the systems they are building two or three layers down. 

To bridge agentic loops safely into production, the human must remain the final checkpoint. Engineers must read a daily representative sample of the AI's pull requests and maintain the ability to manually intervene, ensuring the AI is used to accelerate learning and execution, rather than replace understanding.

======

# Community reflection



======
# Expert words 

## Purpose
1. 獨創的「模式語言」設計方法：讓 AI 精準遵循您的 Clean Architecture、DDD 與 CQRS 架構藍圖，從源頭掌控程式碼的品質與風格。
2. 建構 AI 的自動化生產線：學會打造結構化的「提示模板」與「工作流」，將重複性的開發任務轉化為高效、穩定的 AI 生產線，將團隊從繁瑣的樣板程式碼中解放出來。
3. 完成從「架構師」到「AI 指揮家」的關鍵轉變：將您的工作重心從親手實現，升級到更高價值的系統設計、流程定義與戰略引導，極大化您的專業影響力。
4. 學會「以限制取代放縱」的設計哲學：為 AI 設定智慧的「護欄」，而非給予失控的自由，讓高品質的程式碼成為必然的結果，而非偶然的驚喜。
5. 建立能自我演化的「學習型系統」：掌握從 AI 的「錯誤」中提煉智慧的獨特技巧，讓您的開發框架與規範能夠隨著時間持續進化，有效沉澱團隊的隱性知識。
6. 充滿信心地駕馭 AI 產出：學會一套專為 AI 產出程式碼設計的高效審查（Code Review）與品質驗證策略，讓您能自信地委派任務給 AI，而非盲目信任。
7. 成為引領團隊變革的技術領袖：具備足夠的理論深度與實踐經驗，成為團隊中第一位能清晰闡述並導入先進 AI 開發模式的領導者，建立您的技術權威。

## Content
透過各種尺度的模式語言規範來約束 AI 的行為：

需求約束：用 Event Storming 分析系統規格，讓 AI 自動產生 BDD (ezSpec) 驗收測試 

     ↓

大尺度約束：Architecture (Clean Architecture + DDD + CQRS)

      ↓

  中尺度約束：Sub-agent 職責 (讓 AI 活在合適的 Context 中 )

      ↓

  小尺度約束：Coding Standards （模式的介面規範與實作限制）

      ↓

  微尺度約束：Design by Contract，pre-conditions, post-conditions, invariants

  每個層次的約束都在縮小 AI 產生幻覺的解題空間！

您將從一個被動的「AI 產出審查者」，蛻變為一個主動的「AI 系統指揮家」。您獲得的將不只是一堆提示詞技巧，而是一套能從根本上掌控品質、提升效率、並沉澱團隊智慧的、可擴展的系統化方法。


## AI 時代架構師的轉捩點
- 馴服 AI 的設計思維
1. 由上而下的設計方法（全局系統觀點）
2. 窮舉上下文限制 AI 幻覺
3. 多層次套用模式語言與實作範本
4. 活的模式語言：持續學習與回饋
- AI 協作實戰
指揮 AI 依據模式語言完成一個真實的開發任務。
- Flow
1. 設計模式語言：將架構知識（Clean Architecture, DDD, CQRS）顯性化，轉化為 AI 可遵循的規範與指南。
2. 建立 Sub-agent 提示模板：模式的指令化，學習設計結構化的「提示模板」，將重複性設計模式轉化為可精準呼叫的指令。
3. 組織自動化生產線工作流：編排「工作流」，將多個提示模板串聯，實現端到端的、高品質的功能開發。
4. 從錯誤到智慧--模式語言的演化：掌握從 AI 的非預期產出中分析問題根源，並回頭精煉、強化您的模式語言的獨特技巧。
5. 品質守門員：BDD、DBC、測試、Code Review



=======
# source 
https://www.facebook.com/RomanAmaj/posts/pfbid02Hcb4TS5tjTL4gbpfjh64FdpruTRGvzudn5x129B6QYeQ82vRytFC3RHzRBC4Nqm9l
# 
《Context window 是什麼 — AI 的腦容量》
很多人會說「我的 AI 怎麼聊一聊就開始忘東忘西」，這通常跟 context window 不夠有關係
context window 可以想成 AI 當下的腦容量
我自己的比喻是坐火車看窗外，風景一直變、一直往後退，看過的就看不到了，它能用的就是當下窗戶裡那一塊
AI 跟人有點像，最容易記得「最前面」跟「最後面」，中間的反而容易糊掉。所以資料很多的時候，不能一股腦全部塞給它，塞了腦容量就爆了，反而開始亂算
比較好的做法是只餵「對的、精簡的」那幾塊給它 — 這就是 context engineering 在做的事
《驗證 — 找一個「失憶的新同事」幫你看》
harness 裡面超級重要、但最常被忽略的一塊：驗證
AI 嘩啦嘩啦幫我們做完一堆事，我們怎麼知道它做對了？難道每次都肉眼從頭看？
我的做法是 — 找第二個 AI 來看
我目前的體感是，不同家的 AI 個性差很多。我自己會用 Claude Code 來寫、發想、做規劃，它比較適合互動跟想點子；寫完之後我會叫 Codex 來 review，它給我的感覺比較嚴謹，很多細節 Claude Code 懶得想它會想到
有趣的是，常常被 Claude 言之鑿鑿推薦一個東西，然後我說「你呼叫 Codex 救援一下」，三分鐘後它會回我「對不起我剛剛講錯了，Codex 說的比較有道理」🤣
為什麼這招有效？因為開一個全新的 AI 視窗，它等於是「失憶」的，根本不知道前面在吵什麼，會用全新的角度重看一次 — 跟我們找一個沒參與過的朋友幫忙看，是一樣的道理
《我自己怎麼用 — 用看股票當例子》
我把證券商的 API 串進我的 agent
設定每 30 分鐘自動幫我看幾檔股票，到點就推到我手機，我不用一直開看盤軟體一檔一檔點
它還會去抓當天的新聞當新訊號，而不是只跑一個寫死的流程
而「我怎麼判斷」這件事 — 我習慣看市場、價位、交易量 — 這套 know-how 我把它寫進 skill，它才算真的是「幫我」看股票
最好玩的是，我老婆跟我用一樣的訊號，買的股票卻完全不一樣 😂
所以每個人想餵給 AI 的 harness、記憶，其實都差一點點，因為那是各自的判斷、各自的個性
（但有些東西我還是自己來，像架構層級的決策，因為它影響後面太多，我目前還不敢全交給 model

=====
