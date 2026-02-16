export default function MG1Normal(arrivalRate, mean, stdDev){
    let serviceRate = 1 / mean
    const utilizationFactor = arrivalRate / serviceRate

    let variance = stdDev**2

    const avgNumberinQueue = (arrivalRate**2 * variance + utilizationFactor**2) / (2 * (1 - utilizationFactor))
    const avgWaitinQueue = avgNumberinQueue / arrivalRate
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}