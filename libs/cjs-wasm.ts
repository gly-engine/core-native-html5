import core_native_html5 from '../src/index.ts'
import { LuaFactory, LuaMultiReturn } from 'wasmoon'

const Game = () => {
    const data = {
    }

    return {
        meta: {
            title: "Ping Pong",
            author: "Rodrigo Dornelles"
        },
        callbacks: {
            init: (std, game) => {
                data.score = 0;
                data.highscore = data.highscore == null ? 0 : data.highscore;
                data.player_size = game.height / 8;
                data.player_pos = game.height / 2 - data.player_size / 2;
                data.ball_pos_x = game.width / 2;
                data.ball_pos_y = game.height / 2;
                data.ball_spd_x = 0.3;
                data.ball_spd_y = 0.06;
                data.ball_size = 8;
            },
            loop: (std, game) => {
                const player_dir = std.math.dir(std.key.press.down - std.key.press.up);
                data.player_pos = std.math.clamp(data.player_pos + (player_dir * 7), 0, game.height - data.player_size);
                data.ball_pos_x += data.ball_spd_x * game.dt;
                data.ball_pos_y += data.ball_spd_y * game.dt;
        
                if (data.ball_pos_x >= (game.width - data.ball_size)) {
                    data.ball_spd_x = -Math.abs(data.ball_spd_x);
                }
                if (data.ball_pos_y >= (game.height - data.ball_size)) {
                    data.ball_spd_y = -Math.abs(data.ball_spd_y);
                }
                if (data.ball_pos_y <= 0) {
                    data.ball_spd_y = Math.abs(data.ball_spd_y);
                }
                if (data.ball_pos_x <= 0) {
                    if (std.math.clamp(data.ball_pos_y, data.player_pos, data.player_pos + data.player_size) === data.ball_pos_y) {
                        let new_spd_y = std.math.clamp(data.ball_spd_y + (data.player_pos % 10) - 5, -10, 10);
                        data.ball_spd_y = (data.ball_spd_y === 0 && new_spd_y === 0) ? 20 : new_spd_y;
                        data.ball_spd_y /= 16;
                        data.ball_spd_x = Math.abs(data.ball_spd_x) * 1.003;
                        data.score++;
                    } else {
                        std.game.reset();
                    }
                }
            },
            draw: (std) => {
                std.draw.clear(std.color.black);
                std.draw.color(std.color.white);
                std.draw.rect(0, 4, data.player_pos, 8, data.player_size);
                std.draw.rect(0, data.ball_pos_x, data.ball_pos_y, data.ball_size, data.ball_size);
                //std.draw.font('Tiresias', 32);
                //std.draw.text(game.width / 4, 16, data.score);
                //std.draw.text(game.width / 4 * 3, 16, data.highscore);
            },
            exit: (std) => {
                data.highscore = Math.max(data.highscore, data.score);
            }
        }

    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.gly = await core_native_html5()
        .set_el_canvas('#gameCanvas')
        .set_library('wasmoon', LuaFactory, LuaMultiReturn)
        //.set_library('fengari', fengari)
        .set_library('resize', {widescreen: true})
        .set_library('runtime')
        .set_library('keyboard')
        //.set_engine('https://cdn.jsdelivr.net/npm/@gamely/gly-engine')
        .set_engine('https://cdn.jsdelivr.net/npm/@gamely/gly-engine@0.0.8/dist/main.lua')
        .set_game('https://raw.githubusercontent.com/gamelly/gly-engine/refs/tags/0.0.8/examples/asteroids/game.lua')
        //.set_engine('https://cdn.jsdelivr.net/npm/@gamely/love-engine@0.0.17/dist/main.lua')
        //.set_game('https://raw.githubusercontent.com/gamelly/love-engine/refs/tags/0.0.17/samples/pong/main.lua')
        //.set_game('https://raw.githubusercontent.com/gamelly/gly-engine/refs/heads/main/sa
        //.set_game(Game())
        // mples/pong/game.lua')
        .build()
})
