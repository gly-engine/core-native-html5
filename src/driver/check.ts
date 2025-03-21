const mock = async (_: {}) => {}

async function wasmoon(hv: {lua: unknown}) {
    if (!hv.lua) {
        throw new Error('wasmoon is required!')
    }
}

async function fengari(hv: {fengari: unknown}) {
    if (!hv.fengari) {
        throw new Error('fengari is required!')
    }
}

export default {
    wasmoon: {
        prepare: wasmoon,
        install: mock,
        startup: mock
    },
    fengari: {
        prepare: fengari,
        install: mock,
        startup: mock
    },
    fengari_wasmoon: {
        prepare: async (hv) => {
            let errors = 0;

            await Promise.allSettled([fengari(hv), wasmoon(hv)]).then(results => {
                errors = results.filter(result => result.status === "rejected").length
            })

            if (errors >= 2) {
                throw new Error('wamoon or fengari is required!')
            }
        },
        install: mock,
        startup: mock
    }    
}
