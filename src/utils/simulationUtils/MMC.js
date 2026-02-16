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

export function MMC(arrivalRate, serviceRate, numberOfServers) {
  let cumulativeProbabilityArray = [];
  let interarrivalTimes = [0];
  let poissonArrivals = [0];
  let serviceTimes = [];
  let serviceStartTimes = [];
  let serviceEndTimes = [];
  let turnaroundTimes = [];
  let waitingTimes = [];
  let responseTimes = [];
  let serverEndTimes = new Array(numberOfServers).fill(0)
  let serverAssignments = []

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

  for (let i = 0; i < numberOfCustomers; i++) {
    let time =  -(1/serviceRate) * Math.log(Math.random());
    serviceTimes.push(time);
  }

  let assignedServer = 0
  serviceStartTimes.push(poissonArrivals[0]);
  serviceEndTimes.push(serviceStartTimes[0] + serviceTimes[0]);
  turnaroundTimes.push(serviceEndTimes[0] - poissonArrivals[0]);
  waitingTimes.push(turnaroundTimes[0] - serviceTimes[0]);
  responseTimes.push(serviceStartTimes[0] - poissonArrivals[0]);
  serverEndTimes[assignedServer] = serviceEndTimes[0]
  serverAssignments.push(assignedServer + 1)
  

  for (let i = 1; i < numberOfCustomers; i++) {
    let earliestFreeTime = Infinity
    let earliestFreeServer = -1

    for(let s = 0; s<numberOfServers; s++){
      if(serverEndTimes[s] <= poissonArrivals[i]){
        earliestFreeTime = poissonArrivals[i]
        earliestFreeServer = s
        break;
      }
    }

    if(earliestFreeServer == -1){
      earliestFreeTime = Math.min(...serverEndTimes)
      earliestFreeServer = serverEndTimes.indexOf(earliestFreeTime)
    }

    let start = Math.max(poissonArrivals[i], earliestFreeTime)
    let end = start + serviceTimes[i]

    serverEndTimes[earliestFreeServer] = end
    serverAssignments.push(earliestFreeServer + 1)
    
    serviceStartTimes.push(start)
    serviceEndTimes.push(end)

    turnaroundTimes.push(serviceEndTimes[i] - poissonArrivals[i]);
    waitingTimes.push(turnaroundTimes[i] - serviceTimes[i]);
    responseTimes.push(serviceStartTimes[i] - poissonArrivals[i]);
  }

  let utilizationRate = Number((arrivalRate / (serviceRate * numberOfServers)).toFixed(2));
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
    serverAssignments,
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
console.log(MMC(2 , 3, 4))