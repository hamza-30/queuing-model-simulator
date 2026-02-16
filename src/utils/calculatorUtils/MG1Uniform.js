export default function MG1Uniform(arrivalRate, minimum, maximum){
    let serviceRate = 2 / (minimum + maximum)
    const utilizationFactor = arrivalRate / serviceRate

    let variance = (maximum - minimum)**2 / 12

    const avgNumberinQueue = (arrivalRate**2 * variance + utilizationFactor**2) / (2 * (1 - utilizationFactor))
    const avgWaitinQueue = avgNumberinQueue / arrivalRate
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}