Array.prototype.sum = function () {
    return this.reduce((acc, cur) => acc + cur, 0);
};
const $n = (n) => {
    return 1 / n;
};

// 1. (lilypond)原始lilypond字符串: "e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 r16"
// 2. (parsed)物件數組: [{type: "e"|"r", duration: number}]
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
     * @returns {object[]} [{type: "e"|"r", duration: number}]
     */
    parseLilypond = () => {
        const lilyStr = this.content;
        const regex = /([er])(\d+)/g;
        const matchs = [...lilyStr.matchAll(regex)];
        const result = matchs.map((match) => {
            return {
                type: match[1],
                duration: 1 / Number(match[2]),
            };
        });
        this.content = result;
        return this;
    };

    /**
     * reduced
     * 利用中間格式合併休止符
     * @param {object[]} [{type: "e"|"r", duration: number}]
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
                    result.push(temp);
                    temp = 0;
                }
                addingflag = true;
                temp = first.duration;
            } else {
                temp += first.duration;
            }
        }
        result.push(temp.toString());
        this.content = result;
        return this;
    };

    /**
     * normalized
     * 分數連音線字符串數組
     * @param {*} reduced
     * @param {boolean} [u=false] 是否在單位結束時添加 "u" 標記。
     * @param {boolean} [b=false] 是否在小節結束時添加 "b" 標記。
     * @returns {String[]} [fraction + "~" + "u" + "b" + "unf" + "bnf" + -1]
     */
    split = (b = false, u = false, terminator = false) => {
        const reduced = this.content;
        const res = [];
        const group = [];
        let first;
        let barC = 0;
        while (reduced.length > 0) {
            first = reduced.shift();

            group.push(first);
            if (group.reduce((acc, cur) => acc + cur, 0) === this.divisor) {
                res.push(...group.map((e) => `${e}`));
                if (u) res.push("u");
                barC += this.divisor;
                group.length = 0;
            }
            if (group.reduce((acc, cur) => acc + cur, 0) > this.divisor) {
                const last = group.pop();
                const remain = group.reduce((acc, cur) => acc + cur, 0);
                const fill = this.divisor - remain;
                const tie = { first: fill, second: last - fill };
                // group.push(tie.first);
                reduced.unshift(tie.second);
                res.push(...group.map((e) => `${e}`), `${tie.first}~`);
                if (u) res.push("u");
                barC += this.divisor;
                group.length = 0;
            }
            if (barC === this.bar) {
                if (b) res.push("b");
                barC = 0;
            }
        }
        res.push(...group.map((e) => `${e}`));
        if (group.length > 0) res.push("unf");
        if (barC > 0) res.push("bnf");
        // unf aka unit not finish
        // bnf aka bar not finish
        if (terminator) res.push(-1);
        this.content = res;
        return this;
    };

    /**
     * atomize
     * 如何用+號表示附點['0.1875'] -> ['0.125+0.0625']
     */
    atomize = () => {
        const normalized = this.content;
        // method 1 自己查（跳過原子化）
        const dotMap = {
            0.09375: "0.0625+0.03125", // 3/16 a.k.a  16.
            0.1875: "0.125+0.0625", // 3/8  a.k.a  8.
            0.375: "0.25+0.125", // 3/4  a.k.a  4.
            0.75: "0.5+0.25", // 3/2  a.k.a  2.

            0.21875: "0.125+0.0625+0.03125", // 7/8  a.k.a  8..
            0.4375: "0.25+0.125+0.0625", // 7/4  a.k.a  4..
            0.875: "0.5+0.25+0.125", // 7/2  a.k.a  2..
        };
        const regex = /(\d+\.\d+)/;
        const result = normalized.map((fraction) => {
            return fraction.replace(regex, (match) => {
                return dotMap[match] || match;
            });
        });
        this.content = result;
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
        const regex = /\d+\.\d+/;
        let flag = false;

        const result = normalized.map((fraction) => {
            if (fraction.includes("b")) {
                return "\n";
            }
            let replace = flag ? "" : "e";
            replace += fraction.replace(regex, (match) => dotMap[match] || match);
            flag = fraction.includes("~");
            return replace;
        });

        this.content = result;
        return this;
    };

    join = () => {
        // 解決\n問題
    };
}

export { NoteSplitter, $n };
