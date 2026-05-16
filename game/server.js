const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST_PIN = process.env.HOST_PIN || "";
const UNIT_PRICE = 5;
const INITIAL_CASH = 50;
const MAX_ROUNDS = 5;

const bigEventText = `全球市場進入新一波科技投資熱潮。大型企業積極投入 AI、自動化、資料中心與能源轉型相關支出，投資人開始追逐高成長題材。
但同時，能源價格、通膨壓力與政策變化也讓市場變得不穩定。有人認為這是新一波成長機會，也有人擔心市場過熱、估值太高，隨時可能反轉。`;

const products = [
  { key: "chip", name: "晶片巨人", desc: "代表半導體、AI、科技創新" },
  { key: "green", name: "綠能交通", desc: "代表電動車、綠能轉型" },
  { key: "oil", name: "黑金能源", desc: "代表石油、原物料、能源" },
  { key: "defense", name: "民生防禦", desc: "代表電信服務、民生用品、防禦型產業" }
];

const roundEvents = {
  1: [
    { id: "1-1", title: "企業擴大 AI 與自動化投資", news: "多家大型企業宣布提高資料中心、自動化設備與資料處理系統的資本支出。市場認為，這可能帶動部分高科技供應鏈需求，也可能讓生產效率在未來提升。不過，也有分析師提醒，短期內企業支出大增，可能會壓縮部分公司的現金流，投資人對真正受惠的產業仍有不同看法。", points: { chip: 3, green: 2, oil: 0, defense: 0 } },
    { id: "1-2", title: "新一代交通技術受到市場關注", news: "市場傳出新一代交通工具技術取得突破，部分投資人認為未來交通產業可能出現替代性需求。相關供應鏈受到資金關注，但也有人擔心新技術仍需要大量投入，短期內不一定能馬上帶來獲利。", points: { chip: 1, green: 3, oil: 0, defense: 0 } },
    { id: "1-3", title: "製造業接單回溫", news: "製造業接單出現回溫跡象，部分企業開始重新評估擴產與採購計畫。市場一方面看好上游材料需求增加，另一方面也擔心供應鏈若太快擴張，可能造成成本與供貨壓力。", points: { chip: 2, green: 0, oil: 2, defense: 0 } },
    { id: "1-4", title: "資金轉向穩定型產業", news: "近期市場波動加大，高成長產業的估值開始受到討論。部分投資人選擇先獲利了結，將資金轉向需求較穩定、受景氣影響較小的產業。市場對這是否只是短期修正仍沒有共識。", points: { chip: -2, green: -2, oil: 0, defense: 2 } }
  ],
  2: [
    { id: "2-1", title: "國際運輸與能源成本上升", news: "國際運輸與能源成本同步上升，企業開始評估是否調整售價。市場擔心成本壓力可能影響部分成長型產業，但也有投資人認為，上游能源與原物料相關產業可能因此受惠。", points: { chip: 0, green: -2, oil: 3, defense: 1 } },
    { id: "2-2", title: "家庭支出轉向保守", news: "家庭支出開始轉向保守，消費者減少非必要支出，優先維持日常生活、通訊與必要服務。市場開始重新評估高成長產業的短期需求，也有人認為穩定型產業在這種環境下更有支撐。", points: { chip: -3, green: 0, oil: -2, defense: 2 } },
    { id: "2-3", title: "節能補助方向浮現", news: "政府釋出節能與效率升級相關補助方向，市場開始討論哪些產業可能受惠。部分投資人看好替代能源與新型交通工具需求，但政策細節尚未完全明朗，資金仍在觀望。", points: { chip: 1, green: 2, oil: 0, defense: 0 } },
    { id: "2-4", title: "企業加速導入高效率設備", news: "為了壓低成本並提升生產效率，部分企業宣布加速導入自動化設備、資料管理系統與智慧製造流程。市場認為這可能帶動相關技術需求，但對其他產業的影響仍不明顯。", points: { chip: 3, green: 1, oil: 0, defense: 0 } }
  ],
  3: [
    { id: "3-1", title: "低碳設備補助擴大", news: "政府宣布擴大低碳設備與能源轉型補助，企業開始評估是否更換現有能源系統。市場認為部分產業可能因此加速升級，但也有人擔心補助申請條件複雜，實際效果可能需要時間發酵。", points: { chip: 1, green: 3, oil: 0, defense: 0 } },
    { id: "3-2", title: "企業更新生產與監控系統", news: "企業加速更新生產管理、能源監控與自動化系統，希望降低浪費並提升效率。市場開始關注相關設備、晶片與材料需求，但不同產業受惠程度仍有差異。", points: { chip: 3, green: 2, oil: 1, defense: 0 } },
    { id: "3-3", title: "基礎建設與轉型工程增加", news: "多項基礎建設與能源轉型工程陸續啟動，市場開始關注上游材料、能源與設備需求。但部分投資人認為，這類工程的受惠產業不一定是最熱門的科技產業，資金流向可能出現轉移。", points: { chip: 0, green: 2, oil: 3, defense: 0 } },
    { id: "3-4", title: "政策內容不如市場預期", news: "最新公布的補助細節不如市場原先期待，部分高成長產業出現失望性賣壓。投資人短期轉向較穩定、政策依賴程度較低的產業，希望降低不確定性帶來的損失。", points: { chip: -2, green: -3, oil: 0, defense: 2 } }
  ],
  4: [
    { id: "4-1", title: "高估值標的出現獲利了結", news: "前幾輪漲幅較大的高成長標的開始出現獲利了結，市場風險偏好明顯下降。部分投資人認為漲多後本來就需要休息，也有人擔心這可能是資金撤離成長型產業的開始。", points: { chip: -2, green: -2, oil: 0, defense: 3 } },
    { id: "4-2", title: "景氣數據轉弱，但基建計畫持續", news: "最新景氣數據略低於市場預期，企業投資態度變得保守。不過，政府表示基礎建設與公共投資計畫仍會持續推進，使市場開始思考哪些產業能在景氣轉弱時維持需求。", points: { chip: -2, green: 0, oil: 3, defense: 1 } },
    { id: "4-3", title: "企業縮減支出，但保留效率升級", news: "面對成本壓力，企業開始刪減非必要支出，但仍保留能降低成本、提高效率的投資項目。市場認為，若企業真的要花錢，可能會優先投入能直接改善營運效率的技術。", points: { chip: 3, green: 0, oil: -2, defense: 0 } },
    { id: "4-4", title: "市場保守，但長期轉型方向未變", news: "雖然投資人短期轉趨保守，但長期能源轉型、低碳交通與產業升級的方向並未改變。部分資金重新回到具有政策支撐的產業，但市場整體仍保持謹慎。", points: { chip: 0, green: 3, oil: 0, defense: 1 } }
  ],
  5: [
    { id: "5-1", title: "企業訂單與資本支出回升", news: "企業訂單與資本支出同步回升，市場重新看好設備更新、技術升級與供應鏈需求。投資人情緒轉為樂觀，但仍有人提醒，前期成本壓力尚未完全消失。", points: { chip: 3, green: 2, oil: 1, defense: 0 } },
    { id: "5-2", title: "製造與基建活動擴張", news: "基礎建設與製造活動出現擴張跡象，上游材料、能源與運輸需求同步受到關注。市場認為景氣可能正在回溫，但資金並沒有完全流向同一類產業。", points: { chip: 0, green: 1, oil: 3, defense: 1 } },
    { id: "5-3", title: "新一輪轉型投資受到期待", news: "市場預期新一輪產業轉型投資即將啟動，相關替代性產業重新受到資金關注。不過，投資人對誰會成為最大受惠者仍有不同看法，部分資金選擇分散配置。", points: { chip: 2, green: 2, oil: 1, defense: 0 } },
    { id: "5-4", title: "就業與消費數據回穩", news: "就業與消費數據回穩，家庭支出逐漸恢復正常，市場對需求型產業的信心提高。同時，部分能源與原物料需求也隨著經濟活動回溫而改善，但高成長產業表現相對平淡。", points: { chip: 0, green: 0, oil: 2, defense: 2 } }
  ]
};

const eventExplanations = {
  "1-1": "AI 與資料中心投資通常會增加高效能晶片、伺服器與自動化設備需求，因此晶片巨人受惠最明顯。若企業同步追求節能與效率升級，綠能交通也可能受到資金關注；但能源與民生防禦沒有直接的新需求推力。",
  "1-2": "新一代交通技術若被市場視為長期替代方向，資金通常會先流向電動車、電池、充電與低碳運輸供應鏈，所以綠能交通上漲較多。晶片巨人小幅受惠於車用晶片、感測器與智慧控制需求。",
  "1-3": "製造業接單回溫時，企業可能增加設備、晶片與材料採購，因此晶片巨人與黑金能源同步受惠。綠能交通與民生防禦因為沒有直接需求催化，反應較平淡。",
  "1-4": "當市場擔心高成長題材估值偏高時，資金常會先從科技與轉型概念股獲利了結，晶片巨人與綠能交通承壓。防禦型產業因需求較穩定，容易成為資金暫時避風港。",
  "2-1": "能源與運輸成本上升會提高企業成本，也可能推升通膨壓力；成長型產業容易被投資人重新評估獲利能力。相對地，上游能源與原物料相關產業可能因價格上升而受惠，民生防禦也因穩定需求略有支撐。",
  "2-2": "家庭支出轉保守時，非必要與高成長需求容易降溫，科技題材與能源需求都可能受壓。民生防禦涵蓋通訊與日常必需服務，需求較不容易被削減，因此表現相對抗跌。",
  "2-3": "節能補助與效率升級政策會提升市場對低碳交通、充電設備與能源管理的期待，因此綠能交通受惠。晶片巨人小幅受惠於控制晶片、感測與智慧化設備需求。",
  "2-4": "企業若加速導入自動化、資料管理與智慧製造，最直接受惠的是晶片、伺服器與工業控制供應鏈。綠能交通也可能因效率與電動化題材小幅受惠，但能源與防禦型產業影響有限。",
  "3-1": "低碳設備與能源轉型補助通常會提高電動車、充電、電池與節能設備的投資意願，因此綠能交通漲幅最大。晶片巨人則因智慧控制與電力管理需求而小幅受惠。",
  "3-2": "生產管理、能源監控與自動化系統升級會增加晶片、感測器、伺服器與工業設備需求，因此晶片巨人受惠最明顯。低碳管理也支撐綠能交通，基礎材料與能源需求則小幅增加。",
  "3-3": "基礎建設與轉型工程會拉動能源、原物料、運輸與施工相關需求，因此黑金能源上漲較多。綠能交通因轉型工程延伸需求受惠，但熱門科技題材不一定是主要受惠者。",
  "3-4": "政策細節若低於市場期待，依賴補助與高成長預期的產業容易出現失望性賣壓，綠能交通與晶片巨人下跌。資金轉向需求穩定、政策依賴較低的民生防禦。",
  "4-1": "高估值成長股在前期上漲後容易面臨獲利了結，科技與綠能題材同時承壓。當風險偏好下降，投資人常偏好現金流較穩定的防禦型產業。",
  "4-2": "景氣數據轉弱會讓企業延後科技與成長型投資，因此晶片巨人承壓。若公共建設仍持續，能源、原物料與工程需求可獲支撐，民生防禦也因穩定需求小幅受惠。",
  "4-3": "成本壓力下，企業會刪減非必要支出，但仍可能保留能立即降低成本的自動化與效率升級投資，因此晶片巨人受惠。能源需求則可能因企業活動保守而轉弱。",
  "4-4": "市場短期保守時，資金不一定全面追高，但若能源轉型與低碳交通方向仍受政策支撐，綠能交通會重新吸引資金。民生防禦也因穩定需求獲得小幅支撐。",
  "5-1": "訂單與資本支出回升代表企業重新投入設備、技術與供應鏈升級，最直接支撐晶片巨人。綠能交通受惠於轉型投資恢復，黑金能源也因生產與運輸活動增加而小幅受惠。",
  "5-2": "製造與基建活動擴張通常會增加能源、原物料、運輸與施工需求，因此黑金能源受惠最大。綠能交通和民生防禦也因經濟活動回溫獲得小幅支撐。",
  "5-3": "新一輪轉型投資預期會同時支撐科技升級與低碳交通題材，因此晶片巨人與綠能交通同步上漲。能源與原物料需求也會因投資活動增加而小幅受惠。",
  "5-4": "就業與消費回穩會改善家庭日常支出與需求型產業信心，因此民生防禦受惠。經濟活動恢復也支撐能源與原物料需求；但高成長科技與綠能題材缺少新的催化，表現較平淡。"
};

const pointCards = [
  { title: "中樂透", cash: 2 },
  { title: "感冒掛號費", cash: -2 },
  { title: "錢包不見", cash: -5 },
  { title: "中發票", cash: 5 },
  { title: "繼承遺產", cash: 50 },
  { title: "年終獎金", cash: 30 },
  { title: "老闆加薪", cash: 20 },
  { title: "紅包", cash: 20 },
  { title: "信用卡卡費", cash: -30 },
  { title: "車子維修", cash: -10 },
  { title: "被詐騙", cash: -30 },
  { title: "存款利息", cash: 10 }
];

const interactiveFates = [
  { title: "情報交換", text: "指定一位玩家玩小遊戲，贏的人可以知道對方是否抽到資訊卡。" },
  { title: "偷窺持倉", text: "可以秘密查看一位玩家其中一項商品持有數量。" },
  { title: "避險機會", text: "本輪你可以指定一項商品，若該商品下跌，最多只扣 3 點。請主持人手動記錄。" },
  { title: "強制公開", text: "指定一位玩家公開自己持有最多的商品名稱，不公開數量。" },
  { title: "反向操作", text: "本輪結算前，你可以把其中一項商品 1 單位轉換成另一項商品 1 單位。請主持人手動處理。" }
];

let state = makeState();
let version = 0;
const sseClients = new Set();

function makeState() {
  return {
    round: 0,
    stage: "準備中",
    bigEventVisible: false,
    currentEvent: null,
    eventDrawOpen: false,
    eventDrawnBy: null,
    pointsVisible: false,
    cardDrawOpen: false,
    cardDeck: [],
    settledRounds: {},
    records: [],
    discussionEndsAt: null,
    message: "連線版已準備好。",
    players: Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      name: `玩家 ${index + 1}`,
      cash: INITIAL_CASH,
      holdings: Object.fromEntries(products.map((product) => [product.key, 0])),
      lastProfit: 0,
      cards: [],
      history: []
    }))
  };
}

function totalAssets(player) {
  return player.cash + products.reduce((sum, product) => sum + player.holdings[product.key] * UNIT_PRICE, 0);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function playerName(id) {
  return state.players.find((player) => player.id === id)?.name || `玩家 ${id}`;
}

function publicEvent(event, includePoints) {
  if (!event) return null;
  return {
    id: event.id,
    title: event.title,
    news: event.news,
    explanation: includePoints ? eventExplanations[event.id] : null,
    points: includePoints ? event.points : null
  };
}

function baseState() {
  return {
    version,
    maxRounds: MAX_ROUNDS,
    unitPrice: UNIT_PRICE,
    initialCash: INITIAL_CASH,
    bigEventText,
    products,
    round: state.round,
    stage: state.stage,
    bigEventVisible: state.bigEventVisible,
    eventDrawOpen: state.eventDrawOpen,
    eventDrawnBy: state.eventDrawnBy,
    eventDrawnByName: state.eventDrawnBy ? playerName(state.eventDrawnBy) : "",
    pointsVisible: state.pointsVisible,
    discussionEndsAt: state.discussionEndsAt,
    cardDrawOpen: state.cardDrawOpen,
    message: state.message,
    records: state.records,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      cash: player.cash,
      holdings: player.holdings,
      lastProfit: player.lastProfit,
      totalAssets: totalAssets(player),
      cardCount: player.cards.length
    }))
  };
}

function hostState() {
  return {
    ...baseState(),
    currentEvent: publicEvent(state.currentEvent, true),
    cardDeck: state.cardDeck.map((card) => ({
      id: card.id,
      type: card.type,
      claimedBy: card.claimedBy,
      claimedByName: card.claimedBy ? playerName(card.claimedBy) : "",
      content: card.content || null
    })),
    playerCards: state.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      cards: player.cards
    }))
  };
}

function playerState(playerId) {
  const player = state.players.find((item) => item.id === playerId);
  const existingClaim = state.cardDeck.find((card) => card.claimedBy === playerId);
  return {
    ...baseState(),
    currentEvent: publicEvent(state.currentEvent, state.pointsVisible),
    me: player ? {
      id: player.id,
      name: player.name,
      cash: player.cash,
      holdings: player.holdings,
      lastProfit: player.lastProfit,
      totalAssets: totalAssets(player),
      cards: player.cards,
      history: player.history
    } : null,
    hasClaimedCard: Boolean(existingClaim),
    cardDeck: state.cardDeck.map((card) => ({
      id: card.id,
      available: !card.claimedBy,
      claimedBy: card.claimedBy,
      claimedByName: card.claimedBy ? playerName(card.claimedBy) : "",
      mine: card.claimedBy === playerId,
      content: card.claimedBy === playerId ? card.content : null
    }))
  };
}

function broadcast(message = state.message) {
  state.message = message;
  version += 1;
  const payload = `data: ${JSON.stringify({ version })}\n\n`;
  for (const client of sseClients) client.write(payload);
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function assertPlayer(playerId) {
  const player = state.players.find((item) => item.id === Number(playerId));
  if (!player) throw new Error("找不到玩家。");
  return player;
}

function createDeck() {
  return shuffle(["info", "product", "fate", "point"]).map((type, index) => ({
    id: `r${state.round}-c${index + 1}-${Date.now()}`,
    type,
    claimedBy: null,
    content: null
  }));
}

function createInfoCard() {
  const product = randomItem(products);
  const point = state.currentEvent.points[product.key];
  const direction = point > 0 ? "可能上漲" : point < 0 ? "可能下跌" : "可能持平";
  return {
    type: "info",
    title: "資訊卡",
    text: `你得知：「${product.name}」本輪${direction}。`,
    summary: `得知 ${product.name} 本輪方向。`,
    note: "請主持人私下告知該玩家"
  };
}

function createProductCard(player) {
  const product = randomItem(products);
  const amount = Math.floor(Math.random() * 3) + 1;
  player.holdings[product.key] += amount;
  return {
    type: "product",
    title: "商品卡",
    text: `你獲得「${product.name}」${amount} 單位。`,
    summary: `獲得 ${product.name} ${amount} 單位。`,
    note: "系統已自動增加商品單位"
  };
}

function createPointCard(player) {
  const card = randomItem(pointCards);
  player.cash += card.cash;
  return {
    type: "point",
    title: `點數卡：${card.title}`,
    text: card.cash >= 0 ? `獲得 ${card.cash} 點現金。` : `損失 ${Math.abs(card.cash)} 點現金。`,
    summary: `現金 ${signed(card.cash)} 點。`,
    note: "系統已自動加減現金"
  };
}

function createFateCard() {
  const fate = randomItem(interactiveFates);
  return {
    type: "fate",
    title: `命運卡：${fate.title}`,
    text: fate.text,
    summary: `互動效果：${fate.title}。`,
    note: "互動型命運卡，請主持人手動處理"
  };
}

function createClaimedCard(card, player) {
  if (card.type === "info") return createInfoCard();
  if (card.type === "product") return createProductCard(player);
  if (card.type === "point") return createPointCard(player);
  return createFateCard();
}

function applyAdjustments(adjustments) {
  const normalized = [];
  for (const item of adjustments || []) {
    const player = assertPlayer(item.playerId);
    const changes = item.changes || {};
    const proposed = Object.fromEntries(products.map((product) => [product.key, Number.parseInt(changes[product.key] || 0, 10)]));
    if (Object.values(proposed).some((value) => !Number.isFinite(value))) throw new Error("投資調整必須是整數。");
    const buyCost = products.reduce((sum, product) => sum + Math.max(0, proposed[product.key]) * UNIT_PRICE, 0);
    const sellGain = products.reduce((sum, product) => sum + Math.max(0, -proposed[product.key]) * UNIT_PRICE, 0);
    if (player.cash < buyCost) throw new Error(`${player.name} 現金不足，不能買入。`);
    for (const product of products) {
      if (player.holdings[product.key] + proposed[product.key] < 0) throw new Error(`${player.name} 的 ${product.name} 持有單位不足。`);
    }
    normalized.push({ player, proposed, buyCost, sellGain });
  }
  normalized.forEach(({ player, proposed, buyCost, sellGain }) => {
    products.forEach((product) => {
      player.holdings[product.key] += proposed[product.key];
    });
    player.cash = player.cash - buyCost + sellGain;
    const phase = state.round ? `第 ${state.round} 輪` : "初始投資";
    const detail = products.filter((product) => proposed[product.key] !== 0).map((product) => `${product.name} ${signed(proposed[product.key])}`).join("、") || "未調整";
    player.history.push(`${phase}投資調整：${detail}。`);
  });
}

function handleAction(payload) {
  const type = payload.type;
  const hostActions = new Set([
    "reset",
    "setNames",
    "showBigEvent",
    "startRound",
    "openEventDraw",
    "togglePoints",
    "openCardDraw",
    "startDiscussionTimer",
    "applyAdjustments",
    "settleRound",
    "nextRound",
    "endGame"
  ]);

  if (HOST_PIN && hostActions.has(type) && payload.pin !== HOST_PIN) {
    throw new Error("主持人密碼不正確。");
  }

  if (type === "reset") {
    state = makeState();
    broadcast("遊戲已重置。");
    return;
  }
  if (type === "setNames") {
    (payload.names || []).forEach((name, index) => {
      if (state.players[index]) state.players[index].name = String(name || `玩家 ${index + 1}`).trim();
    });
    broadcast("玩家名稱已更新。");
    return;
  }
  if (type === "showBigEvent") {
    state.bigEventVisible = true;
    state.stage = "大事件";
    broadcast("大事件已顯示。");
    return;
  }
  if (type === "startRound") {
    if (state.round >= MAX_ROUNDS) throw new Error("已完成第 5 輪。");
    state.round += 1;
    state.stage = `第 ${state.round} 輪開始`;
    state.currentEvent = null;
    state.eventDrawOpen = false;
    state.eventDrawnBy = null;
    state.pointsVisible = false;
    state.cardDrawOpen = false;
    state.cardDeck = [];
    state.discussionEndsAt = null;
    state.players.forEach((player) => {
      player.lastProfit = 0;
      player.cards = [];
    });
    broadcast(`第 ${state.round} 輪已開始。`);
    return;
  }
  if (type === "openEventDraw") {
    if (!state.round) throw new Error("請先開始第 1 輪。");
    if (state.currentEvent) throw new Error("本輪已抽過小事件。");
    state.eventDrawOpen = true;
    state.stage = `第 ${state.round} 輪：等待玩家抽小事件`;
    broadcast("玩家可以搶抽本輪小事件。");
    return;
  }
  if (type === "drawEventByPlayer") {
    const player = assertPlayer(payload.playerId);
    if (!state.eventDrawOpen) throw new Error("主持人尚未開放抽小事件。");
    if (state.currentEvent) throw new Error("本輪小事件已被抽走。");
    state.currentEvent = randomItem(roundEvents[state.round]);
    state.eventDrawOpen = false;
    state.eventDrawnBy = player.id;
    state.stage = `第 ${state.round} 輪：新聞發布`;
    broadcast(`${player.name} 抽出了小事件：「${state.currentEvent.title}」。`);
    return;
  }
  if (type === "togglePoints") {
    if (!state.currentEvent) throw new Error("尚未抽出小事件。");
    state.pointsVisible = !state.pointsVisible;
    broadcast(state.pointsVisible ? "主持人已顯示隱藏漲跌。" : "主持人已隱藏漲跌。");
    return;
  }
  if (type === "openCardDraw") {
    if (!state.currentEvent) throw new Error("請先抽小事件。");
    if (state.cardDeck.length) throw new Error("本輪已開放過抽卡。");
    state.cardDeck = createDeck();
    state.cardDrawOpen = true;
    state.stage = `第 ${state.round} 輪：玩家抽卡`;
    broadcast("抽卡已開放，四張卡先點先得。");
    return;
  }
  if (type === "claimCard") {
    const player = assertPlayer(payload.playerId);
    if (!state.cardDrawOpen) throw new Error("主持人尚未開放抽卡。");
    if (state.cardDeck.some((card) => card.claimedBy === player.id)) throw new Error("你本輪已經抽過卡。");
    const card = state.cardDeck.find((item) => item.id === payload.cardId);
    if (!card || card.claimedBy) throw new Error("這張卡已經被抽走。");
    card.claimedBy = player.id;
    card.content = createClaimedCard(card, player);
    player.cards.push(card.content);
    player.history.push(`第 ${state.round} 輪抽到：${card.content.title}。${card.content.summary}`);
    if (state.cardDeck.every((item) => item.claimedBy)) {
      state.cardDrawOpen = false;
      state.stage = `第 ${state.round} 輪：抽卡完成`;
    }
    broadcast(`${player.name} 抽走了一張卡。`);
    return;
  }
  if (type === "startDiscussionTimer") {
    if (!state.round) throw new Error("請先開始回合。");
    state.discussionEndsAt = Date.now() + 180000;
    state.stage = `第 ${state.round} 輪：討論階段`;
    broadcast("3 分鐘討論倒數已開始。");
    return;
  }
  if (type === "applyAdjustments") {
    applyAdjustments(payload.adjustments);
    state.stage = state.round ? `第 ${state.round} 輪：投資調整完成` : "初始投資完成";
    broadcast(state.round ? "投資調整已套用。" : "初始投資已套用。");
    return;
  }
  if (type === "settleRound") {
    if (!state.currentEvent) throw new Error("請先抽小事件。");
    if (state.settledRounds[state.round]) throw new Error(`第 ${state.round} 輪已結算過。`);
    const playerResults = state.players.map((player) => {
      const profit = products.reduce((sum, product) => sum + player.holdings[product.key] * state.currentEvent.points[product.key], 0);
      player.cash += profit;
      player.lastProfit = profit;
      const assetsAfter = totalAssets(player);
      player.history.push(`第 ${state.round} 輪結算：本輪盈虧 ${signed(profit)} 點，回合後總資產 ${assetsAfter} 點。`);
      return { playerName: player.name, profit, assetsAfter };
    });
    state.settledRounds[state.round] = true;
    state.pointsVisible = true;
    state.records.push({ round: state.round, event: state.currentEvent, playerResults });
    state.stage = `第 ${state.round} 輪：結算完成`;
    broadcast(`第 ${state.round} 輪已結算。`);
    return;
  }
  if (type === "nextRound") {
    if (!state.settledRounds[state.round]) throw new Error("本輪尚未結算。");
    if (state.round >= MAX_ROUNDS) {
      state.stage = "遊戲結束";
      broadcast("遊戲結束。");
      return;
    }
    state.stage = "等待下一輪";
    broadcast(`準備進入第 ${state.round + 1} 輪。`);
    return;
  }
  if (type === "endGame") {
    state.stage = "遊戲結束";
    state.pointsVisible = true;
    broadcast("遊戲結束。");
    return;
  }
  throw new Error("未知操作。");
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const file = url.pathname === "/" ? "/host.html" : url.pathname;
  const fullPath = path.join(__dirname, path.normalize(file));
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(fullPath);
    const type = ext === ".html" ? "text/html; charset=utf-8" : ext === ".js" ? "text/javascript; charset=utf-8" : "text/plain; charset=utf-8";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/state") {
      const view = url.searchParams.get("view");
      const playerId = Number(url.searchParams.get("playerId") || 0);
      json(res, 200, view === "host" ? hostState() : playerState(playerId));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });
      res.write(`data: ${JSON.stringify({ version })}\n\n`);
      sseClients.add(res);
      req.on("close", () => sseClients.delete(res));
      return;
    }
    if (req.method === "GET" && url.pathname === "/health") {
      json(res, 200, { ok: true, version });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/action") {
      const payload = await readBody(req);
      handleAction(payload);
      json(res, 200, { ok: true, version });
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    json(res, 400, { ok: false, error: error.message || "操作失敗。" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`資訊迷霧連線版已啟動：http://localhost:${PORT}/host.html`);
  console.log(`玩家頁：http://localhost:${PORT}/player.html`);
});
