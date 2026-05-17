const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST_PIN = process.env.HOST_PIN || "";
const UNIT_PRICE = 5;
const INITIAL_CASH = 50;
const MAX_ROUNDS = 5;

const bigEventText = `AI 熱潮與多資產輪動

全球市場進入新一波 AI 投資熱潮。大型企業積極投入晶片、資料中心、自動化、智慧製造與能源效率升級，投資人開始追逐高成長題材。
但同時，市場也開始思考 AI 投資是否過熱、利率是否維持高檔、資金是否轉向公債、黃金或虛擬貨幣等其他資產。有人認為這是新一波科技革命，也有人擔心市場已經過度樂觀，資金隨時可能出現輪動。`;

const products = [
  {
    key: "chip",
    name: "晶片巨人",
    desc: "代表半導體、AI 晶片、先進製程與高科技供應鏈。AI 熱潮時可能受惠，但也容易受到估值、利率與景氣預期影響。"
  },
  {
    key: "robot",
    name: "機器人",
    desc: "代表自動化、人形機器人、智慧製造與 AI 實體應用。題材想像空間大，波動也較高。"
  },
  {
    key: "esg",
    name: "ESG 轉型",
    desc: "代表綠能、節能設備、低碳轉型、永續投資與能源效率升級。受政策、補助與長期資金影響。"
  },
  {
    key: "bond",
    name: "公債",
    desc: "代表債券、利率與防禦型資產。市場擔心風險時可能受青睞；但若利率上升，公債價格可能下跌。"
  },
  {
    key: "crypto",
    name: "虛擬貨幣",
    desc: "代表比特幣、加密資產與高風險資金行情。市場風險偏好上升時可能大漲，但遇到利率上升、監管或恐慌時也可能大跌。"
  },
  {
    key: "gold",
    name: "黃金",
    desc: "代表避險資產、抗通膨與市場不確定性。當市場恐慌、地緣風險或通膨壓力上升時可能受惠；當風險偏好回升時可能轉弱。"
  }
];

const roundEvents = {
  1: [
    {
      id: "1-1",
      title: "事件資訊",
      news: "多家大型企業宣布提高明年度資本支出，市場認為這代表企業仍願意投入 AI、資料處理與智慧化升級。部分投資人看好相關供應鏈延續成長動能。\n不過，也有分析師提醒，若資本支出增加太快，企業短期現金流與獲利壓力可能同步上升，市場資金也可能只集中在少數真正受惠的標的。",
      points: {
        chip: 3,
        robot: 2,
        esg: 0,
        bond: -1,
        crypto: 1,
        gold: 0
      }
    },
    {
      id: "1-2",
      title: "事件資訊",
      news: "市場開始討論 AI 從雲端運算走向實體應用的可能性，部分企業表示未來會將智慧系統導入工廠、倉儲與服務場景。\n投資人一方面期待新應用帶來長期需求，另一方面也擔心相關產品仍在早期階段，短期獲利能否跟上股價想像仍不明朗。",
      points: {
        chip: 1,
        robot: 3,
        esg: 1,
        bond: 0,
        crypto: 1,
        gold: -1
      }
    },
    {
      id: "1-3",
      title: "事件資訊",
      news: "科技股連續上漲後，市場情緒明顯升溫，部分資金開始尋找更高波動、更有想像空間的資產。\n但也有投資人提醒，當資金過度追逐題材時，價格可能脫離基本面，一旦市場情緒反轉，波動也會快速放大。",
      points: {
        chip: 2,
        robot: 2,
        esg: 0,
        bond: -2,
        crypto: 3,
        gold: -1
      }
    },
    {
      id: "1-4",
      title: "事件資訊",
      news: "市場重新關注利率與資金成本，部分投資人擔心，如果長天期利率維持高檔，高估值成長型資產可能面臨重新定價壓力。\n也有人認為，若科技投資真的能提高生產力，長期仍可能支撐企業獲利，因此市場看法出現分歧。",
      points: {
        chip: -2,
        robot: -2,
        esg: -1,
        bond: -2,
        crypto: -3,
        gold: 1
      }
    }
  ],
  2: [
    {
      id: "2-1",
      title: "事件資訊",
      news: "政府與大型機構資金開始討論未來投資方向，低碳轉型、能源效率與企業永續揭露重新受到市場關注。\n不過，部分投資人認為這類題材需要長期政策支持，短期若缺乏明確補助或訂單，股價反應可能有限。",
      points: {
        chip: 0,
        robot: 1,
        esg: 3,
        bond: 0,
        crypto: -1,
        gold: 0
      }
    },
    {
      id: "2-2",
      title: "事件資訊",
      news: "前期漲幅較大的科技與題材型資產開始出現震盪，市場討論焦點從「成長想像」轉向「何時能實際獲利」。\n部分資金選擇先落袋為安，轉往波動較低或避險性較高的資產，但也有人認為這只是短期修正。",
      points: {
        chip: -2,
        robot: -3,
        esg: -1,
        bond: 1,
        crypto: -2,
        gold: 2
      }
    },
    {
      id: "2-3",
      title: "事件資訊",
      news: "最新物價數據低於市場預期，投資人開始猜測未來資金環境是否可能轉向寬鬆。\n成長型資產受到重新關注，債券市場也出現反應。不過，部分避險資產因市場恐慌下降而受到壓力。",
      points: {
        chip: 2,
        robot: 2,
        esg: 1,
        bond: 3,
        crypto: 2,
        gold: -1
      }
    },
    {
      id: "2-4",
      title: "事件資訊",
      news: "國際局勢突然升溫，市場短期避險情緒上升。部分投資人降低高波動資產部位，轉向被視為較能保存價值的商品。\n但也有人認為，如果衝突沒有進一步擴大，市場可能很快回到原本的科技成長主線。",
      points: {
        chip: -1,
        robot: -2,
        esg: 0,
        bond: 1,
        crypto: -3,
        gold: 3
      }
    }
  ],
  3: [
    {
      id: "3-1",
      title: "事件資訊",
      news: "隨著資料中心與高效能運算需求增加，市場開始關注電力供應、能源效率與基礎設施是否足以支撐下一波科技投資。\n有些投資人看好節能與電力相關題材，也有人擔心成本上升會壓縮高成長公司的獲利空間。",
      points: {
        chip: 2,
        robot: 1,
        esg: 3,
        bond: -1,
        crypto: -1,
        gold: 0
      }
    },
    {
      id: "3-2",
      title: "事件資訊",
      news: "面對人力成本與效率壓力，部分企業開始導入自動化設備、智慧倉儲與數位管理系統。\n市場認為這可能帶動新一波實體應用需求，但也有人提醒，企業採購週期較長，短期訂單能否快速放大仍有不確定性。",
      points: {
        chip: 1,
        robot: 3,
        esg: 1,
        bond: 0,
        crypto: 0,
        gold: -1
      }
    },
    {
      id: "3-3",
      title: "事件資訊",
      news: "部分大型企業財報顯示，AI 相關投入仍在增加，但市場開始追問這些支出何時能真正轉化為獲利。\n投資人對高成長題材的態度變得更挑剔，資金短期轉向較能提供穩定現金流或避險功能的資產。",
      points: {
        chip: -2,
        robot: -2,
        esg: 0,
        bond: 1,
        crypto: -2,
        gold: 1
      }
    },
    {
      id: "3-4",
      title: "事件資訊",
      news: "市場傳出部分高風險資產的監管環境可能出現轉變，投資人對資金行情的想像重新升溫。\n不過，也有人認為這類資產波動仍高，若市場風險偏好轉弱，價格可能快速反轉。",
      points: {
        chip: 1,
        robot: 0,
        esg: -1,
        bond: -1,
        crypto: 3,
        gold: -2
      }
    }
  ],
  4: [
    {
      id: "4-1",
      title: "事件資訊",
      news: "最新通膨數據再度引發市場討論，投資人開始擔心利率可能維持高檔更久。\n高估值與高波動資產面臨壓力，部分資金轉向能對抗不確定性或通膨疑慮的商品。",
      points: {
        chip: -2,
        robot: -2,
        esg: -1,
        bond: -3,
        crypto: -2,
        gold: 2
      }
    },
    {
      id: "4-2",
      title: "事件資訊",
      news: "政府釋出產業升級方向，市場開始討論節能、智慧製造與永續轉型是否會成為下一波資金焦點。\n部分投資人認為，若政策資金與企業採購同時啟動，相關產業可能出現補漲；但短期仍要觀察執行速度。",
      points: {
        chip: 1,
        robot: 2,
        esg: 3,
        bond: 0,
        crypto: 0,
        gold: -1
      }
    },
    {
      id: "4-3",
      title: "事件資訊",
      news: "市場波動放大後，部分投資人開始降低高風險部位，轉向保本、收息或避險特性較高的資產。\n不過，市場對這是短期風險控管，還是資金風格真正轉變，仍沒有明確共識。",
      points: {
        chip: -1,
        robot: -2,
        esg: 0,
        bond: 2,
        crypto: -3,
        gold: 3
      }
    },
    {
      id: "4-4",
      title: "事件資訊",
      news: "供應鏈消息顯示，部分 AI 相關訂單開始從核心零組件擴散到設備、製造與應用端。\n市場重新評估哪些公司能真正接到訂單，而不是只停留在題材想像。資金在不同科技相關標的之間快速輪動。",
      points: {
        chip: 3,
        robot: 2,
        esg: 1,
        bond: -1,
        crypto: 1,
        gold: 0
      }
    }
  ],
  5: [
    {
      id: "5-1",
      title: "事件資訊",
      news: "市場開始看到部分企業從 AI 投資中取得效率改善與營收貢獻，投資人信心回升。\n不過，也有人提醒，若市場過度集中在少數熱門標的，後續波動可能會變得更劇烈。",
      points: {
        chip: 3,
        robot: 2,
        esg: 0,
        bond: -1,
        crypto: 2,
        gold: -1
      }
    },
    {
      id: "5-2",
      title: "事件資訊",
      news: "最新總體數據顯示景氣動能轉弱，但也讓市場重新期待未來政策可能轉向寬鬆。\n投資人一方面尋找防禦與收息機會，另一方面也開始布局未來資金環境改善後可能反彈的資產。",
      points: {
        chip: 1,
        robot: 0,
        esg: 1,
        bond: 3,
        crypto: 1,
        gold: 2
      }
    },
    {
      id: "5-3",
      title: "事件資訊",
      news: "高波動資產近期出現監管與交易安全相關討論，市場情緒轉趨謹慎。\n部分投資人選擇降低投機性部位，改持較能分散風險或保存價值的資產，但仍有人認為這只是短期雜訊。",
      points: {
        chip: -1,
        robot: -1,
        esg: 0,
        bond: 1,
        crypto: -3,
        gold: 2
      }
    },
    {
      id: "5-4",
      title: "事件資訊",
      news: "接近本輪市場循環尾聲，部分資金開始從單一熱門題材轉向多元配置。\n投資人不再只追逐最高成長，而是同時考慮科技趨勢、政策支持、利率變化與避險需求。",
      points: {
        chip: 1,
        robot: 1,
        esg: 2,
        bond: 1,
        crypto: 0,
        gold: 1
      }
    }
  ]
};

const eventExplanations = {
  "1-1": "企業提高 AI 與資料中心資本支出時，晶片與高科技供應鏈通常最先反映需求，因此晶片巨人上漲較多。智慧化升級也支撐機器人題材；但資金追逐成長資產時，公債吸引力下降，虛擬貨幣則因風險偏好升溫小幅受惠。",
  "1-2": "AI 從雲端走向工廠、倉儲與服務場景，會提高市場對自動化與實體應用的想像，因此機器人漲幅最大。晶片與 ESG 轉型也受惠於智慧控制與效率升級；黃金在風險偏好升溫時較容易轉弱。",
  "1-3": "科技股連漲後，資金常會外溢到更高波動的題材資產，虛擬貨幣因此最受激勵。晶片巨人與機器人也受惠於成長想像；但資金離開防禦與避險部位，使公債與黃金承壓。",
  "1-4": "長天期利率與資金成本升高時，高估值成長資產通常會面臨折現率壓力，晶片、機器人與虛擬貨幣都容易下跌。公債也會因利率上升而價格下跌，黃金則因不確定性上升而小幅受惠。",
  "2-1": "低碳轉型與能源效率重新受到政策與機構資金關注，ESG 轉型最直接受惠。機器人小幅受惠於智慧製造與效率升級；虛擬貨幣因資金轉向政策型與長期資產而小幅承壓。",
  "2-2": "當市場開始檢視成長題材的實際獲利，高估值與題材型資產容易被賣出，機器人與晶片巨人承壓。資金轉向收息與避險資產，使公債與黃金上漲。",
  "2-3": "物價低於預期會讓市場期待資金環境轉鬆，成長型資產與虛擬貨幣通常受惠。公債因利率下行預期而上漲更明顯；黃金則因恐慌下降、避險需求減弱而下跌。",
  "2-4": "地緣風險升溫時，市場會降低高波動資產曝險，虛擬貨幣與機器人承壓。公債與黃金因避險需求上升而受惠，其中黃金對不確定性反應更強。",
  "3-1": "資料中心與高效能運算需求增加，也會放大電力與能源效率議題，因此 ESG 轉型受惠最大。晶片巨人仍受 AI 需求支撐，但公債與虛擬貨幣在成本與資金壓力下偏弱。",
  "3-2": "企業導入智慧倉儲與自動化設備，最直接拉動機器人與智慧製造題材。晶片巨人和 ESG 轉型也受益於控制系統與效率升級；黃金在成長需求回升時略為轉弱。",
  "3-3": "當市場追問 AI 投資何時變現，資金會從高成長題材轉向較穩定或避險資產，因此晶片、機器人與虛擬貨幣下跌。公債與黃金因防禦需求上升而小幅受惠。",
  "3-4": "若高風險資產監管環境被解讀為可能轉佳，虛擬貨幣會受到資金行情期待推升。晶片巨人小幅受惠於風險偏好回升；黃金因避險需求下降而下跌。",
  "4-1": "通膨壓力上升會提高利率維持高檔的機率，公債價格與高估值資產同時承壓。虛擬貨幣也受資金成本與風險偏好下降影響；黃金因抗通膨與避險需求上升而受惠。",
  "4-2": "產業升級政策若聚焦節能、智慧製造與永續轉型，ESG 轉型最直接受惠，機器人也因智慧製造需求上升而上漲。晶片巨人小幅受益於相關設備與控制系統需求。",
  "4-3": "市場波動放大時，資金常降低高風險部位，虛擬貨幣與機器人下跌較多。公債提供收息與防禦功能，黃金則因避險與保存價值需求而上漲。",
  "4-4": "AI 訂單從核心零組件擴散到設備與應用端，晶片巨人最直接受惠，機器人也因實體應用訂單想像而上漲。公債在風險偏好回升時轉弱，虛擬貨幣小幅受惠。",
  "5-1": "企業開始看到 AI 投資帶來效率與營收貢獻，晶片巨人與機器人受基本面驗證而上漲。虛擬貨幣也受市場信心回升帶動；公債與黃金因防禦需求下降而轉弱。",
  "5-2": "景氣轉弱提高政策寬鬆想像，公債因利率下行預期而大幅受惠，黃金也因防禦需求上升而上漲。部分成長資產則因未來資金環境改善的期待而小幅支撐。",
  "5-3": "監管與交易安全疑慮會直接打擊虛擬貨幣等高波動資產，並拖累風險偏好。公債與黃金因資金轉向保守配置而受惠，晶片與機器人也因風險降低而小幅下跌。",
  "5-4": "資金從單一熱門題材轉向多元配置時，科技、政策、利率與避險資產都可能獲得部分資金。ESG 轉型因政策與長期配置支撐較明顯，其他資產則呈現溫和輪動。"
};


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

function createPointCard() {
  const product = randomItem(products);
  const point = state.currentEvent.points[product.key];
  return {
    type: "point",
    title: "點數卡",
    text: `你得知：「${product.name}」本輪為 ${signed(point)} 點。`,
    summary: `得知 ${product.name} 本輪點數。`,
    note: "請主持人私下告知該玩家"
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
  if (card.type === "point") return createPointCard();
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
    broadcast(`${player.name} 抽出了本輪小事件。`);
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
