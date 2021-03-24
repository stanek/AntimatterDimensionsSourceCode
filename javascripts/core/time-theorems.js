"use strict";

/**
 * @abstract
 */
class TimeTheoremPurchaseType {
  /**
  * @abstract
  */
  get amount() { throw new NotImplementedError(); }

  /**
  * @abstract
  */
  set amount(value) { throw new NotImplementedError(); }

  /**
  * @abstract
  */
  get currency() { throw new NotImplementedError(); }

  get cost() { return this.costBase.times(this.costIncrement.pow(this.amount)); }

  /**
   * @abstract
   */
  get costBase() { throw new NotImplementedError(); }

  /**
   * @abstract
   */
  get costIncrement() { throw new NotImplementedError(); }

  get bulkPossible() { throw new NotImplementedError(); }

  purchase(bulk) {
    if (this.currency.lt(this.cost)) return false;
    if (bulk && this.bulkPossible) {
      this.currency.purchase(this.cost.times(this.costIncrement.pow(this.bulkPossible)));
      Currency.timeTheorems.add(this.bulkPossible);
      this.amount = this.amount + this.bulkPossible;
    }
    if (!this.currency.purchase(this.cost)) return bulk;
    Currency.timeTheorems.add(1);
    this.amount = this.amount + 1;
    return true;
  }

  reset() {
    this.amount = 0;
  }
}

TimeTheoremPurchaseType.am = new class extends TimeTheoremPurchaseType {
  get amount() { return player.timestudy.amBought; }
  set amount(value) { player.timestudy.amBought = value; }
  get currency() { return Currency.antimatter; }
  get costBase() { return new Decimal("1e20000"); }
  get costIncrement() { return new Decimal("1e20000"); }
  get bulkPossible() { return Math.floor(this.currency.exponent / this.costIncrement.e) - this.amount; }
}();

TimeTheoremPurchaseType.ip = new class extends TimeTheoremPurchaseType {
  get amount() { return player.timestudy.ipBought; }
  set amount(value) { player.timestudy.ipBought = value; }
  get currency() { return Currency.infinityPoints; }
  get costBase() { return new Decimal(1); }
  get costIncrement() { return new Decimal(1e100); }
  get bulkPossible() { return Math.floor(this.currency.exponent / this.costIncrement.e + 1) - this.amount; }
}();

TimeTheoremPurchaseType.ep = new class extends TimeTheoremPurchaseType {
  get amount() { return player.timestudy.epBought; }
  set amount(value) { player.timestudy.epBought = value; }
  get currency() { return Currency.eternityPoints; }
  get costBase() { return new Decimal(1); }
  get costIncrement() { return new Decimal(2); }
  get bulkPossible() { return Math.round(this.currency.value.log2()) - this.amount; }
}();

const TimeTheorems = {
  checkForBuying(auto) {
    if (PlayerProgress.realityUnlocked() || TimeDimension(1).bought) return true;
    if (!auto) Modal.message.show("You need to buy at least 1 Time Dimension before you can purchase Time Theorems.");
    return false;
  },

  buyOne(auto = false, type) {
    if (!this.checkForBuying(auto)) return false;
    if (!TimeTheoremPurchaseType[type].purchase(false)) return false;
    return true;
  },

  buyMax(auto = false) {
    if (!this.checkForBuying(auto)) return;
    TimeTheoremPurchaseType.am.purchase(true);
    TimeTheoremPurchaseType.ip.purchase(true);
    TimeTheoremPurchaseType.ep.purchase(true);
 },

  totalPurchased() {
    return TimeTheoremPurchaseType.am.amount +
          TimeTheoremPurchaseType.ip.amount +
          TimeTheoremPurchaseType.ep.amount;
  },

  calculateTimeStudiesCost() {
    let totalCost = TimeStudy.boughtNormalTS()
      .map(ts => ts.cost)
      .reduce(Number.sumReducer, 0);
    const ecStudy = TimeStudy.eternityChallenge.current();
    if (ecStudy !== undefined) {
      totalCost += ecStudy.cost;
    }
    // Secret time study
    if (Enslaved.isRunning && player.secretUnlocks.viewSecretTS) totalCost -= 100;
    return totalCost;
  }
};
