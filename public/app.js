/*

The calendar in its current form is designed exclusively for calculating the budget for the current month. That is, any amounts from previous months or from future ones are not counted in the "Available:" field - (available on the day where the data is calculated from the provided budget and costs in each day of the current month)

*/

const AVAILABLE_WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const localStorageName = "calendar-events";

class Calendar {
  constructor(options) {
    this.options = options;

    this.elements = {
      days: this.getFirstElementInsideIdByClassName("calendar-day"),
      week: this.getFirstElementInsideIdByClassName("calendar-week"),
      month: this.getFirstElementInsideIdByClassName("calendar-month"),
      year: this.getFirstElementInsideIdByClassName("calendar-current-year"),
      eventList: this.getFirstElementInsideIdByClassName(
        "current-day-events-list"
      ),
      eventField: this.getFirstElementInsideIdByClassName(
        "add-event-day-field"
      ),
      eventAddBtn: this.getFirstElementInsideIdByClassName(
        "add-event-day-field-btn"
      ),
      currentDay: this.getFirstElementInsideIdByClassName(
        "calendar-left-side-day"
      ),
      currentWeekDay: this.getFirstElementInsideIdByClassName(
        "calendar-left-side-day-of-week"
      ),
      prevYear: this.getFirstElementInsideIdByClassName(
        "calendar-change-year-slider-prev"
      ),
      nextYear: this.getFirstElementInsideIdByClassName(
        "calendar-change-year-slider-next"
      ),

      sumField: this.getFirstElementInsideIdByClassName("total-inner"),
      eventRemoveBtn: this.getFirstElementInsideIdByClassName(
        "remove-event-day-field-btn"
      ),
      budget: this.getFirstElementInsideIdByClassName("budget-input"),
      available: this.getFirstElementInsideIdByClassName(
        "available-per-day-inner"
      ),
    };

    // this.eventList = JSON.parse(localStorage.getItem(localStorageName)) || {};
    this.eventList = {};

    this.date = +new Date();
    this.options.maxDays = 40;
    this.init();
  }

  // Service methods / triggers
  eventsTrigger() {
    this.elements.prevYear.addEventListener("click", () => {
      const calendar = this.getCalendar();
      this.updateTime(calendar.pYear);
      this.drawAll();
    });

    this.elements.nextYear.addEventListener("click", () => {
      const calendar = this.getCalendar();
      this.updateTime(calendar.nYear);
      this.drawAll();
    });

    this.elements.month.addEventListener("click", (e) => {
      const calendar = this.getCalendar();
      const month = e.target.getAttribute("data-month");
      // if (!month || calendar.active.month === month) return false;
      const newMonth = new Date(calendar.active.tm).setMonth(month);
      this.updateTime(newMonth);
      this.drawAll();
    });

    // Starting date
    this.elements.days.addEventListener("click", (e) => {
      const element = e.target;
      const day = element.getAttribute("data-day");
      const month = element.getAttribute("data-month");
      const year = element.getAttribute("data-year");
      if (!day) return false;
      const strDate = `${Number(month) + 1}/${day}/${year}`;
      this.updateTime(strDate);
      this.drawAll();
    });

    // Data for current month verification compared to the month it is calculating data from
    const parsingThisMonth = this.getCalendar();
    const thisMonth = parsingThisMonth.active.month;
    const t = new Date();
    const month = t.getMonth();
    const year = t.getFullYear();

    // Adding & calculating available-per-day, inserting into the field
    const adjustAvailable = () => {
      let budgetValue = Number(this.elements.budget.value);
      const availableField = this.elements.available;

      // yeeeah....
      const daysNumber = new Date(year, month + 1, 0).getDate();
      let availablePerDay = 0;

      // Counting amount of occupied days in current month (only if current month === entry month)
      let occupiedDays = 0;
      for (let el in this.eventList) {
        if (el.split("/")[1] == month) {
          occupiedDays += 1;
        }
      }

      // console.log((budgetValue - sumTotalValue))

      availablePerDay =
        (budgetValue - sumTotalValue) / (daysNumber - occupiedDays);

      // a little restriction on input value
      if (availablePerDay > 9999) {
        alert(`Try again, but don't lie this time! We are not in Zimbabwe `);
        return;
      }

      // inserting value to 'Available' field
      if (availablePerDay > 0) {
        availableField.innerHTML = ` ${availablePerDay.toFixed(2)}`;
      } else if (sumTotalValue >= budgetValue) {
        availableField.innerHTML = ` ${availablePerDay.toFixed(2)}`;
      } else {
        availableField.innerHTML = `0`;
      }

      return daysNumber;
    };

    this.elements.budget.addEventListener("keypress", function (press) {
      if (press.key === "Enter") {
        adjustAvailable();
      }
    });

    // Adding values from input field
    const appendValue = () => {
      const fieldValue = this.elements.eventField.value;
      const dateFormatted = this.getFormattedDate(new Date(this.date));

      // a little restriction on input value
      if (fieldValue > 999999) {
        alert(`Easy, bro! There's not enought place for such amoutns`);
        return;
      }

      if (!fieldValue) return false;
      if (!this.eventList[dateFormatted]) this.eventList[dateFormatted] = [];
      this.eventList[dateFormatted].push(fieldValue);

      this.drawAll();

      console.log(this.eventList);

      sumTotal(totalAddedFrom);
      adjustAvailable();

      this.elements.eventField.value = "";

      // localStorage.setItem(localStorageName, JSON.stringify(this.eventList));
    };

    // Triggering values adding (by button and Enter)
    this.elements.eventAddBtn.addEventListener("click", appendValue);
    this.elements.eventField.addEventListener("keypress", function (press) {
      if (press.key === "Enter") {
        appendValue();
      }
    });

    // Deleting last input value
    const deleteValue = () => {
      const lastValue =
        this.eventList[this.getFormattedDate(new Date(this.date))];

      if (lastValue) {
        lastValue.pop();
        localStorage.setItem(localStorageName, JSON.stringify(this.eventList));
      }

      // if there are no values - deleting "active" key, so date is not indicated as having events
      if (lastValue && lastValue.length < 1) {
        delete this.eventList[this.getFormattedDate(new Date(this.date))];
      }

      // triggering sumTotal (sums all the values from days every time)
      sumTotal(totalAddedFrom);

      adjustAvailable();
      this.drawAll();
    };

    // Adding all the amounts from each day
    const totalAddedFrom = this.eventList;
    let sumTotalValue = 0;

    // This is being recalculated with each value entry (not good)
    const sumTotal = (obj) => {
      if (thisMonth === month) {
        let sum = 0;

        // Going through the main object after each entry & checking if target month == current month, and only if it's the same - adding value to sum
        for (let el in obj) {
          // this is how it searchs if it is the correct month
          if (el.split("/")[1] == month) {
            // Sum for each day
            let daySum = obj[el].reduce((acc, s) => {
              acc = +acc + +s;
              return acc;
            });

            // Total sum of all day's spendings
            sum = +sum + +daySum;
          }
        }

        console.log(sum);

        sumTotalValue = sum;
        return sum;
      }
    };

    // triggering last value delete
    this.elements.eventRemoveBtn.addEventListener("click", deleteValue);
  }

  // main methods for triggering other methods
  init() {
    if (!this.options.id) return false;
    this.drawAll();
    this.eventsTrigger();
  }

  // Draw Methods
  drawAll() {
    this.drawWeekDays();
    this.drawMonths();
    this.drawDays();
    this.drawYearAndCurrentDay();
    this.drawEvents();
  }

  // Adding, "rendering", input values into list
  drawEvents() {
    let calendar = this.getCalendar();
    let eventList = this.eventList[calendar.active.formatted] || [];
    let eventTemplate = [];
    let sum = Number();

    eventList.forEach((item) => {
      sum += +item;
      item = Number(item);
      item = item.toFixed(2);

      let appending = `<li class="items-added flex">+ ${+item}</li>`;
      eventTemplate += appending;
    });

    this.elements.eventList.innerHTML = eventTemplate;
    this.elements.sumField.innerHTML = `&#160;${+sum.toFixed(2)}`;
  }

  // Display the current date & day for the left side
  drawYearAndCurrentDay = () => {
    let calendar = this.getCalendar();
    this.elements.year.innerHTML = calendar.active.year;
    this.elements.currentDay.innerHTML = calendar.active.day;
    this.elements.currentWeekDay.innerHTML =
      AVAILABLE_WEEK_DAYS[calendar.active.week];
  };

  // Month list
  drawMonths = () => {
    let availableMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let monthTemplate = "";
    let calendar = this.getCalendar();
    availableMonths.forEach((month, idx) => {
      monthTemplate += `<li class="${
        idx === calendar.active.month ? "active" : ""
      }" data-month="${idx}">${month}</li>`;
    });

    this.elements.month.innerHTML = monthTemplate;
  };

  // for "rendering" names of weeks on right side
  drawWeekDays = () => {
    let weekTemplate = "";
    AVAILABLE_WEEK_DAYS.forEach((week) => {
      weekTemplate += `<li>${week.slice(0, 2)}</li>`;
    });

    this.elements.week.innerHTML = weekTemplate;
  };

  // Oh boy..
  drawDays = () => {
    let calendar = this.getCalendar();

    let latestDaysInPrevMonth = this.range(calendar.active.startWeek).map(
      (day, idx) => {
        return {
          dayNumber: this.countOfDaysInMonth(calendar.pMonth) - idx,
          month: new Date(calendar.pMonth).getMonth(),
          year: new Date(calendar.pMonth).getFullYear(),
          currentMonth: false,
        };
      }
    );

    let daysInActiveMonth = this.range(calendar.active.days).map((day, idx) => {
      let dayNumber = idx + 1;
      let today = new Date();
      return {
        dayNumber,
        today:
          today.getDate() === dayNumber &&
          today.getFullYear() === calendar.active.year &&
          today.getMonth() === calendar.active.month,
        month: calendar.active.month,
        year: calendar.active.year,
        selected: calendar.active.day === dayNumber,
        currentMonth: true,
      };
    });

    let countOfDays =
      this.options.maxDays -
      (latestDaysInPrevMonth.length + daysInActiveMonth.length);

    let daysInNextMonth = this.range(countOfDays).map((day, idx) => {
      return {
        dayNumber: idx + 1,
        month: new Date(calendar.nMonth).getMonth(),
        year: new Date(calendar.nMonth).getFullYear(),
        currentMonth: false,
      };
    });

    let days = [
      ...latestDaysInPrevMonth,
      ...daysInActiveMonth,
      ...daysInNextMonth,
    ];

    days = days.map((day) => {
      const newDayParams = day;
      const formatted = this.getFormattedDate(
        new Date(`${Number(day.month) + 1}/${day.dayNumber}/${day.year}`)
      );
      newDayParams.hasEvent = this.eventList[formatted];
      return newDayParams;
    });

    let daysTemplate = "";

    days.forEach((day) => {
      daysTemplate += `<li class="${day.currentMonth ? "" : "another-month"}${
        day.today ? " active-day " : ""
      }${day.selected ? "selected-day" : ""}${
        day.hasEvent ? " event-day" : ""
      }" data-day="${day.dayNumber}" data-month="${day.month}" data-year="${
        day.year
      }">${
        day.dayNumber.toString().length < 2
          ? `0${day.dayNumber}`
          : day.dayNumber
      }</li>`;
    });

    this.elements.days.innerHTML = daysTemplate;
  };

  // Updating starting date
  updateTime = (time) => {
    this.date = +new Date(time);
  };

  getCalendar = () => {
    let time = new Date(this.date);

    let activeList = {
      active: {
        days: this.countOfDaysInMonth(time),
        startWeek: this.getStartedDayOfWeekByTime(time),
        day: time.getDate(),
        week: time.getDay(),
        month: time.getMonth(),
        year: time.getFullYear(),
        formatted: this.getFormattedDate(time),
        tm: +time,
      },

      pMonth: new Date(time.getFullYear(), time.getMonth() - 1, 1),
      nMonth: new Date(time.getFullYear(), time.getMonth() + 1, 1),

      // Definately some magic is happening here...Goes back by 2 years instead of 1
      pYear: new Date(new Date(time).getFullYear() - 1, 0, 1),
      nYear: new Date(new Date(time).getFullYear() + 1, 1, 0),
    };

    return activeList;
  };

  countOfDaysInMonth(time) {
    let date = this.getMonthAndYear(time);
    return new Date(date.year, date.month + 1, 0).getDate();
  }

  // Adjusting beginning of the week (therefore beginning of each month)
  getStartedDayOfWeekByTime(time) {
    let date = this.getMonthAndYear(time);
    return new Date(date.year, date.month, 0).getDay();
  }

  getMonthAndYear = (time) => {
    let date = new Date(time);

    const yearAndMonth = {
      year: date.getFullYear(),
      month: date.getMonth(),
    };

    return yearAndMonth;
  };

  // Formatting the date for 'object-insert' with data entry
  getFormattedDate(date) {
    const formattedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    return formattedDate;
  }

  // Populating array for days drawing when changing months
  range(number) {
    const populationArray = new Array(number).fill().map((e, i) => e);
    return populationArray;
  }

  // Selecting all in DOM
  getFirstElementInsideIdByClassName(className) {
    const allSelectors = document
      .getElementById(this.options.id)
      .getElementsByClassName(className)[0];
    return allSelectors;
  }
}

(function () {
  new Calendar({
    id: "calendar",
  });
})();
