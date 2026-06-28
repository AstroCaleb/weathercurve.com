---
'weather-curve': patch
---

Fix high/low temperatures being offset by one day when scrolling the timeline. Daily highs/lows were matched to hourly points using UTC day boundaries with a full-day tolerance, which selected the previous day's daily record in timezones west of UTC. Days are now matched by their local calendar date using the location's timezone.
