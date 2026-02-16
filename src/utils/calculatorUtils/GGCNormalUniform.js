export default function GGCNormalUniform(mean, stdDev, minimum, maximum, numberOfServers){
    let arrivalRate = 1 / mean
    let serviceRate = 2 / (minimum + maximum)

    const utilizationFactor = arrivalRate /  (numberOfServers * serviceRate)

    let arrivalVariance = stdDev**2
    let serviceVariance = (maximum - minimum)**2 / 12

    let coefficientVarianceArrival = Math.sqrt(arrivalVariance) / mean
    let coefficientVarianceService = Math.sqrt(serviceVariance) / ((minimum + maximum) / 2)

    const avgWaitinQueue = ((coefficientVarianceArrival + coefficientVarianceService) / 2) * ( Math.pow(utilizationFactor, Math.sqrt(2 * (numberOfServers + 1)) - 1) / (numberOfServers * (1 - utilizationFactor))) * (1 / serviceRate)
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinQueue = avgWaitinQueue * arrivalRate
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}