/**
 * @startuml
 * [*] --> detecting
 * detecting --> no_ccws
 * detecting --> sbtvd
 * sbtvd --> player
 * sbtvd --> no_dtv
 * player --> sbtvd
 * player --> no_dtv
 * no_dtv --> [*]
 * no_ccws --> [*]
 * @enduml
 */
enum Ginga_FSM {
    DETECTING,
    NO_CCWS,
    NO_DTV,
    SBTVD,
    PLAYER
}

let source: string | null = null
let state = Ginga_FSM.DETECTING
let position = {x: 0, y: 0, w: 0, h: 0}

const commands = {
    pause_player: async (ccws_url: string) => await fetch(`${ccws_url}/dtv/mediaplayers/1`, {
        method: 'POST',
        body: JSON.stringify({
            action: 'pause'
        })
    }),
    stop_player: async (ccws_url: string) => await fetch(`${ccws_url}/dtv/mediaplayers/1`, {
        method: 'POST',
        body: JSON.stringify({
            action: 'unload'
        })
    }),
    start_player: async (ccws_url: string) => await fetch(`${ccws_url}/dtv/mediaplayers/1`, {
        method: 'POST',
        body: JSON.stringify({
            action: 'start',
            url: source,
            pos: position
        })
    }),
    components_isdbtv: async (ccws_url: string) => {
        const request = await fetch(`${ccws_url}/dtv/current-service/components`)
        const response = await request.json() as {components: Array<{componentTag: string}>}
        return new Set(response.components.map(component => component.componentTag))
    },
    start_isdbtv: async (ccws_url: string) => {
        const components = await commands.components_isdbtv(ccws_url)
        return Promise.all(Array.from(components).map(tag => fetch(`${ccws_url}/dtv/current-service/${tag}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'start',
                pos: position
            })
        })))
    },
    stop_isdbtv: async (ccws_url: string) => {
        const components = await commands.components_isdbtv(ccws_url)
        return Promise.all(Array.from(components).map(tag => fetch(`${ccws_url}/dtv/current-service/${tag}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'stop'
            })
        })))
    },
    start: async(ccws_url: string) => {
        if (state == Ginga_FSM.PLAYER) {
            return commands.start_player(ccws_url)
        }
        if (source === null) {
            return commands.stop_isdbtv(ccws_url)
        }
        return commands.start_isdbtv(ccws_url)
    }
}

function can(type: string, url: string, score: number, ccws_url: string) {
    if (!ccws_url || ccws_url.length == 0) {
        return 0
    }

    if (!['video', 'tv'].includes(type)) {
        return 0;
    }

    if (url.startsWith("sbtvd-ts://")) {
        return score + 40
    }

    if (url.startsWith("/dev/null")) {
        return score + 40
    }

    return score;
}

function init(type: string, _channel: number, ccws_url: string) {
    if (state == Ginga_FSM.DETECTING) {
        fetch(`${ccws_url}/dtv/current-service/components`).then((response) => {
            state = response.status == 404? Ginga_FSM.NO_DTV: Ginga_FSM.SBTVD
        }).catch(() => {
            state = Ginga_FSM.NO_CCWS
        })
    }

    return {
        can: can,
        set_time: (time: number) => {
           
        },
        source: (url: string) => {
            const go_blackscreen = url.endsWith('/dev/null') || url.endsWith('null')
            const go_isdbt = url.startsWith("sbtvd-ts://") || go_blackscreen
            position = go_isdbt? {x: 0, y: 0, w: 1980, h: 1080}: {x: 0, y: 0, w: 1280, h: 720}
            source = go_blackscreen? null: url;

            const start = () => {
                state = go_isdbt? Ginga_FSM.SBTVD: Ginga_FSM.PLAYER
                commands.start(ccws_url)
            }
            
            if (state == Ginga_FSM.PLAYER && go_isdbt) {
                commands.stop_player(ccws_url).then(start)
            } else {
                start()
            }
        },
        play: () => {
            commands.start(ccws_url)
        },
        pause: () => {
            if (state == Ginga_FSM.PLAYER) {
                commands.pause_player(ccws_url)
            }
        },
        resume: () => {
            commands.start(ccws_url)
        },
        resize: (width: number, height: number) => {
            position.w = width
            position.h = height
            commands.start(ccws_url)
        },
        position: (x: number, y: number) => {
            position.x = x
            position.y = y
            commands.start(ccws_url)
        },
        destroy: () => {
            if (state == Ginga_FSM.PLAYER) {
                commands.stop_player(ccws_url).then(() => commands.start_isdbtv(ccws_url))
            } else {
                commands.start_isdbtv(ccws_url)
            }
        }
    }
}

async function create_player(hv: {media_players: Array<{can: typeof can, init: typeof init}>}, ccws_url: string) {
    hv.media_players.push({
        init: (a: string, b: number) => init(a, b, ccws_url), 
        can: (a: string, b: string, c: number) => can(a, b, c, ccws_url)
    })
}

export default {
    prepare: create_player,
    install: async () => {},
    startup: async () => {}
}
