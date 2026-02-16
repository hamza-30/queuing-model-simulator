function poissonPDF(lambda, x) {
  function factorial(x) {
    if (x === 0 || x === 1) return 1;
    let result = 1;
    for (let i = 2; i <= x; i++) {
      result *= i;
    }
    return result;
  }

  let pdf = (lambda ** x * Math.exp(-lambda)) / factorial(x);
  return pdf;
}

export function MG1Normal(arrivalRate, mean, standardDeviation) {
  let serviceRate = 1 / mean
  let cumulativeProbabilityArray = [];
  let interarrivalTimes = [0];
  let poissonArrivals = [0];
  let serviceTimes = [];
  let serviceStartTimes = [];
  let serviceEndTimes = [];
  let turnaroundTimes = [];
  let waitingTimes = [];
  let responseTimes = [];

  let cp = 0;
  let x = 0;

 while (cp < 0.999999) {
    cp += poissonPDF(arrivalRate, x);
    cumulativeProbabilityArray.push(Number(cp.toFixed(7)));

    x++;
  }
  let numberOfCustomers = cumulativeProbabilityArray.length;

  for(let i=1; i<numberOfCustomers; i++){
    let interarrival = -(1/arrivalRate) * Math.log(Math.random())
    interarrivalTimes.push(interarrival)
  }

  for (let i = 1; i < interarrivalTimes.length; i++) {
    poissonArrivals.push(
      poissonArrivals[poissonArrivals.length - 1] + interarrivalTimes[i],
    );
  }

  function generateNormalRandom(mean, stdDev) {
    let u1 = Math.random();
    let u2 = Math.random();
    
    let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return mean + stdDev * z0;
  }

  for (let i = 0; i < numberOfCustomers; i++) {
    let time = generateNormalRandom(mean, standardDeviation);
    time = Math.max(0.01, time);
    serviceTimes.push(time);
  }

  serviceStartTimes.push(poissonArrivals[0]);
  serviceEndTimes.push(serviceStartTimes[0] + serviceTimes[0]);
  turnaroundTimes.push(serviceEndTimes[0] - poissonArrivals[0]);
  waitingTimes.push(turnaroundTimes[0] - serviceTimes[0]);
  responseTimes.push(serviceStartTimes[0] - poissonArrivals[0]);

  for (let i = 1; i < numberOfCustomers; i++) {
    if (poissonArrivals[i] >= serviceEndTimes[i - 1]) {
      let start = poissonArrivals[i];
      let end = start + serviceTimes[i];

      serviceStartTimes.push(start);
      serviceEndTimes.push(end);
    } 
    else if (poissonArrivals[i] < serviceEndTimes[i - 1]) {
      let start = serviceEndTimes[i - 1];
      let end = start + serviceTimes[i];

      serviceStartTimes.push(start);
      serviceEndTimes.push(end);
    }

    turnaroundTimes.push(serviceEndTimes[i] - poissonArrivals[i]);
    waitingTimes.push(turnaroundTimes[i] - serviceTimes[i]);
    responseTimes.push(serviceStartTimes[i] - poissonArrivals[i]);
  }

  let utilizationRate = Number((arrivalRate / serviceRate).toFixed(2));
  let averageInterarrivalTime = Number(
    (
      interarrivalTimes.reduce((acc, num) => acc + num, 0) / numberOfCustomers
    ).toFixed(2),
  );
  let averageServiceTime = Number(
    (
      serviceTimes.reduce((acc, num) => acc + num, 0) / numberOfCustomers
    ).toFixed(2),
  );
  let averageTurnaroundTime = Number(
    (
      turnaroundTimes.reduce((acc, num) => acc + num, 0) / numberOfCustomers
    ).toFixed(2),
  );
  let averageWaitingTime = Number(
    (
      waitingTimes.reduce((acc, num) => acc + num, 0) / numberOfCustomers
    ).toFixed(2),
  );

  averageWaitingTime = averageWaitingTime == -0 ? 0 : averageWaitingTime

  let averageResponseTime = Number(
    (
      responseTimes.reduce((acc, num) => acc + num, 0) / numberOfCustomers
    ).toFixed(2),
  );
  let probabilityofWaitingCustomers = Number(
    (
      waitingTimes.filter((item) => item > 0.01).length / numberOfCustomers
    ).toFixed(2),
  );

  function fixDecimal(arr){
    return arr.map((num) => Number(num.toFixed(2)))
  }

  interarrivalTimes = fixDecimal(interarrivalTimes)
  poissonArrivals = fixDecimal(poissonArrivals)
  serviceTimes = fixDecimal(serviceTimes)
  serviceStartTimes = fixDecimal(serviceStartTimes)
  serviceEndTimes = fixDecimal(serviceEndTimes)
  turnaroundTimes = fixDecimal(turnaroundTimes)
  waitingTimes = fixDecimal(waitingTimes).map(item => item == -0 ? 0 : item)
  responseTimes = fixDecimal(responseTimes)

  return {
    cumulativeProbabilityArray,
    interarrivalTimes,
    poissonArrivals,
    serviceTimes,
    serviceStartTimes,
    serviceEndTimes,
    turnaroundTimes,
    waitingTimes,
    responseTimes,
    utilizationRate,
    averageInterarrivalTime,
    averageServiceTime,
    averageTurnaroundTime,
    averageWaitingTime,
    averageResponseTime,
    probabilityofWaitingCustomers,
  };
}

console.log(MG1Normal(0.2, 4, 1))