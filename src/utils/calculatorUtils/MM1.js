export default function MM1(arrivalRate, serviceRate){
    const utilizationFactor = Number((arrivalRate / serviceRate).toFixed(2))
    const avgNumberinQueue = utilizationFactor**2 / (1 - utilizationFactor)
    const avgWaitinQueue = avgNumberinQueue / arrivalRate
    const avgWaitinSystem = avgWaitinQueue + (1 / serviceRate)
    const avgNumberinSystem = arrivalRate * avgWaitinSystem

    return {utilizationFactor, avgNumberinQueue, avgWaitinQueue, avgWaitinSystem, avgNumberinSystem}
}