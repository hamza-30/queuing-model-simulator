export default function GG1NormalUniform(mean, stdDev, minimum, maximum){
    let arrivalRate = 1 / mean
    let serviceRate = 2 / (minimum + maximum)

    const utilizationFactor = arrivalRate / serviceRate

    let arrivalVariance = stdDev**2
    let serviceVariance = (maximum - minimum)**2 / 12

    let coefficientVarianceArrival = Math.sqrt(arrivalVariance) / mean
    let coefficientVarianceService = Math.sqrt(serviceVariance) / ((minimum + maximum) / 2)

    const avgNumberinQueue = (utilizationFactor**2 * (1 + coefficientVarianceService) * (coefficientVarianceArrival + utilizationFactor**2 * coefficientVarianceService)) / (2 * ( 1 - utilizationFactor) * (1 + utilizationFactor**2 * coefficientVarianceService))
    const avgWaitinQueue = avgNumberinQueue / arrivalRate
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}