function factorial(n){
    let result = 1

    if(n == 0 || n == 1){
        return result
    }

    for(let i=1; i<=n; i++){
        result = result * i
    }

    return result
}

function P0(arrivalRate, serviceRate, numberOfServers){
    let firstPart = 0

    for(let n=0; n<=numberOfServers-1; n++){
        firstPart += (1 / factorial(n)) * (arrivalRate / serviceRate)**n
    }

    let secondPart = (1 / factorial(numberOfServers)) * (arrivalRate / serviceRate)**numberOfServers * ( (numberOfServers * serviceRate) / (numberOfServers * serviceRate - arrivalRate))

    return 1 / (firstPart + secondPart)
}

export default function MMC(arrivalRate, serviceRate, numberOfServers){
    const utilizationFactor = arrivalRate / (numberOfServers * serviceRate)
    const P0Value = P0(arrivalRate, serviceRate, numberOfServers)

    const avgNumberinQueue = ( P0Value * (arrivalRate / serviceRate)**numberOfServers * utilizationFactor ) / (factorial(numberOfServers) * (1 - utilizationFactor)**2)

    const avgWaitinQueue = avgNumberinQueue / arrivalRate
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}
