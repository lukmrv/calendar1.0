const updateTimeSpan = document.querySelector(".update-time");
const eurSpan = document.querySelector(".eur-in");
const usdSpan = document.querySelector(".usd-in");
const chfSpan = document.querySelector(".chf-in");
const gbpSpan = document.querySelector(".gbp-in");

const apiCall = async () => {
  const ratesUrl = `rates`;
  const response = await fetch(ratesUrl);
  const rates = await response.json();

  const timestamp = rates.timestamp;
  const hoursAPI = new Date(timestamp * 1000).getHours();
  const minutesAPI = new Date(timestamp * 1000).getMinutes();

  updateTimeSpan.innerHTML += `${addZero(hoursAPI)}:${addZero(minutesAPI)}`;

  const EUR = rates.rates.EUR;
  const USD = rates.rates.USD;
  const CHF = rates.rates.CHF;
  const GBP = rates.rates.GBP;
  const PLN = rates.rates.PLN;

  settingValues(eurSpan, EUR, PLN);
  settingValues(usdSpan, USD, PLN);
  settingValues(chfSpan, CHF, PLN);
  settingValues(gbpSpan, GBP, PLN);
};
apiCall();

// Appeding values to HTML
const settingValues = (rateSpan, toRate, baseRate) => {
  rateSpan.innerHTML += ` ${plnTo(toRate, baseRate)}`;
};

// convarting to PLN base
const plnTo = (currency, pl) => {
  return (pl / currency).toFixed(2);
};

// adding zero in from of time if needed *re-usable*
const addZero = (num) => {
  if (num.toString().length < 2) {
    num = `0${num}`;
  }
  return num;
};
