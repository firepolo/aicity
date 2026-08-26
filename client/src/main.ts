import booter from "./core/booter"
import game from "./core/game"

await booter.boot();
game.initialize()
game.start();
