export default class Elevator {
  constructor() {
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.requests = []
    this.riders = []
    this.direction = 'up'
  }

  dispatch() {
    // Level 7: Efficient Elevator Algorithm
    // Pickup riders and dropoff riders at each floor along the way.
    while (this.requests.length > 0 || this.riders.length > 0) {
      this.updateDirection()
      this.move()
    }
  }

  updateDirection() {
    // Keep moving in current direction if there are requests/riders ahead.
    // Else, reverse direction if there are requests/riders behind.
    if (this.currentFloor === 0) {
      this.direction = 'up'
      return
    }

    // Check ahead
    let hasWorkAhead = false;
    if (this.direction === 'up') {
      hasWorkAhead = this.requests.some(req => req.currentFloor > this.currentFloor) ||
        this.riders.some(rider => rider.dropOffFloor > this.currentFloor);
    } else {
      hasWorkAhead = this.requests.some(req => req.currentFloor < this.currentFloor) ||
        this.riders.some(rider => rider.dropOffFloor < this.currentFloor);
    }

    if (!hasWorkAhead) {
      // Check behind (to switch direction)
      let hasWorkBehind = false;
      if (this.direction === 'up') {
        hasWorkBehind = this.requests.some(req => req.currentFloor < this.currentFloor) ||
          this.riders.some(rider => rider.dropOffFloor < this.currentFloor);
      } else {
        hasWorkBehind = this.requests.some(req => req.currentFloor > this.currentFloor) ||
          this.riders.some(rider => rider.dropOffFloor > this.currentFloor);
      }

      if (hasWorkBehind) {
        this.direction = this.direction === 'up' ? 'down' : 'up';
      }
    }
  }

  move() {
    if (this.direction === 'up') {
      this.currentFloor++
    } else {
      if (this.currentFloor > 0) this.currentFloor--
    }
    this.floorsTraversed++

    if (this.hasStop()) {
      this.stops++
      this.handleStop()
    }
  }

  // First come, first serve algorithm
  goToFloor(target) {
    if (typeof target === 'object') {
      this.requests.push(target);
      this.dispatch();
    } else {
      if (target > this.currentFloor) {
        this.direction = 'up';
        while (this.currentFloor < target) { this.move() }
      } else {
        this.direction = 'down'
        while (this.currentFloor > target) { this.move() }
      }
    }
  }

  // Expose for tests
  moveUp() {
    this.direction = 'up'
    this.move()
  }
  moveDown() {
    this.direction = 'down'
    this.move()
  }

  handleStop() {
    // Dropoff Riders
    const stayingRiders = []
    this.riders.forEach(rider => {
      if (rider.dropOffFloor === this.currentFloor) {
        // Not included in the staying riders
      } else {
        stayingRiders.push(rider)
      }
    })
    this.riders = stayingRiders

    // Pick up EVERYONE at this floor
    const remainingRequests = []
    this.requests.forEach(req => {
      if (req.currentFloor === this.currentFloor) {
        this.riders.push(req)
      } else {
        remainingRequests.push(req)
      }
    })
    this.requests = remainingRequests
  }

  hasStop() {
    return this.hasPickup() || this.hasDropoff()
  }

  hasPickup() {
    return this.requests.some(req => req.currentFloor === this.currentFloor)
  }

  hasDropoff() {
    return this.riders.some(rider => rider.dropOffFloor === this.currentFloor)
  }

  checkReturnToLoby() {
    if (this.riders.length === 0 && this.requests.length === 0) {
      this.returnToLoby()
      return true
    }
    return false
  }

  returnToLoby() {
    this.direction = 'down'
    while (this.currentFloor > 0) {
      this.move()
    }
  }

  reset() {
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.riders = []
    this.direction = 'up'
  }
}
