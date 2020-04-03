class SsvDate {
    constructor(year, month, day = 1) {
        this.year = Number(year);
        this.month = Number(month);
        this.day = Number(day);
    }
    static getCurrent() {
        const date = new Date();
        return new SsvDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
    clone() { return new SsvDate(this.year, this.month, this.day); }
    cloneAndDecrement() { return this.clone().decrement(); }
    getDay() { return this.day; }
    getMonth() { return this.month; }
    getYear() { return this.year; }
    toString() { return this.year + '-' + this.month; }
    decrement() {
        if (this.month === 1) {
            --this.year;
            this.month = 12;
        }
        else {
            --this.month;
        }
        return this;
    }
    //isSameMonth(date) { this.year === date.getYear() && this.month === date.getMonth(); }
}

module.exports = SsvDate;
