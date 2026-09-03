import loader from "./core/loader"
import game from "./core/game"

await loader.boot();
game.initialize()
game.start();
