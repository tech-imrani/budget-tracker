const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const dateInput = document.getElementById("date");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "" || dateInput.value === "") {
    alert("Please enter all fields");
    return;
  }

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    date: dateInput.value
  };

  transactions.push(transaction);
  updateLocalStorage();
  addToDOM(transaction);
  updateValues();
  getMonthlyExpensesChart();

  text.value = "";
  amount.value = "";
  dateInput.value = "";
}

function addToDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
    ${transaction.text} (${transaction.date}) 
    <span>${sign}KSh ${Math.abs(transaction.amount).toFixed(2)}</span>
    <button onclick="removeTransaction(${transaction.id})">x</button>
  `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const incomeTotal = amounts
    .filter(val => val > 0)
    .reduce((acc, val) => acc + val, 0)
    .toFixed(2);
  const expenseTotal = (
    amounts.filter(val => val < 0).reduce((acc, val) => acc + val, 0) * -1
  ).toFixed(2);

  balance.innerText = `KSh ${total}`;
  income.innerText = `+KSh ${incomeTotal}`;
  expense.innerText = `-KSh ${expenseTotal}`;
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function init() {
  list.innerHTML = "";
  transactions.forEach(addToDOM);
  updateValues();
  getMonthlyExpensesChart();
}

function getMonthlyExpensesChart() {
  const monthly = {};

  transactions.forEach(t => {
    if (!t.date) return;

    const month = new Date(t.date).toLocaleString("default", { month: "short", year: "numeric" });

    if (!monthly[month]) {
      monthly[month] = 0;
    }

    if (t.amount < 0) {
      monthly[month] += Math.abs(t.amount);
    }
  });

  const labels = Object.keys(monthly);
  const data = Object.values(monthly);

  const ctx = document.getElementById("expensesChart").getContext("2d");

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Monthly Expenses (KSh)",
        data: data,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `KSh ${value}`
          }
        }
      }
    }
  });
}

init();
form.addEventListener("submit", addTransaction);
