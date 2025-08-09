# IsSimilar

The IsSimilar action calculates the relative similarity of two arbitrary strings using the [Hamming](https://en.wikipedia.org/wiki/Hamming_distance) or [Levenshtein](https://en.wikipedia.org/wiki/Levenshtein_distance) distance. Alternatively, the action can also use a custom "symbols" strategy.

```
IsSimilar(
    val1: str,
    val2: str,
    strategy: Literal['hamming', 'levenshtein', 'symbols'] = 'hamming',
    threshold: float | 0.4
)
```

*   **val1, val2:** Strings to compare.
*   **strategy:** Comparison algorithm.
*   **threshold:** Value from 0 to 1 (Default 0.4).

The example below uses the Hamming Distance to calculate a similarity score to compare with the threshold value.

```
{{set(name="result_1", value=IsSimilar(val1="text", val2="test"))}}

{{SendMessage(message=result_1)}}

{{set(name="result_2", value=IsSimilar(val1="text", val2="test", threshold=0.9))}}

{{SendMessage(message=result_2)}}
```

```
t
```

The similarity score formula is:

```
score = 1 - (distance / len(val1) + len(val2))
```

For "result\_1," the distance is 1, which means the score is:

```
score = 1 - (1 / (4+4)) = 0.875
```

Since 0.875 > 0.4 (the default threshold value), the result of the IsSimilar action is "t."

For "result\_2," the distance is still 1, which means the score is:

```
score = 1 - (1 / (4+4)) = 0.875
```

However, since 0.875 < 0.9 (the new threshold value), the result of the IsSimilar action is " " and will not send a message to the Sandbox chat when testing.

The example below uses the Levenshtein Distance to calculate a similarity score to compare with the threshold value.

```
{{set(name="result_1", value=IsSimilar(val1="to be or not to be", val2="to beer or not to beer", strategy="levenshtein", threshold=0.95))}}

{{SendMessage(message=result_1)}}

{{set(name="result_2", value=IsSimilar(val1="to be or not to be", val2="to beer or not to beer", strategy="levenshtein", threshold=0.5))}}

{{SendMessage(message=result_2)}}
```

```
t
```

The similarity score formula is:

```
score = 1 - (distance / len(val1) + len(val2))
```

For "result\_1," the distance is 4, which means the score is:

```
score = 1 - (4 / (18+22)) = 0.9
```

Since 0.9 < 0.95 (the threshold value), the result of the IsSimilar action is " " and will not send a message to the Sandbox chat when testing.

For "result\_2," the distance is still 4, which means the score is:

```
score = 1 - (1 / (18+22)) = 0.9
```

However, since 0.9 > 0.5 (the new threshold value), the result of the IsSimilar action is "t."

The example below uses a custom "symbols" strategy to check for full-string similarity (i.e., both strings match 100%). All symbols (except characters and numbers) are removed from the strings and made lowercase before comparing their similarity. This strategy does not use the threshold parameter since it is looking for an equal string match.

```
{{set(name="result_1", value=IsSimilar(val1="   ! *st*rin%g ", val2=" sTrIng  ", strategy="symbols"))}}

{{SendMessage(message=result_1)}}
```

```
t
```

The val1 and val2 strings, with their symbols and spaces removed and in lower case, show that they are equal, which returns a "t." If the strings did not match, then " " would be returned.

Updated 4 months ago

* * *
