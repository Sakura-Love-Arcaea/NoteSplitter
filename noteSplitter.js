Array.prototype.sum = function () {
    return this.reduce((acc, cur) => acc + cur, 0);
};
const $n = (n) => {
    return 1 / n;
};

// 1. (lilypond)原始lilypond字符串: "e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 r16"
// 2. (parsed)物件數組: [{type: "e"|"r", value: number}]
// 3. (reduced)休止符合併後的分數數組: no rest
// 4. (normalized)連音線分數字符串數組: having '~' and 'u' and 'b' and 'unf' and 'bnf' and -1
// 5. (atomized) !棄用 規範分數字符串數字+附點判斷: ['0.1875'] -> ['0.125+0.0625']
// 6. (lilypond)字符串

// bug1 : 前置休止符號怎麼處理
// 重寫reduceRest+split
// parseTree，因為要計算，是否處於拍點，所以不能先reduce
// 一邊計算一邊reduce

class NoteSplitter {
    constructor(divisor, bar = 1, content = "") {
        this.divisor = divisor;
        this.bar = bar;
        this.content = content;
    }

    /**
     * parsed
     * 把lilypond字符串轉換為
     * @param {String} lilyStr Lilypond字符串（不支持附點）
     * @returns {object[]} [{type: "e"|"r", value: number}]
     */
    parseLilypond = () => {
        const lilyStr = this.content;
        const regex = /([er])(\d+)/g;
        const matchs = [...lilyStr.matchAll(regex)];
        const result = matchs.map((match) => {
            return {
                type: match[1],
                value: 1 / Number(match[2]),
            };
        });
        this.content = result;
        return this;
    };

    /**
     * reduced
     * 利用中間格式合併休止符
     * @param {object[]} [{type: "e"|"r", value: number}]
     * @returns {fraction[]} 合併休止符後的數組
     */
    reduceRest = () => {
        // 佔位符號的概念
        const parsed = this.content;
        const result = [];
        let addingflag = false;
        let temp = 0;
        let first;
        while (parsed.length > 0) {
            first = parsed.shift(); // 取出第一個
            if (first.type === "e") {
                if (addingflag) {
                    result.push({ type: "e", value: temp });
                    temp = 0;
                }
                addingflag = true;
                temp = first.value;
            } else {
                temp += first.value;
            }
        }
        result.push({ type: "e", value: temp });
        this.content = result;
        return this;
    };

    /**
     * normalized
     * 分數連音線字符串數組
     * @param {*} reduced
     * @param {boolean} [u=false] 是否在單位結束時添加 "u" 標記。
     * @param {boolean} [b=false] 是否在小節結束時添加 "b" 標記。
     * @returns {String[]} {type: "e"|"r"|"e~"|"~"|"u"|"b"|"unf"|"bnf"|"finish", value: number}
     */
    split = (b = false, u = false, terminator = false) => {
        const reduced = this.content;
        const res = []; //[{type, value}]
        const group = []; //[{type, value}]
        let first; // {type, value}
        let barC = 0;

        while (reduced.length > 0) {
            first = reduced.shift();
            group.push(first);
            if (group.reduce((acc, cur) => acc + cur.value, 0) === this.divisor) {
                res.push(...group);
                if (u) res.push({ type: "separator", value: "u" });
                barC += this.divisor;
                group.length = 0;
            }

            if (group.reduce((acc, cur) => acc + cur.value, 0) > this.divisor) {
                const last = group.pop(); // {type, value}
                const remain = group.reduce((acc, cur) => acc + cur.value, 0); // fraction
                const fill = this.divisor - remain; // fraction
                const tie = { first: fill, second: last.value - fill };
                // group.push(tie.first);
                reduced.unshift({ type: "~", value: tie.second });
                res.push(...group, { type: "e~", value: tie.first });
                if (u) res.push({ type: "separator", value: "u" });
                barC += this.divisor;
                group.length = 0;
            }
            if (barC === this.bar) {
                if (b) res.push({ type: "separator", value: "b" });
                barC = 0;
            }
        }
        res.push(...group);
        if (group.length > 0) res.push({ type: "finish", value: "unf" });
        if (barC > 0) res.push({ type: "finish", value: "bnf" });
        // unf aka unit not finish
        // bnf aka bar not finish
        if (terminator) res.push({ type: "finish", value: -1 });
        this.content = res;
        return this;
    };
    /**
     *
     * @returns 根據連音不連音，加上連音符號、處理換行，返回lilypond字符串
     */
    lilypond = () => {
        const normalized = this.content;
        const dotMap = {
            0.03125: "32", // 1/32 a.k.a 32
            0.0625: "16", // 1/16 a.k.a 16
            0.125: "8", // 1/8  a.k.a 8
            0.25: "4", // 1/4  a.k.a 4
            0.5: "2", // 1/2  a.k.a 2

            0.09375: "16.", // 3/16 a.k.a  16.
            0.1875: "8.", // 3/8  a.k.a  8.
            0.375: "4.", // 3/4  a.k.a  4.
            0.75: "2.", // 3/2  a.k.a  2.

            0.21875: "8..", // 7/8  a.k.a  8..
            0.4375: "4..", // 7/4  a.k.a  4..
            0.875: "2..", // 7/2  a.k.a  2..
        };

        const result = normalized.map((item) => {
            if (item.type === "separator" && item.value === "b") {
                return "\n";
            }
            if (item.type === "e~") {
                return `e${dotMap[item.value] || item.value}~`;
            } else if (item.type === "~") {
                return `${dotMap[item.value] || item.value}`;
            } else if (item.type === "e") {
                return `e${dotMap[item.value] || item.value}`;
            }
        });

        this.content = result;
        return this;
    };

    join = () => {
        let result = "";
        this.content.forEach((element) => {
            if (element === "\n") {
                result += "\n";
            } else {
                result += element + " ";
            }
        });
        this.content = result;
        return this;
    };
}

export { NoteSplitter, $n };
