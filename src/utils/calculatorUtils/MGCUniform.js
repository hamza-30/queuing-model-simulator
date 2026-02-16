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

export default function MGCUniform(arrivalRate, minimum, maximum, numberOfServers){
    let serviceRate = 2 / (minimum + maximum)

    const utilizationFactor = arrivalRate / (numberOfServers * serviceRate)

    let serviceVariance = (maximum - minimum)**2 / 12
    let arrivalVariance = arrivalRate

    let coefficientVarianceArrival = Math.sqrt(arrivalVariance) / (arrivalRate)
    let coefficientVarianceService = Math.sqrt(serviceVariance) / ((minimum + maximum) / 2)

    let P0Value = P0(arrivalRate, serviceRate, numberOfServers)
    let avgNumberinQueue = ( P0Value * (arrivalRate / serviceRate)**numberOfServers * utilizationFactor ) / (factorial(numberOfServers) * (1 - utilizationFactor)**2)
    let avgWaitinQueueMMC = avgNumberinQueue / arrivalRate

    const avgWaitinQueueGGC = avgWaitinQueueMMC * ((coefficientVarianceArrival + coefficientVarianceService) /  2)
    const avgNumberinQueueGGC = avgWaitinQueueGGC * arrivalRate
    const avgWaitinSystem = avgWaitinQueueGGC + (1/serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueueGGC, avgWaitinQueueGGC, avgWaitinSystem, avgNumberinSystem}
}

console.log(MGCUniform(0.1 , 6 ,10, 2)) 