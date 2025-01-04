# NoteSplitter

# v0.0.1

流程思想：

1. (lilypond)原始 lilypond 字符串: "e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 r16"
2. (parsed)物件數組: [{type: "e"|"r", duration: number}]
3. (reduced)休止符合併後的分數數組: no rest
4. (normalized)連音線分數字符串數組: having '~' and 'u' and 'b' and 'unf' and 'bnf' and -1
5. (atomized) !棄用 規範分數字符串數字+附點判斷: ['0.1875'] -> ['0.125+0.0625']
6. (lilypond)字符串
