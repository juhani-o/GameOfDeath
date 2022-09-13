# Game Of Death

Very simple game made with JavaScript with size under 13kilobytes. **Current size is 8.5Kb**.

Guide Grim with mouse, and throw scythes to direction where You are moving antagonist.

Game idea is to hit all Life Symbols (very original, yes) and get 20 points from every hit.

Game ends when three "enemies" has passed through playfield.

### Some technical stuff

\- Collision is made with array of every tenth pixels. So this is not pxel-perfect, but it does the job

. Graphics is SVG path extracted from SVG file to reduce main file size

\- By pressing "D" You can see active collision points.

That's it.