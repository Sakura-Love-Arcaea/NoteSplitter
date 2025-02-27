# NoteSplitter

## v0.1.0

### 流程思想

1. (lilypond)原始 lilypond 字符串: `"e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 r16"`
2. (parsed)物件數組: `[{type: "e"|"r", duration: number}]`
3. (reduced)休止符合併後的分數數組: `no rest`
4. (normalized)連音線分數字符串數組: `having '~' and 'u' and 'b' and 'unf' and 'bnf' and -1`
5. (atomized) !棄用 規範分數字符串數字+附點判斷:` ['0.1875'] -> ['0.125+0.0625']`
6. (lilypond)字符串

### bug:

1. 前置休止符號怎麼處理

### sol:

1. 重寫 reduceRest+split
2. parseTree，因為要計算，是否處於拍點，所以不能先 reduce
3. 一邊計算一邊 reduce

## v0.1.1

1. 未改善休止符前置問題

2. 變量改名`duration`->`value`

3. 改善數據表達: 把 parse 轉換為`[fraction]`改為 parseTree（主要改動 reduce, split, lilypond）

4. parseTree: `[{type: "e"|"r"|"e~"|"~"|"finish", value: number}]`

5. 刪除 `atomize`，因為沒有用到

## v0.1.2

1. 改善休止符前置問題

2. 修改 reduceRest 函數，利用 Queue

3. 連帶修改 lilypond 函數，修正輸出

4. 發現問題：split 函數錯誤處理休止符，休止符不能用有連音線，應該另行處理
