export default function GGCUniformNormal(minimum, maximum, mean, stdDev, numberOfServers){
    let arrivalRate = 2 / (minimum + maximum)
    let serviceRate = 1 / mean

    const utilizationFactor = arrivalRate /  (numberOfServers * serviceRate)

    let arrivalVariance = (maximum - minimum)**2 / 12
    let serviceVariance = stdDev**2 

    let coefficientVarianceArrival = Math.sqrt(arrivalVariance) / ((minimum + maximum) / 2)
    let coefficientVarianceService = Math.sqrt(serviceVariance) / mean

    const avgWaitinQueue = ((coefficientVarianceArrival + coefficientVarianceService) / 2) * ( Math.pow(utilizationFactor, Math.sqrt(2 * (numberOfServers + 1)) - 1) / (numberOfServers * (1 - utilizationFactor))) * (1 / serviceRate)
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinQueue = avgWaitinQueue * arrivalRate
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}
