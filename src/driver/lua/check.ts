const mock = async (_: {}) => {}

async function check_wasmoon(hv: {vm: {lua: unknown}}) {
    if (!hv.vm.lua) {
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
        prepare: mock,
        install: check_wasmoon,
        startup: mock
    },
    fengari: {
        prepare: mock,
        install: check_fengari,
        startup: mock
    },
    fengari_wasmoon: {
        install: async (hv) => {
            let errors = 0;

            try {
                await check_wasmoon(hv)
            } catch (e) {
                errors += 1;
            }

            try {
                await check_fengari(hv)
            } catch (e) {
                errors += 1;
            }

            if (errors >= 2) {
                throw new Error('wamoon or fengari is required!')
            }
        },
        prepare: mock,
        startup: mock
    }    
}
