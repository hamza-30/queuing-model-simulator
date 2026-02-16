export default function GG1UniformNormal(minimum, maximum, mean, stdDev){
    let arrivalRate = 2 / (minimum + maximum)
    let serviceRate = 1 / mean

    const utilizationFactor = arrivalRate / serviceRate

    let arrivalVariance = (maximum - minimum)**2 / 12
    let serviceVariance = stdDev**2

    let coefficientVarianceArrival = Math.sqrt(arrivalVariance) / ((minimum + maximum) / 2)
    let coefficientVarianceService = Math.sqrt(serviceVariance) / mean

    const avgNumberinQueue = (utilizationFactor**2 * (1 + coefficientVarianceService) * (coefficientVarianceArrival + utilizationFactor**2 * coefficientVarianceService)) / (2 * ( 1 - utilizationFactor) * (1 + utilizationFactor**2 * coefficientVarianceService))
    const avgWaitinQueue = avgNumberinQueue / arrivalRate
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}