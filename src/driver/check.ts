const mock = async (_: {}) => {}

async function check_wasmoon(hv: {lua: unknown}) {
    if (!hv.lua) {
        throw new Error('wasmoon is required!')
    }
}

async function check_fengari(hv: {vm: {fengari: unknown}}) {
    if (!hv.vm.fengari) {
        throw new Error('fengari is required!')
    }
}

export default {
    wasmoon: {
        prepare: check_wasmoon,
        install: mock,
        startup: mock
    },
    fengari: {
        prepare: check_fengari,
        install: mock,
        startup: mock
    },
    fengari_wasmoon: {
        prepare: async (hv) => {
            let errors = 0;

            await Promise.allSettled([check_wasmoon(hv), check_fengari(hv)]).then(results => {
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
