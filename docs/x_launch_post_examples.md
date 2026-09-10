[
  {
    "id": "2097314271676027032",
    "author": "@corevats",
    "text": "LAUNCHING https://www.makeoutwithfriends.lol/ 😂\n\nthe most unhinged crush list. don't text them!\n\ninstead add their number. they get an anonymous \"someone added you\"\n\nif they add you back, you both unlock & see the match\nif not, they never find out\n\nadd them or keep wondering your whole life",
    "likes": 5000,
    "replies": 300,
    "reposts": 177,
    "quotes": 171,
    "bookmarks": 5003,
    "views": 904790
  },
  {
    "id": "2095479654987780585",
    "author": "@sargampoudel",
    "text": "Introducing @getmainly \n\nAn abstraction layer for web3 similar to how AI-sdk works for different models\n\nDemo ↓",
    "likes": 158,
    "replies": 3,
    "reposts": 17,
    "quotes": 1,
    "bookmarks": 21,
    "views": 4362
  },
  {
    "id": "2091537625278726376",
    "author": "@tarat_211",
    "text": "I love Wispr Flow, but it's $12/month and still doesn't give my agent the visual context it needs.\n\nSo I built BetterVoice: press the hotkey, speak, and circle anything on screen. \n\nIt transcribes locally and captures the exact visual context your agent needs.\n\nOpen-source experiment ↓",
    "likes": 1608,
    "replies": 137,
    "reposts": 51,
    "quotes": 14,
    "bookmarks": 1389,
    "views": 139284
  },
  {
    "id": "2089582500633071730",
    "author": "@Adarsh_VMore",
    "text": "The project that got me into Super30.\n\nBuilt an AI code reviewer that actually understands your codebase\n\n→ AST-based code indexing\n→ GraphDB for code relationships\n→ Symbol-level retrieval\n→ RAG with 3 retrieval strategies\n→ Redis Streams + Consumer Groups\n→ AI pipelines for review, search & fixes\n→ Dashboard for repo analysis & reviews\n\nExplained the entire architecture + demo",
    "likes": 627,
    "replies": 34,
    "reposts": 33,
    "quotes": 1,
    "bookmarks": 580,
    "views": 30028
  },
  {
    "id": "2084642543237808305",
    "author": "@tarat_211",
    "text": "I took a small language model (qwen3-0.6b) and rewrote its kernels from scratch, on purpose trying to make it as slow as possible\n\nWent from 23tps to 6tps by simply writing my own RMSNorm, MatMul, and Attention Kernels hehe...\n\nBlog link below if you prefer reading 👇",
    "likes": 20,
    "replies": 4,
    "reposts": 2,
    "quotes": 0,
    "bookmarks": 16,
    "views": 1979
  },
  {
    "id": "2074322267224539518",
    "author": "@Jasperli0122",
    "text": "Every founder should know how to use Reddit. It's the fastest, cheapest way to validate a startup idea.\n\nBecause the vertical communities are already there, already talking. \n\nHere is all u need: Reddit Operating Playbook 2026",
    "likes": 102,
    "replies": 11,
    "reposts": 8,
    "quotes": 1,
    "bookmarks": 230,
    "views": 12502
  },
  {
    "id": "2072882634896936968",
    "author": "@StackDhruv",
    "text": "Dear @FarzaTV \n\nThis is my third attempt.\n\nWe built a custom demo for @heyclicky to show how you could automatically find product feedback hidden inside user conversations.\n\nHope this one finally reaches you.",
    "likes": 148,
    "replies": 18,
    "reposts": 2,
    "quotes": 1,
    "bookmarks": 56,
    "views": 23951
  },
  {
    "id": "2005977660929999325",
    "author": "@kmeanskaran",
    "text": "Stock Agent Ops - LIVE DEMO 💭\n\nI designed an industry level ML system for generating weekly stock reports using LSTM forecasting + LangGraph Agents.\n\n🌟 GitHub repo: https://github.com/kmeanskaran/stock-agent-ops\n\n1️⃣ Frontend\n\nBuilt two Streamlit dashboards: one main UI and one monitoring dashboard.\n\nMain UI: Accepts stock ticker input (NVDA, AAPL, etc.) and generates a Bloomberg-style stock report with forecast line plot.\n\nMonitoring Dashboard: View logs, train parent model, check model drift, and evaluate reports from AI Agents. Useful for ML control.\n\n2️⃣Backend\n\nUsing Redis for rate limiting and caching LSTM forecasts with FastAPI.\n\nModel Training: Uses transfer learning to train an LSTM parent model on S&P500 data, freezing weights for optimized training of child models (AAPL, NVDA, etc.). If no parent model exists, it trains the parent first, then the child. Uses MLflow and DagsHub for experiments.\n\nModel Inference: Serves models immediately after training to predict Low, High, Close, Open, and Volume for the next 7 days (excluding Sat-Sun). Stores results in JSON format in Redis.\n\n3️⃣ Agentic AI\n\nFetches LSTM outputs from Redis and passes them to AI Agents built with LangGraph. Four agents generate the financial report; one scrapes current stock news using Finnhub API.\n\nUses Ollama for LLM and embeddings. Stores financial reports in Qdrant vector DB by ticker name for easy retrieval.\n\n4️⃣ Observability\nUses Prometheus and Grafana to monitor system health, latency, and performance.\n\nEverything runs in Docker Compose for easy local management. Minikube was overkill, but a k8s/ directory is included.\n\nI will publish a blog on Substack: https://t.co/C87steJZyh\nand deploy the system on AWS in part two.\n\nFor more technical details, see the README:\nhttps://t.co/xlgiV0b9OC\n\nI will host an X Space this weekend if possible feel free to play with the project. For queries, connect with me.\nMy website: https://t.co/U9nC4QRkxu\n\nKeep Learning ;)",
    "likes": 57,
    "replies": 2,
    "reposts": 1,
    "quotes": 0,
    "bookmarks": 39,
    "views": 2434
  },
  {
    "id": "2071631637792931859",
    "author": "@viditchess",
    "text": "Chess engines tell you the best move.\n\nBut grandmasters are human, they don’t always play it.\n\nSo I built \"Kibitz\": a human move predictor for chess broadcasts. I trained this model on my Nvidia RTX 5080. \n\nThen I made it run as a business by itself.\n\nA channel buys the overlay, Hermes onboards them, charges via @stripe test mode, runs the broadcast, narrates with @NVIDIAAI Nemotron, tracks inference cost, and books its own P&L.\n\nI build. Hermes operates.\n\nThis is my demo and entry for the @NousResearch  × @NVIDIAAI  × @stripe  Hermes Agent Accelerated Business Hackathon.",
    "likes": 6790,
    "replies": 295,
    "reposts": 377,
    "quotes": 97,
    "bookmarks": 1392,
    "views": 660725
  },
  {
    "id": "2042560329864143285",
    "author": "@vineetwts",
    "text": "We Built Clicky SDK!!\n\nLive AI Guide easy to integrate in any app\n\nBuilt By - @Yrishavjs & @shukla_pritika \n( They Both are Looking For opportunities) \n\nMy Mom Struggles with UPI Payment, So we built a demo app and integrated Clicky SDK\n\nHere’s How it Went ⬇️",
    "likes": 1205,
    "replies": 110,
    "reposts": 51,
    "quotes": 15,
    "bookmarks": 862,
    "views": 140797
  }
]