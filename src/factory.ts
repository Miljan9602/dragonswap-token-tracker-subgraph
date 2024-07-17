import {PairCreated} from "../generated/Factory/Factory"

import {Token} from '../generated/schema'
import {fetchTokenDecimals, fetchTokenName, fetchTokenSymbol} from "./helpers";
import {DataSourceTemplate, log} from '@graphprotocol/graph-ts'

export function handleNewPair(event: PairCreated): void {

    // create the tokens
    let token0 = Token.load(event.params.token0.toHexString())
    let token1 = Token.load(event.params.token1.toHexString())

    if (token0 === null) {
        token0 = new Token(event.params.token0.toHexString())
        token0.symbol = fetchTokenSymbol(event.params.token0)
        token0.name = fetchTokenName(event.params.token0)
        let decimals = fetchTokenDecimals(event.params.token0)

        // bail if we couldn't figure out the decimals
        if (decimals === null) {
            log.debug('mybug the decimal on token 0 was null', [])
            return
        }

        token0.decimals = decimals
        token0.save()

        // Erc20TokenTemplate.bind(event.params.token0);
        DataSourceTemplate.create("Erc20Token", [event.params.token0.toHex()]);
    }

    if (token1 === null) {
        token1 = new Token(event.params.token1.toHexString())
        token1.symbol = fetchTokenSymbol(event.params.token1)
        token1.name = fetchTokenName(event.params.token1)
        let decimals = fetchTokenDecimals(event.params.token1)

        // bail if we couldn't figure out the decimals
        if (decimals === null) {
            log.debug('mybug the decimal on token 1 was null', [])
            return
        }

        token1.decimals = decimals
        token1.save()

        DataSourceTemplate.create("Erc20Token", [event.params.token1.toHex()]);
    }
}