// OPEN AN INDEXEDDB DATABASE IF IT DOES NOT EXIST
const dbPromise = idb.open('currencyConverter', 1, upgradeDb => {
    upgradeDb.createObjectStore('currencyConverter');
});

// GET CURRENT DATE
let today = new Date();
let dd = today.getDate();
const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let mm = months[today.getMonth()];
let yyyy = today.getFullYear();

today = `${dd} ${mm} ${yyyy}`;
document.getElementById('current-date').innerHTML=today;

// REGISTER THE SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('./sw.js', { scope: './'})
  .then(registeration => {
      console.log('Service Worker Registered');
  }).catch(err => {
    console.log('Service Worker Not Registered');
  });
}

//FUNCTION TO CONVERT A CURRENCY
function convertCurrency(amount, fromCurrency, toCurrency) {

	fromCurrency = encodeURIComponent(fromCurrency);
	toCurrency = encodeURIComponent(toCurrency);
	const query = `${fromCurrency}_${toCurrency}`;

		dbPromise.then(db => {
			const tx = db.transaction('currencyConverter');
			const converterStore = tx.objectStore('currencyConverter');

			return converterStore.openCursor(query);
		}).then(val => {
		if(val === undefined) {
			fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${query}`)
			.then(v => v.json())
			.then(data => {
				dbPromise.then(db => {
					const tx = db.transaction('currencyConverter', 'readwrite');
					const converterStore = tx.objectStore('currencyConverter');
					converterStore.put(data, query);
					return tx.complete;
				}).then(() => {
					console.log('Rates Added');
				});
				
				let currencies = data.results;

				for(const key in currencies) {
					let rate = currencies[key].val;
					rate = amount * rate;

					document.getElementById("convertedRate").value=rate;
				}
			});
		} else {
			let currencies = val._cursor.value.results;

			for(const key in currencies) {
				let rate = currencies[key].val;
				rate = amount * rate;

				document.getElementById("convertedRate").value=rate;

			}
		}
	});
}

//GET THE LIST OF COUNTRIES
fetch(`https://free.currencyconverterapi.com/api/v5/countries`)
.then(v => v.json())
.then(data => {
  for(const key in data) {
    let key1 = data[key];
    for(const keys in key1) {
      let currencyIds = key1[keys].currencyId;
      document.getElementById("currencyList1").innerHTML += (`<option value="${currencyIds}">${currencyIds}</option>`);
      document.getElementById("currencyList2").innerHTML += (`<option value="${currencyIds}">${currencyIds}</option>`);
    }
  }
});

//FUNCTION TO SUBMIT FORM
function submit_form() {
  let currency1 = document.getElementById("currencyList1");
  let currency1_text = currency1.options[currency1.selectedIndex].text;

  let amount = document.getElementById("amount").value;

  let currency2 = document.getElementById("currencyList2");
  let currency2_text = currency2.options[currency2.selectedIndex].text;

  convertCurrency(amount, currency1_text, currency2_text);
}
