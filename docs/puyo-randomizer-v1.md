# 20th Anniversary stream specification (v1)

Algorithm ID: `20th-anniversary-v1`. Four-color Tsuu pool; axis Puyo first.

Source: [Puyo Nexus reference code, revision 200816](https://puyonexus.com/mediawiki/index.php?title=Puyo_Puyo!!_20th_Anniversary/Upcoming_Pair_Randomizer&oldid=200816).
The [historical distribution investigation](https://puyo-camp.jp/posts/86154) describes the 256-individual-Puyo / 128-pair loop. The reference Python generates the finite pool; continuation here cycles that pool, without reseeding or reshuffling. This is the approved 20th Anniversary stream, with no claim of exact PPT2 equivalence.

1. Accept a decimal or `0x` hexadecimal integer seed in 0–65535. Preserve the original input and normalized integer. Reject invalid input rather than silently truncating it. This validation is an application policy; valid source uint16 seeds are unchanged.
2. Advance the unsigned 32-bit LCG as `(seed * 0x5d588b65 + 0x269ec3) mod 2^32`. Draw an index for range N with `floor((seed >>> 16) * N / 65536)`. JavaScript uses `Math.imul` for exact low-32-bit multiplication.
3. Start with RGBYP. Draw and remove one color at a time, with N=5,4,3,2,1. Keep the entire five-color mapping; the four-color pool may use purple and exclude a different color.
4. Generate pools in the order 3,4,5 using the same advancing LCG. Fill each of the 256 entries with its index modulo color count. For row lengths 16,32,64, visit each adjacent row pair from top to bottom. Perform length/2 swaps, drawing one index within each row per swap. There are 1973 LCG calls including color mapping.
5. Replace the first four entries of the four- and five-color pools with the first four of the three-color pool. Do not rebalance. Delivered four-color counts can differ from 64 each.
6. Read two entries per pair from the four-color pool through the mapping. Increment the absolute individual cursor by 2 and index modulo 256. Pool generation and LCG state stay fixed during consumption. The first four individual Puyos therefore use at most three colors, including every repeated opening.

Serializable state contains algorithm ID, original seed, normalized seed, final LCG state, palette, all three pools, and absolute cursor. Queue prefetched pairs and the active pair are stored separately in the Puyo session. Undo snapshots both together before drop, so prefetch does not change the delivered order or continuation at rollover.

`tests/puyo-golden.json` holds independently generated Python integer results for seeds 0,1,42,4660,34066,65535: palette, final LCG state, 16-pair prefix and SHA-256 of each complete overwritten pool. The reference generation script is `tests/puyo-reference.py`. Tests compare every pool byte through its hash, cover all 65,536 opening seeds, and verify snapshot/prefetch/rollover behavior.
