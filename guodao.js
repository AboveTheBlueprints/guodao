// 过道（第二个，第 17 天）：过道.py 的规矩搬过来，一字一句对齐；node 里拿来跟 python 逐串对。
(function (root) {
  const WEEKS = 8, YOU = 3, START_STOCK = 3, RANGE = 2, HUB = 2, YOU_N = 2;
  const NAME = {1: "老周", 2: "王婶", 3: "你", 4: "孙家", 5: "刘家", 6: "小赵"};
  const FACE = {1: "老周（一个人过，老伴前年走了）", 2: "王婶（六个孩子，男人在外地）", 3: "你",
    4: "孙家（孙师傅在锅炉房，媳妇糊纸盒）", 5: "刘家（小两口，媳妇快生了）", 6: "小赵（厂里刚放了长假，一个人）"};
  const KINDS = [[1, ["冷", "病", "冷"]], [2, ["粮", "粮", "病"]], [4, ["病", "冷", "粮"]], [5, ["生", "粮", "冷"]], [6, ["活", "粮", "冷"]]];
  const SIGN = {"冷": "{n}屋里的炉子这两天没怎么冒烟", "粮": "{h}的孩子在楼道里转悠，往别人家门里看", "病": "{n}那屋夜里一直有人咳",
    "生": "刘家媳妇肚子往下坠了，小被子还没做", "活": "小赵这两天一早出门、天黑才回，脸一天比一天灰"};
  const NOW = {"冷": "{n}的煤烧完了，屋里跟外头一样冷", "粮": "{h}面缸见底了", "病": "{n}躺下了，起不来", "生": "刘家媳妇要生了", "活": "小赵交不上这个月的房钱"};
  const FALL = {"冷": "{n}裹着被子熬了一礼拜，冻出了病根", "粮": "{h}那礼拜一天只吃一顿", "病": "{n}一个人硬扛着，没人端口水",
    "生": "刘家孩子生下来了，没小被子，裹的是他爸的旧棉袄", "活": "小赵让房东堵在门口说了半个钟头"};
  const GONE = {1: "老周让他闺女接走了，门上了锁", 2: "王婶把孩子带回乡下了，那间屋空了", 4: "孙家搬去媳妇娘家挤着了", 5: "刘家抱着孩子回了男方老家", 6: "小赵卷了铺盖走了，没跟谁说"};
  const HOW = {1: "提着暖壶过去", 2: "端了一碗面汤过去", 4: "拉了半车煤过去", 5: "过去帮着缝缝补补", 6: "过去帮着扛扛抬抬"};
  const KHOW = {"冷": "抱了一捆劈柴过去", "粮": "舀了一瓢面过去", "病": "过去守了半宿", "生": "过去烧水跑腿", "活": "凑了几十块钱过去"};
  const KOWN = new Set(["1冷", "1病", "2粮", "4冷", "5生", "5病"]);
  const YOUR_KINDS = ["冷", "病"], HANDS = ["病", "生"];
  const STUFF = {"冷": "一筐煤", "粮": "半袋面", "活": "攒下的几十块钱", "病": "一包红糖和几个鸡蛋", "生": "一包红糖和几个鸡蛋", "": "半袋面"};
  const SIGN_D = {"4粮": "孙家媳妇这两天糊纸盒糊到半夜", "5粮": "刘家小两口这两天晚饭桌上就一碟咸菜", "6粮": "小赵这两天老在水房接凉水喝"};
  const NOW_D = {"6粮": "小赵兜里就剩两毛钱"}, FALL_D = {"6粮": "小赵那礼拜一天就吃一个馒头"};
  const YOU_SIGN = {"冷": "收音机说下礼拜寒潮，你家煤也不多了", "病": "你这两天嗓子发紧，浑身发沉"};
  const YOU_NOW = {"冷": "寒潮来了，你屋里冷得握不住笔", "病": "你病了，起不来"};
  const DOORS = [1, 2, 3, 4, 5, 6];

  const hn = d => NAME[d].endsWith("家") ? NAME[d] : NAME[d] + "家";
  const fmt = (s, d) => s.replace(/\{n\}/g, NAME[d]).replace(/\{h\}/g, hn(d));
  const how = (h, k) => (k == null || KOWN.has(h + k)) ? HOW[h] : KHOW[k];
  const K = (d, w) => d + "," + w;

  function R32(seed) {
    let a = seed >>> 0;
    const random = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ ((t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0)) >>> 0)) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      random,
      randint: (lo, hi) => lo + Math.floor(random() * (hi - lo + 1)),
      sample: (xs, n) => { xs = xs.slice(); const out = []; for (let i = 0; i < n; i++) out.push(xs.splice(Math.floor(random() * xs.length), 1)[0]); return out; },
    };
  }

  function setup(seed) {
    const r = R32(seed), need = {};
    for (const [d, ks] of KINDS) {
      const weeks = [];
      if (d === 5) weeks.push(r.randint(3, 5));
      while (weeks.length < 3) {
        const w = r.randint(1, WEEKS);
        if (weeks.every(x => Math.abs(w - x) >= 2)) weeks.push(w);
      }
      const ws = weeks.slice().sort((a, b) => a - b);
      if (d === 5) {
        const birth = weeks[0], others = ws.filter(w => w !== birth);
        need[K(5, birth)] = "生"; need[K(5, others[0])] = "粮"; need[K(5, others[1])] = "冷";
      } else ks.forEach((k, i) => { need[K(d, ws[i])] = k; });
    }
    const yw = r.sample([4, 5, 6, 7, 8], YOU_N).sort((a, b) => a - b);
    yw.forEach((w, i) => { need[K(YOU, w)] = YOUR_KINDS[i % 2]; });
    return need;
  }

  function simulate(seed, acts) {
    const need = setup(seed);
    const N = k => need[k];
    const has = (d, w) => need[K(d, w)] !== undefined;
    const mk = v => { const o = {}; DOORS.forEach(d => o[d] = (typeof v === "function" ? v() : v)); return o; };
    const alive = mk(true), fall = mk(0), debt = mk(false), got = mk(0), gotfrom = mk(() => []), hearty = mk(false), fell = mk(() => []);
    const tokens = [], log = [], door = [], lent = [], pre = {};
    let stock = START_STOCK, sick = false, over = null;
    const newTok = (at, w, src) => ({at, since: w, idle: 0, path: [[w, src, at]], cold: null, src, home: null});
    for (let w = 1; w <= WEEKS; w++) {
      if (w - 1 >= acts.length) break;
      const a = acts[w - 1], lines = [], met = {};
      const down = sick || need[K(YOU, w)] === "病";
      for (const d of Object.keys(pre).map(Number)) {
        if (pre[d] === w && alive[d] && has(d, w)) {
          met[d] = "你";
          lines.push(need[K(d, w)] === "病" ? `${NAME[d]}这礼拜没躺下，上礼拜那碗姜汤顶住了。` : "刘家媳妇生了，小被子是现成的，孩子一落地就裹上了。");
          delete pre[d];
        }
      }
      if (a[0] === "搭") {
        const t = a[1], k = need[K(t, w)];
        if (down) lines.push("你起不来，哪儿也没去。");
        else if (!alive[t]) lines.push(`${NAME[t]}那屋已经空了。`);
        else if (HANDS.includes(k)) {
          met[t] = "你";
          lines.push(`你空着手去了${hn(t)}，` + (k === "病" ? "端水、熬粥、守了半宿。" : "烧水、看着门、跑腿叫人，一直待到孩子哭出声。"));
          tokens.push(newTok(t, w, YOU)); got[t]++; gotfrom[t].push([w, YOU]);
        } else if (k) {
          lines.push(`你空着手去了${hn(t)}，坐了一会儿，帮着收拾收拾。可他们缺的是` + {"冷": "煤", "粮": "吃的", "活": "钱"}[k] + "，你两只手变不出来。");
        } else if (HANDS.includes(need[K(t, w + 1)])) {
          const k2 = need[K(t, w + 1)];
          pre[t] = w + 1;
          lines.push(`你去${hn(t)}坐了一会儿，` + (k2 === "病" ? "看他咳得厉害，逼着他喝了一大碗姜汤，盯着他睡下。" : "帮着把小被子絮好了，又问清了医院怎么走。"));
          tokens.push(newTok(t, w, YOU)); got[t]++; gotfrom[t].push([w, YOU]);
        } else lines.push(`你去${hn(t)}坐了一会儿，说了说闲话。`);
      } else if (a[0] === "给" || a[0] === "借") {
        const t = a[1];
        if (down) lines.push("你起不来，哪儿也没去。");
        else if (stock <= 0) lines.push("你家里已经拿不出什么了。");
        else if (!alive[t]) lines.push(`${NAME[t]}那屋已经空了。`);
        else if (a[0] === "借" && !has(t, w)) lines.push(`${NAME[t]}说眼下用不着，谢谢你。`);
        else {
          stock--;
          const k = need[K(t, w)];
          if (a[0] === "借") {
            debt[t] = w; met[t] = "你"; lent.push([w, t]);
            lines.push(`你借了${NAME[t]}二十块钱，让他` + {"冷": "去买煤", "粮": "去买面", "活": "先把房钱交上", "病": "去拿药", "生": "去交住院的押金"}[k] + "，说好礼拜天发了补助就还你。");
          } else {
            if (k && !(t in met)) met[t] = "你";
            lines.push(`你拿了${STUFF[k || ""]}去${hn(t)}，没说别的就回来了。` + (k ? "" : `${NAME[t]}这礼拜倒也没什么难处，愣了一下收下了。`));
            tokens.push(newTok(t, w, YOU)); got[t]++; gotfrom[t].push([w, YOU]);
          }
        }
      } else if (down) lines.push("你起不来。");
      sick = false;
      const busy = h => debt[h] || (has(h, w) && !(h in met));
      const needyNear = h => {
        const c = DOORS.filter(d => d !== h && alive[d] && Math.abs(d - h) <= RANGE && has(d, w) && !(d in met));
        c.sort((x, y) => (Math.abs(x - h) - Math.abs(y - h)) || (fall[y] - fall[x]) || (x - y));
        return c.length ? c[0] : null;
      };
      for (const tk of tokens) {
        if (tk.cold || tk.home || tk.since >= w) continue;
        const h = tk.at;
        if (!alive[h]) { tk.cold = [w, "走了"]; continue; }
        if (busy(h)) { tk.idle++; if (tk.idle >= 2) tk.cold = [w, "欠着"]; continue; }
        const d = needyNear(h);
        if (d === null) { tk.idle++; if (tk.idle >= 2) tk.cold = [w, "凉"]; continue; }
        met[d] = h; tk.path.push([w, h, d]); tk.at = d; tk.since = w; tk.idle = 0;
        if (d === YOU) { tk.home = w; door.push([w, h, tk]); lines.push(`${NAME[h]}${how(h, need[K(d, w)])}，敲的是你家的门。`); }
        else { got[d]++; gotfrom[d].push([w, h]); lines.push(`${NAME[h]}${how(h, need[K(d, w)])}，去的是${hn(d)}。`); }
      }
      for (const h of DOORS) {
        if (h === YOU || !alive[h] || !hearty[h] || busy(h)) continue;
        const d = needyNear(h);
        if (d === null) continue;
        met[d] = h;
        if (d === YOU) { door.push([w, h, null]); lines.push(`${NAME[h]}又${how(h, need[K(d, w)])}，这回是你家。没人叫。`); }
        else { got[d]++; gotfrom[d].push([w, h]); tokens.push(newTok(d, w, h)); lines.push(`${NAME[h]}又${how(h, need[K(d, w)])}，去的是${hn(d)}。没人叫。`); }
      }
      if (has(YOU, w) && !(YOU in met) && stock > 0) { stock--; met[YOU] = "自己"; lines.push("你翻出家里剩的，自己扛过去了。"); }
      for (const d of DOORS) {
        if (!alive[d] || !has(d, w)) continue;
        const k = need[K(d, w)];
        if (d in met) continue;
        fall[d]++;
        if (d === YOU) {
          lines.push("没人来。你一个人熬着，落下了病，下礼拜下不了床。");
          sick = true;
          if (fall[d] >= 2) over = "你也撑不住了，礼拜天你哥来把你接回了老家。";
        } else {
          const ft = fmt(FALL_D[d + k] || FALL[k], d);
          fell[d].push([w, ft]); lines.push(ft + "。");
          if (fall[d] >= 2) { alive[d] = false; lines.push(GONE[d] + "。"); }
        }
      }
      for (const d of DOORS) {
        if (debt[d]) {
          debt[d] = false;
          if (alive[d]) { stock++; lines.push(`礼拜天${NAME[d]}把那二十块钱还回来了。`); }
          else lines.push(`借给${NAME[d]}的那二十块钱，跟着他家一起走了。`);
        }
      }
      for (const d of DOORS) {
        if (d !== YOU && alive[d] && got[d] >= HUB && !hearty[d]) { hearty[d] = true; lines.push(`${NAME[d]}在楼道里跟人说：“谁家有事，言一声。”`); }
      }
      log.push({w, lines, act: a});
      if (over) break;
    }
    return {log, st: {need, alive, fall, debt, hearty, tokens, stock, sick, over, door, gotfrom, lent, fell}};
  }

  // 这礼拜的样子：每个门上画什么、底下几句话
  function weekView(w, st) {
    const need = st.need, doors = [], said = [];
    for (const d of DOORS) {
      const m = {d, name: NAME[d], gone: !st.alive[d], now: need[K(d, w)], next: need[K(d, w + 1)],
        warm: st.tokens.filter(t => t.at === d && !t.cold && !t.home && d !== YOU).length, heart: st.hearty[d], owe: st.debt[d]};
      doors.push(m);
    }
    for (const d of DOORS) if (st.alive[d] && need[K(d, w)]) { const k = need[K(d, w)]; said.push(d === YOU ? YOU_NOW[k] : fmt(NOW_D[d + k] || NOW[k], d)); }
    for (const d of DOORS) if (st.alive[d] && need[K(d, w + 1)]) { const k = need[K(d, w + 1)]; said.push(d === YOU ? YOU_SIGN[k] : fmt(SIGN_D[d + k] || SIGN[k], d)); }
    const down = st.sick || need[K(YOU, w)] === "病";
    return {doors, said, stock: st.stock, down};
  }

  function ending(st) {
    const out = [];
    for (const d of DOORS) {
      if (d === YOU) continue;
      const fl = st.fell[d].map(([a, b]) => `第${a}礼拜${b}。`).join("");
      if (!st.alive[d]) out.push(`${FACE[d]}：${fl}${GONE[d]}。`);
      else out.push(`${FACE[d]}：还在。` + (st.fall[d] === 0 ? "这个冬天没落下什么。" : fl) + (st.hearty[d] ? "后来谁家有事都去搭把手。" : ""));
    }
    out.push("你：" + (st.over ? "回了老家。" : "还在。") + `家里还剩 ${st.stock} 回。`);
    const doorLines = st.door.map(([w, h, tk]) => `第${w}礼拜，${NAME[h]}。` + (tk ? "" : "没人叫，自己来的。"));
    const lentLine = st.lent.length ? "借出去的：" + st.lent.map(([w, t]) => `第${w}礼拜借给${NAME[t]}`).join("、") + "（都只管那一礼拜，过后还回来了，没往下传）。" : "";
    const paths = st.tokens.map(tk => {
      const p = tk.path, s = tk.src === YOU ? "你" : NAME[tk.src];
      let seg = `第${p[0][0]}礼拜 ${s}→${NAME[p[0][2]]}`;
      for (const [w, a, b] of p.slice(1)) seg += ` →第${w}礼拜 ${NAME[b]}`;
      if (tk.home) seg += tk.src === YOU ? "（回到了你家门口）" : "（到了你家门口）";
      else if (tk.cold) seg += `（停在${NAME[tk.at]}，` + {"凉": "身边没人有难处，凉了", "欠着": "那家手里压着借你的东西，揣着没往下给", "走了": "那家搬走了"}[tk.cold[1]] + "）";
      else seg += `（开春还在${NAME[tk.at]}手里）`;
      return {seg, path: p, home: !!tk.home, src: tk.src};
    });
    return {homes: out, doorLines, lentLine, paths};
  }

  const api = {WEEKS, YOU, NAME, FACE, START_STOCK, HANDS, setup, simulate, weekView, ending};
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.GD = api;
})(typeof window !== "undefined" ? window : this);
