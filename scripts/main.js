var fuelPrice = document.getElementById('fuelPrice');
var mileage = document.getElementById('mileage');
const result = document.querySelector('.resWrap')
var distance = document.getElementById('distance');
const btn = document.getElementById('btn');
if (btn) {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
       var fuelPrices = parseInt(fuelPrice.value);
       var mileages = parseInt(mileage.value);
       var distances = parseInt(distance.value);
        var results = (distances/mileages) * fuelPrices;
        results = parseInt(results);
        result.innerHTML = `  <img src="assests/money.png" height="50px" width="50px" class="iconn">
        <p class="resultTxt">${results}</p>`;
       
    }
)}
